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
  APICallError,
} from "@ai-sdk/provider";
import { MoonshotWebChatSettings } from "./setting";
import { KimiWebRequest } from "./request";

export class MoonshotWebLanguageModel implements LanguageModelV1 {
  specificationVersion: "v1" = "v1";
  provider: string = "v1";
  defaultObjectGenerationMode: LanguageModelV1ObjectGenerationMode;
  supportsImageUrls?: boolean | undefined;
  supportsStructuredOutputs?: boolean | undefined;
  /**
   * need no modelId
   */
  modelId: string = "";
  constructor(private settings?: MoonshotWebChatSettings) {
    //donothing
  }
  supportsUrl?(url: URL): boolean {
    throw new Error("Method not implemented.");
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
    throw new Error("not impl.");
  }

  doStream(options: LanguageModelV1CallOptions): PromiseLike<{
    stream: ReadableStream<LanguageModelV1StreamPart>;
    rawCall: { rawPrompt: unknown; rawSettings: Record<string, unknown> };
    rawResponse?: { headers?: Record<string, string> };
    request?: { body?: string };
    warnings?: Array<LanguageModelV1CallWarning>;
  }> {
    console.log("options", options);
    const { prompt } = options;
    const kimiReq = new KimiWebRequest({
      logLevel: this.settings?.logLevel,
    });

    return kimiReq.stream(prompt);
  }
}
