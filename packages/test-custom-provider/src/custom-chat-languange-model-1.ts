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
import {
  CustomChatModelId,
  CustomChatSettings,
  OpenAICompatibleCompletionConfig,
} from "./custom-chat-setting-1";

export class CustomChatLanguageModel implements LanguageModelV1 {
  specificationVersion: "v1" = "v1";
  provider: string = "v1";
  defaultObjectGenerationMode: LanguageModelV1ObjectGenerationMode;
  supportsImageUrls?: boolean | undefined;
  supportsStructuredOutputs?: boolean | undefined;

  constructor(
    public modelId: CustomChatModelId,
    private settings: CustomChatSettings,
    private config: OpenAICompatibleCompletionConfig
  ) {}
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
    const { prompt, headers, ...rawSettings } = options;
    const text = "-text";
    console.log("prompt", JSON.stringify(prompt, null, 2));
    console.log("headers", this.config.headers());
    return {
      text,
      toolCalls: [],
      finishReason: "stop",
      usage: {
        promptTokens: 123,
        completionTokens: 567,
      },
      rawCall: { rawPrompt: prompt, rawSettings: rawSettings },
      rawResponse: {
        headers: {},
        // body: 'body',
      },
      request: { body: JSON.stringify({}) },
      // response: getResponseMetadata(response),
      warnings: [],
    };
  }
  doStream(options: LanguageModelV1CallOptions): PromiseLike<{
    stream: ReadableStream<LanguageModelV1StreamPart>;
    rawCall: { rawPrompt: unknown; rawSettings: Record<string, unknown> };
    rawResponse?: { headers?: Record<string, string> };
    request?: { body?: string };
    warnings?: Array<LanguageModelV1CallWarning>;
  }> {
    throw new Error("Method not implemented.");
  }
}
