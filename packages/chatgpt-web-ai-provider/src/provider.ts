import {
  EmbeddingModelV1,
  ProviderV1,
  UnsupportedFunctionalityError,
} from "@ai-sdk/provider";
import { ChatgptWebLanguageModel } from "./model.js";
import type {
  ChatgptWebModelId,
  ChatgptWebProviderSettings,
  ChatgptWebModelSetting,
} from "./setting.js";
import { ChatgptWebRequest } from "./request/request.js";

/**
 * ChatgptWebProvider interface, extends the ProviderV1 interface and provides methods for creating and managing ChatgptWebLanguageModel instances.
 */
export interface ChatgptWebProvider extends ProviderV1 {
  /**
   * Factory function for creating ChatgptWebLanguageModel instances.
   */
  (
    modelId: ChatgptWebModelId,
    settings?: ChatgptWebModelSetting
  ): ChatgptWebLanguageModel;

  /**
   * same to languageModel
   */
  chatModel(
    modelId: ChatgptWebModelId,
    settings?: ChatgptWebModelSetting
  ): ChatgptWebLanguageModel;

  /**
   * Explicit method for specifying the language model API to use.
   */
  languageModel(
    modelId: ChatgptWebModelId,
    settings?: ChatgptWebModelSetting
  ): ChatgptWebLanguageModel;

  /**
   * Gets the list of supported models.
   */
  getModels(): Promise<string[]>;

  /**
   * @deprecated not support.
   */
  textEmbeddingModel(modelId: ChatgptWebModelId): EmbeddingModelV1<string>;
}

/**
 * Factory function for creating ChatgptWebProvider instances.
 */
export function createChatgptWebProvider(
  providerSettings: ChatgptWebProviderSettings
): ChatgptWebProvider {
  /**
   * Internal function for creating ChatgptWebLanguageModel instances.
   */
  const createModel = (
    modelId: ChatgptWebModelId,
    modelSettings?: ChatgptWebModelSetting
  ) =>
    new ChatgptWebLanguageModel(modelId, {
      ...providerSettings,
      ...modelSettings,
    });

  /**
   * ChatgptWebProvider instance, returned as a factory function.
   */
  const provider = function (
    modelId: ChatgptWebModelId,
    settings?: ChatgptWebModelSetting
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
    throw new UnsupportedFunctionalityError({ functionality: "embeddings" });
  };
  provider.languageModel = createModel;
  provider.getModels = async () => {
    const request = new ChatgptWebRequest(providerSettings);
    return await request.getModels();
  };
  return provider;
}
