import {
  EmbeddingModelV1,
  ProviderV1,
  UnsupportedFunctionalityError,
} from "@ai-sdk/provider";
import { MoonshotWebLanguageModel } from "./model.js";
import type {
  MoonshotWebChatSettings,
  MoonshotWebModelId,
  MoonshotWebProviderSettings,
} from "./setting.js";

/**
 * an [@ai-sdk](https://github.com/vercel/ai) provider to chat with the Kimi-moonshot web.
 *
 *
 * **It can only run in chrome extension environment**
 */
export interface MoonshotWebProvider extends ProviderV1 {
  /**
   * same to `languageModel`
   * @param modelId
   * @param settings
   */
  (
    modelId: MoonshotWebModelId,
    settings?: MoonshotWebChatSettings
  ): MoonshotWebLanguageModel;

  /**
   * same to `languageModel`
   * @param modelId
   * @param settings
   */
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

  /**
   * get support models of provider
   */
  getModels(): Promise<string[]>;
}

/**
 *  provider factory function
 *  */
export function createMoonshotWebProvider(
  options: MoonshotWebProviderSettings = {}
): MoonshotWebProvider {
  const createModel = (
    modelId: MoonshotWebModelId,
    settings?: MoonshotWebChatSettings
  ) => {
    if (modelId === 'k1' || modelId === 'kimi') {
      console.warn(`modelId 'k1' and 'kimi' has been deprecated.`)
    }
    return new MoonshotWebLanguageModel(modelId, settings)
  };

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
    throw new UnsupportedFunctionalityError({
      functionality: "not suppported",
    });
  };
  provider.languageModel = createModel;
  provider.getModels = async () => {
    return ["k1.5-thinking", "k2", "k1.5"];
  };

  return provider;
}

/**
 * Default provider instance.
 */
export const moonshotWebProvider: MoonshotWebProvider =
  createMoonshotWebProvider();
