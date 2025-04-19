import {
  AISDKError,
  APICallError,
  type LanguageModelV1CallWarning,
  type LanguageModelV1Prompt,
  type LanguageModelV1StreamPart,
} from "@ai-sdk/provider";
import { storage } from "@wxt-dev/storage";
import { Logger, type LogLevel } from "./logger.js";
import {
  MoonshotWebChatSettings,
  MoonshotWebModelId,
  type KimiStreamRequest,
} from "./setting.js";
export class KimiWebRequest {
  logger: Logger;

  constructor(
    private modelId: MoonshotWebModelId,
    private settings: MoonshotWebChatSettings = {
      logLevel: "INFO",
    }
  ) {
    this.logger = new Logger(settings.logLevel);
  }
  async stream(prompt: LanguageModelV1Prompt) {
    // debugger;
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
    const { access_token, refresh_token } = await this.getToken();
    if (!access_token && !refresh_token) {
      throw new APICallError({
        message: "moonshot web not login. please login first.",
        url: "https://kimi.moonshot.cn",
        requestBodyValues: undefined,
        statusCode: 401,
        isRetryable: false,
      });
    }
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
    } else if (response.status === 401) {
      /**
       * access_token verify failed, return false to try refresh
       */
      this.logger.debug(
        "moonshot access_token may expired. Need to refresh the token."
      );
      return false;
    } else {
      throw new APICallError({
        message:
          "moonshot web unpected error. please follow the data to fix it.",
        url: "https://kimi.moonshot.cn/api",
        requestBodyValues: undefined,
        data: await response.json(),
        statusCode: response.status,
        isRetryable: false,
      });
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

    const { refresh_token: pre_refresh_token } = await this.getToken();

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
    if (response.status === 401) {
      throw new APICallError({
        message: "moonshot web login state expired. please login and retry.",
        url: "https://kimi.moonshot.cn",
        requestBodyValues: undefined,
        statusCode: 401,
        data: await response.json(),
        isRetryable: false,
      });
    } else if (response.status !== 200) {
      throw new APICallError({
        message:
          "moonshot web refresh token failed. please follow the data to fix it.",
        url: "https://kimi.moonshot.cn/api/auth/token/refresh",
        requestBodyValues: undefined,
        statusCode: 401,
        isRetryable: false,
      });
    }
    const rs = await response.json();
    const { refresh_token, access_token } = rs;
    if (!refresh_token || !access_token) {
      throw new APICallError({
        message: "moonshot web return no token.",
        url: "https://kimi.moonshot.cn/api/auth/token/refresh",
        requestBodyValues: undefined,
        statusCode: 500,
        isRetryable: false,
      });
    }
    await storage.setItems([
      { key: "local:kimi-refresh_token", value: refresh_token },
      { key: "local:kimi-access_token", value: access_token },
    ]);
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
    //@ts-ignore
    if (!globalThis?.chrome) {
      throw new AISDKError({
        name: "moonshot-web-ai-provider env error",
        message:
          "moonshot-web-ai-provider must be called in a browser runtime(such as chrome extension)",
      });
    }
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

    const body = JSON.stringify(
      KimiWebRequest.prompt2KimiReq(this.modelId, prompt, this.settings)
    );

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
      throw new APICallError({
        message: "kimi web request body is null.",
        requestBodyValues: undefined,
        url: "",
      });
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
              const parsedPart = KimiWebRequest.parseLine(line);
              if (parsedPart) controller.enqueue(parsedPart);
              else {
                //do nothing
                //sse返回的信息中有一些控制信息或者其它信息, 不是补全内容, 不做处理
              }
            }
          }
        } catch (e) {
          console.error("kimi web request failed:", e);

          controller.enqueue({
            type: "finish",
            finishReason: "error",
            usage: {
              completionTokens: 0,
              promptTokens: 0,
            },
          });
          controller.enqueue({
            type: "error",
            error: e,
          });
        } finally {
          controller.close();
          reader.releaseLock();
        }
      },
    });

    return { stream, rawCall, rawResponse, request };
  }

  /**
   * convert LanguageModelV1Prompt to KimiStreamRequest
   * since moonshot-web only support one message, if there are multi messages in prompt, they will be mered into one.
   * file/image/tool-cool/... type is not support and will be ignored.
   * @param prompt
   * @returns
   */
  private static prompt2KimiReq(
    modelId: MoonshotWebModelId,
    prompt: LanguageModelV1Prompt,
    settings: MoonshotWebChatSettings
  ): KimiStreamRequest {
    const messages: KimiStreamRequest["messages"] = [
      {
        role: "user",
        content: "",
      },
    ];
    for (const item of prompt) {
      let str = "";
      if (Array.isArray(item.content)) {
        str = item.content
          .filter((c) => c.type === "text")
          .map((c) => {
            return c.text;
          })
          .join("");
      } else if (typeof item.content === "string") {
        str = item.content;
      } else {
        throw new Error("not support content type:" + item.content);
      }
      messages[0].content += `\nrole:${item.role} context:${str}\n`;
    }

    return {
      messages: messages,
      model: modelId,
      use_search: settings.use_search ?? false,
    };
  }

  private static parseLine(
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
        } else if (parsed.event === "k1" && parsed.text) {
          return {
            type: "reasoning",
            textDelta: parsed.text,
          };
        }
      } catch (e) {
        logger?.error(e);
      }
    }
  }
}
