import { generateProofToken } from "./pow.js";
import {
  CriticalValueMissError,
  ResponseStatusError,
  NoAuthError,
} from "./errors.js";
import {
  ChatgptRequestOption,
  ChatRequirements,
  ConversationInput,
} from "./types.js";
import { resolveValue, setValue } from "./utils.js";
import { TOKEN_DURATION } from "./variables.js";
import {
  type LanguageModelV1CallWarning,
  type LanguageModelV1StreamPart,
  type LanguageModelV1Prompt,
} from "@ai-sdk/provider";
import { Logger, LogLevel } from "../logger.js";
import { ChatgptWebModelConstructSettings } from "../setting.js";

/**
 * @class ChatgptWebRequest
 * This class is responsible for handling web requests to the ChatGPT service.
 */
export class ChatgptWebRequest {
  private option: ChatgptRequestOption & ChatgptWebModelConstructSettings;
  private logger: Logger;
  constructor(option: ChatgptRequestOption & { logLevel?: LogLevel }) {
    if (!option.accessToken)
      throw new CriticalValueMissError(
        "accessToken getter",
        "ConstructorOption"
      );
    if (!option.accessTokenSetter)
      throw new CriticalValueMissError(
        "accessToken setter",
        "ConstructorOption"
      );
    if (!option.oai)
      throw new CriticalValueMissError("oai getter", "ConstructorOption");

    this.logger = new Logger(option.logLevel);
    this.logger.debug("init ChatGPTRequestOption.");
    this.option = option;
    // this.option = mergeDefault(option, defaultOption);
  }

  /**
   * @async conversation
   * first send a requirements request to get pow.
   * then sends a conversation request to the ChatGPT service and returns a stream of response parts.
   * @param {object} opt - The options for the conversation, including the model and prompt.
   * @returns {object} - An object containing the stream, raw call, raw response, request, and warnings.
   */
  async conversation(opt: {
    model: string;
    prompt: LanguageModelV1Prompt;
  }): Promise<{
    stream: ReadableStream<LanguageModelV1StreamPart>;
    rawCall: { rawPrompt: unknown; rawSettings: Record<string, unknown> };
    rawResponse?: { headers?: Record<string, string> };
    request?: { body?: string };
    warnings?: Array<LanguageModelV1CallWarning>;
  }> {
    const body = JSON.stringify(buildConversationInput(opt));
    const rawCall = { rawPrompt: opt.prompt, rawSettings: {} };
    let rawResponse: { headers?: Record<string, string> } = { headers: {} };
    let request: { body?: string } = { body };
    const headers = await this.getHeadersWithPow();

    this.logger.debug("begin to fetch...");
    const rsp = await fetch("https://chatgpt.com/backend-api/conversation", {
      method: "POST",
      body: body,
      headers: {
        ...headers,
        Accept: "text/event-stream",
      },
    });
    rsp.headers.forEach((value, key) => {
      rawResponse.headers![key] = value;
    });
    if (!rsp.body) {
      throw new Error("chatgpt web request body is null.");
    }

    const stream = new ReadableStream<LanguageModelV1StreamPart>({
      async start(controller) {
        const reader = rsp.body!.getReader();

        try {
          while (true) {
            const { done, value } = await reader.read();

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
            const part = ChatgptWebRequest.parseSSEChunk(value);
            if (part) {
              controller.enqueue(part);
            }
          }
        } catch (e) {
          console.error("chatgpt web request failed:", e);

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
   * retrieves the access token value if token not exist or expired.
   * @returns {Promise<string>} - The access token value.
   */
  async getTokenValue(): Promise<string> {
    const accessToken = await resolveValue(this.option?.accessToken);

    if (accessToken) {
      const duration = Date.now() - accessToken.savedAt;
      if (duration < TOKEN_DURATION) {
        return accessToken.value;
      }
    }
    const resp = await fetch("https://chatgpt.com/api/auth/session");
    if (resp.status !== 200) {
      throw new ResponseStatusError(
        `Get token failed, HTTP status ${resp.status}. body:` +
          (await resp.text())
      );
    }
    const data = await resp.json().catch(() => ({}));
    if (!data.accessToken) {
      //no auth
      throw new NoAuthError("Get token failed, no token in response");
    }
    await setValue(data.accessToken, this.option.accessTokenSetter);
    return data.accessToken;
  }

  /**
   * fetch `/models`  retrieves the available models from the ChatGPT service.
   * @returns {Promise<string[]>} - A list of model slugs.
   */
  async getModels(): Promise<string[]> {
    const headers = await this.getHeaders();
    const resp = await fetch("https://chatgpt.com/backend-api/models", {
      headers: headers,
    });
    const fallbackModels = [
      "text-davinci-002-render-sha",
      "gpt-4o",
      "gpt-4o-mini",
      "o4-mini",
      "auto",
    ];
    if (resp.status !== 200) {
      this.logger.warn(
        `get models failed. status: ${resp.status}, error:${await resp.text()}`
      );
      return fallbackModels;
    }
    try {
      const data = await resp.json();
      return data.models
        .map((d: any) => d.slug)
        .filter((s: string) => typeof s === "string");
    } catch (e) {
      this.logger.error(e);
      return fallbackModels;
    }
  }

  /**
   *  fetches the chat requirements from the ChatGPT service.
   * @returns {Promise<ChatRequirements>} - The chat requirements.
   */
  async fetchRequirements(): Promise<ChatRequirements> {
    const resp = await fetch(
      "https://chatgpt.com/backend-api/sentinel/chat-requirements",
      {
        headers: await this.getHeaders(),
        // body: JSON.stringify({
        //   p: generateProofToken(Math.random() + '', '0fffff')
        // }),
        method: "POST",
      }
    );
    if (resp.status !== 200) {
      throw new ResponseStatusError(
        `Get requirements failed, HTTP status ${resp.status}. body:` +
          (await resp.text())
      );
    }
    const data = (await resp.json()) as ChatRequirements;
    return data;
  }

  /**
   * retrieves the headers
   * @private
   * @returns {Promise<Headers>} - The headers for the ChatGPT service.
   */
  private async getHeaders() {
    const oai = await resolveValue(this.option.oai);
    if (!oai) {
      throw new CriticalValueMissError("oai", "Cookie");
    }
    const { oaiDeviceId, oaiLanguage } = oai;
    const accessTokenValue: string = await this.getTokenValue();
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessTokenValue}`,
      ...(oaiDeviceId && { "Oai-Device-Id": oaiDeviceId }),
      "Oai-Language": oaiLanguage ?? "en-US",
      "sec-fetch-site": "same-origin",
    };
  }
  /**
   *retrieves the headers with proof of work for the ChatGPT service.
   * @private
   * @returns {Promise<Headers>} - The headers with proof of work for the ChatGPT service.
   */
  private async getHeadersWithPow() {
    const { proofofwork, token: requirementToken } =
      await this.fetchRequirements();
    let proofToken: string = "";
    if (proofofwork) {
      const { seed, required, difficulty } = proofofwork;
      if (required) {
        proofToken = generateProofToken(seed, difficulty);
      }
    }

    return {
      ...(await this.getHeaders()),
      ...(proofToken && { "Openai-Sentinel-Proof-Token": proofToken }),
      ...(requirementToken && {
        "Openai-Sentinel-Chat-Requirements-Token": requirementToken,
      }),
    };
  }

  /**
   * parses a Server-Sent Events (SSE) chunk(may be multiline).
   * @param {Uint8Array<ArrayBufferLike> | undefined} chunk - The SSE chunk to parse.
   * @param {Logger} logger - The logger to use.
   * @returns {LanguageModelV1StreamPart | undefined} - The parsed SSE chunk.
   */
  static parseSSEChunk(
    chunk: Uint8Array<ArrayBufferLike> | undefined,
    logger: Logger = new Logger("debug")
  ): LanguageModelV1StreamPart | undefined {
    let textDelta = "";

    const decoder = new TextDecoder();
    const str = decoder.decode(chunk);
    const lines = str.split("\n").filter(Boolean);

    for (const line of lines) {
      if (line.startsWith("data:")) {
        const data = line.substring(5).trim().replace(/\n/g, "\\n");
        if (!data) {
          logger.warn("unexpect sse line:", line);
        } else if (data === "[DONE]") {
          //skip
          continue;
        } else {
          try {
            const parsed = JSON.parse(data);
            textDelta += extractTextFromObj(parsed);
          } catch (e) {
            logger.error(
              "parse chunk line failed. line is:",
              line,
              " error:",
              e
            );
          }
        }
      }
    }
    /**
     * extract text from sse object
     */
    function extractTextFromObj(obj: any) {
      //traditional message
      if (obj?.message?.content?.content_type === "text") {
        return obj?.message?.content?.parts?.[0];
      }
      //v
      else if (obj.v && typeof obj.v === "string") {
        return obj.v;
      } else if (obj.o && obj.o === "patch") {
        return extractTextFromObj(obj.v[0]);
      } else {
        // logger.warn("unkown chunk line object", obj);
        return "";
      }
    }

    return {
      type: "text-delta",
      textDelta: textDelta,
    };
  }
}

/**
 * build chatgpt web `/conversiion` request body from ai-sdk LanguageModelV1Prompt
 * @param partOption
 * @returns
 */
export function buildConversationInput(partOption: {
  model: string;
  prompt: LanguageModelV1Prompt;
  use_search?: boolean;
}): ConversationInput {
  const { model, prompt, use_search } = partOption;
  const body: ConversationInput = {
    action: "next",
    // model: 'text-davinci-002-render-sha',
    model: model || "auto",
    messages: [
      {
        id: crypto.randomUUID(),
        author: {
          role: "user",
        },
        content: {
          content_type: "text",
          parts: [promptToText(prompt)],
        },
        create_time: Date.now() / 1000,
      },
    ],
    conversation_mode: {
      kind: "primary_assistant",
    },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezone_offset_min: new Date().getTimezoneOffset(),
    parent_message_id: "client-created-root",
    enable_message_followups: false,
    supports_buffering: true,
    supported_encodings: ["v1"],
    // force_paragen: false,
    // force_rate_limit: false,
    // history_and_training_disabled: true,
    suggestions: isThinkingModel(model) ? ["reason"] : [],
    ...(use_search ? { force_use_search: true } : {}),
  };
  return body;
}

export function isThinkingModel(model: string): boolean {
  return /^o\d/.test(model);
}

/**
 * convert texts within LanguageModelV1Prompt to single text
 * @param prompt
 * @returns
 */
function promptToText(prompt: LanguageModelV1Prompt) {
  let parts: { role: string; text: string }[] = [];
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
    parts.push({ role: item.role, text: str });
  }
  if (parts.length === 1) {
    return parts[0].text;
  } else {
    return parts.map((p) => `[${p.role}]${p.text}`).join("\n");
  }
}
