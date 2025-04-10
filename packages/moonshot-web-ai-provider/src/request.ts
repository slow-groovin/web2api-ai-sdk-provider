import { storage } from "@wxt-dev/storage";
import { Logger, LogLevel } from "./logger";
import {
  APICallError,
  LanguageModelV1CallWarning,
  LanguageModelV1Prompt,
  LanguageModelV1StreamPart,
} from "@ai-sdk/provider";
import { KimiStreamRequest } from "./setting";
import { list, sleep } from "radash";
export class KimiWebRequest {
  logger: Logger;

  constructor(
    options: { logLevel?: LogLevel } = {
      logLevel: "INFO",
    }
  ) {
    this.logger = new Logger(options.logLevel);
  }
  async stream(prompt: LanguageModelV1Prompt) {
    if (!(await this.detectIfReady())) {
      await this.refreshToken();
    }
    const { id } = await this.createChat();
    return this.sendMessage({ prompt, chatId: id });
  }

  /**
   * detect if request is ready by user api
   */
  async detectIfReady() {
    const { access_token } = await this.getToken();
    const response = await fetch("https://kimi.moonshot.cn/api/user", {
      headers: {
        accept: "*/*",
        Authorization: `Bearer ${access_token}`,
        Origin: "https://kimi.moonshot.cn",
      },
      method: "GET",
    });
    if (response.status === 200) {
      this.logger.debug("moonshot web is ready");
      return true;
    } else {
      this.logger.debug("moonshot web is NOT ready. Need to refresh token!.");
      return false;
    }
  }
  /**
   * refresh access token
   * @returns {Promise<{access_token: string, refresh_token: string}>} 包含 access_token 和 refresh_token 的 Promise
   */
  async refreshToken(): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    this.logger.debug("refresh token");
    const pre_refresh_token = await storage.getItem<string>(
      "local:kimi-refresh_token"
    );

    const response = await globalThis.fetch(
      "https://kimi.moonshot.cn/api/auth/token/refresh",
      {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${pre_refresh_token}`,
          Origin: "https://kimi.moonshot.cn",
        },
        method: "GET",
      }
    );
    const rs = await response.json();
    const { refresh_token, access_token } = rs;
    if (refresh_token && access_token) {
      await storage.setItems([
        { key: "local:kimi-refresh_token", value: refresh_token },
        { key: "local:kimi-access_token", value: access_token },
      ]);
    }
    return { refresh_token, access_token };
  }

  async createChat() {
    const { access_token } = await this.getToken();
    const resp = await fetch("https://kimi.moonshot.cn/api/chat", {
      headers: {
        accept: "*/*",
        "content-type": "application/json",
        Authorization: `Bearer ${access_token}`,
        Origin: "https://kimi.moonshot.cn",
      },
      method: "POST",
      body: JSON.stringify({ name: "未命名会话", is_example: false }),
    });
    const rs = await resp.json();
    const { id, name, created_at } = rs;
    this.logger.info("created chat: ", id);

    return rs;
  }

  async getToken() {
    const refresh_token = await storage.getItem("local:kimi-refresh_token");
    const access_token = await storage.getItem("local:kimi-access_token");
    return { refresh_token, access_token };
  }

  async sendMessage(opt: {
    prompt: LanguageModelV1Prompt;
    chatId: string;
  }): Promise<{
    stream: ReadableStream<LanguageModelV1StreamPart>;
    rawCall: { rawPrompt: unknown; rawSettings: Record<string, unknown> };
    rawResponse?: { headers?: Record<string, string> };
    request?: { body?: string };
    warnings?: Array<LanguageModelV1CallWarning>;
  }> {
    const { prompt, chatId: chatId } = opt;
    const { access_token } = await this.getToken();

    const body = JSON.stringify(prompt2KimiReq(prompt));

    //构建返回对象
    const rawCall = { rawPrompt: prompt, rawSettings: {} };
    let rawResponse: { headers?: Record<string, string> } = {};
    let request: { body?: string } = { body };

    // 建立 SSE 连接
    this.logger.debug("begin to fetch...");
    const response = await fetch(
      `https://kimi.moonshot.cn/api/chat/${chatId}/completion/stream`,
      {
        method: "POST",
        headers: {
          accept: "*/*",
          "content-type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body,
      }
    );

    rawResponse.headers = {};
    response.headers.forEach((value, key) => {
      rawResponse.headers![key] = value;
    });

    if (!response.body) {
      throw new Error("body is null");
    }

    const stream = new ReadableStream<LanguageModelV1StreamPart>({
      async start(controller) {
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            const chunk = decoder.decode(value);

            if (done) {
              controller.enqueue({
                type: "finish",
                finishReason: "stop",
                usage: {
                  completionTokens: 0,
                  promptTokens: 0,
                },
              });
              break;
            }

            const lines = chunk.split("\n");

            for (const line of lines) {
              const parsedPart = parseLine(line);
              if (parsedPart) controller.enqueue(parsedPart);
              else {
                //do nothing
                //sse返回的信息中有一些控制信息或者其它信息, 不是补全内容, 不做处理
              }
            }
          }
        } catch (e) {
          controller.error(e);
        } finally {
          controller.close();
          reader.releaseLock();
        }
      },
    });

    return { stream, rawCall, rawResponse, request };
  }
}

function prompt2KimiReq(prompt: LanguageModelV1Prompt): KimiStreamRequest {
  const messages: KimiStreamRequest["messages"] = [];
  for (const item of prompt) {
    let str = "";
    if (Array.isArray(item.content)) {
      str = item.content.map((c) => (c.type === "text" ? c.text : "")).join("");
    } else if (typeof item.content === "string") {
      str = item.content;
    } else {
      throw new Error("not support content type:" + item.content);
    }
    messages.push({
      role: item.role,
      content: str,
    });
  }

  return {
    messages: messages,
    model: "kimi",
    use_search: false,
  };
}
function parseLine(
  line: string,
  logger?: Logger
): LanguageModelV1StreamPart | undefined {
  if (line.startsWith("data:")) {
    const data = line.substring(5).trim();
    try {
      const parsed = JSON.parse(data);
      if (parsed.event === "cmpl" && parsed.text) {
        return {
          type: "text-delta",
          textDelta: parsed.text,
        };
      }
    } catch (e) {
      logger?.error(e);
    }
  }
}
