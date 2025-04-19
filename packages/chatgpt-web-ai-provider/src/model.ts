import {
  LanguageModelV1,
  LanguageModelV1CallOptions,
  LanguageModelV1CallWarning,
  LanguageModelV1FinishReason,
  LanguageModelV1FunctionToolCall,
  LanguageModelV1LogProbs,
  LanguageModelV1ObjectGenerationMode,
  LanguageModelV1ProviderMetadata,
  LanguageModelV1StreamPart,
} from "@ai-sdk/provider";
import type {
  ChatgptWebModelConstructSettings,
  ChatgptWebModelId,
} from "./setting.js";
import { ChatgptWebRequest } from "./request/request.js";

export class ChatgptWebLanguageModel implements LanguageModelV1 {
  specificationVersion: "v1" = "v1";
  provider: string = "v1";
  defaultObjectGenerationMode: LanguageModelV1ObjectGenerationMode = undefined;
  supportsImageUrls?: boolean | undefined = false;
  supportsStructuredOutputs?: boolean | undefined = false;

  constructor(
    public readonly modelId: ChatgptWebModelId,
    private settings: ChatgptWebModelConstructSettings
  ) {
    //donothing
  }
  supportsUrl?(url: URL): boolean {
    return false;
  }

  async doGenerate(options: LanguageModelV1CallOptions): Promise<{
    text?: string;
    reasoning?: string;
    toolCalls?: Array<LanguageModelV1FunctionToolCall>;
    finishReason: LanguageModelV1FinishReason;
    usage: { promptTokens: number; completionTokens: number };
    rawCall: { rawPrompt: unknown; rawSettings: Record<string, unknown> };
    rawResponse?: { headers?: Record<string, string> };
    request?: { body?: string };
    response?: { id?: string; timestamp?: Date; modelId?: string };
    warnings?: LanguageModelV1CallWarning[];
    providerMetadata?: LanguageModelV1ProviderMetadata;
    logprobs?: LanguageModelV1LogProbs;
  }> {
    const { prompt } = options;
    const webReq = new ChatgptWebRequest(this.settings);
    let text = "";
    const { stream, rawCall, rawResponse, request, warnings } =
      await webReq.conversation({ model: this.modelId, prompt });
    const reader = stream.getReader();
    let finishReason: LanguageModelV1FinishReason = "unknown";
    let reasonning = "";
    let promptTokens = 0;
    let completionTokens = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      if (value.type === "finish") {
        finishReason = value.finishReason;
      } else if (value.type === "text-delta") {
        text += value.textDelta;
      } else if (value.type === "reasoning") {
        reasonning += value.textDelta;
      } else if (value.type === "error") {
        throw value.error;
      }
    }

    return {
      text: text,
      finishReason: finishReason,
      reasoning: reasonning ? reasonning : undefined,
      usage: { promptTokens: promptTokens, completionTokens: completionTokens },
      rawCall: rawCall,
      rawResponse: rawResponse,
      request: request,
      response: { modelId: this.modelId },
      warnings: warnings,
    };
  }

  doStream(options: LanguageModelV1CallOptions): PromiseLike<{
    stream: ReadableStream<LanguageModelV1StreamPart>;
    rawCall: { rawPrompt: unknown; rawSettings: Record<string, unknown> };
    rawResponse?: { headers?: Record<string, string> };
    request?: { body?: string };
    warnings?: Array<LanguageModelV1CallWarning>;
  }> {
    // console.log("options", options);
    try {
      const { prompt } = options;
      const webReq = new ChatgptWebRequest(this.settings);
      return webReq.conversation({ model: this.modelId, prompt });
    } catch (e) {
      console.error("e", e);
      throw e;
    }
  }
}
