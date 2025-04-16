import { AISDKError, EmbeddingModelV1, ProviderV1 } from "@ai-sdk/provider";
import { MoonshotWebLanguageModel } from "./model.js";
import type {
  MoonshotWebChatSettings,
  MoonshotWebModelId,
  MoonshotWebProviderSettings,
} from "./setting.js";
// model factory function with additional methods and properties
export interface MoonshotWebProvider extends ProviderV1 {
  (
    modelId: MoonshotWebModelId,
    settings?: MoonshotWebChatSettings
  ): MoonshotWebLanguageModel;

  // explicit method for targeting a specific API in case there are several
  chatModel(
    modelId: MoonshotWebModelId,
    settings?: MoonshotWebChatSettings
  ): MoonshotWebLanguageModel;
  languageModel(
    modelId: MoonshotWebModelId,
    settings?: MoonshotWebChatSettings
  ): MoonshotWebLanguageModel;
  /**
   * @deprecated not support.
   */
  textEmbeddingModel(
    modelId: MoonshotWebModelId,
    settings?: MoonshotWebChatSettings
  ): EmbeddingModelV1<string>;
}

// provider factory function
export function createMoonshotWebProvider(
  options: MoonshotWebProviderSettings = {}
): MoonshotWebProvider {
  const createModel = (
    modelId: MoonshotWebModelId,
    settings?: MoonshotWebChatSettings
  ) => new MoonshotWebLanguageModel(modelId, settings);

  const provider = function (
    modelId: MoonshotWebModelId,
    settings?: MoonshotWebChatSettings
  ) {
    if (new.target) {
      throw new Error(
        "The model factory function cannot be called with the new keyword."
      );
    }

    return createModel(modelId, settings);
  };

  provider.chat = createModel;
  provider.chatModel = createModel;
  provider.languageModel = createModel;
  provider.textEmbeddingModel = () => {
    throw new AISDKError({
      name: " not supported",
      message: " this model is not supported.",
    });
  };
  provider.languageModel = createModel;

  return provider;
}

/**
 * Default custom provider instance.
 */
export const moonshotWebProvider: MoonshotWebProvider =
  createMoonshotWebProvider();
