import {
  generateId,
  loadApiKey,
  withoutTrailingSlash,
} from "@ai-sdk/provider-utils";
import { CustomChatLanguageModel } from "./custom-chat-languange-model-1.js";
import {
  CustomChatModelId,
  CustomChatSettings,
  CustomProviderSettings,
} from "./custom-chat-setting-1.js";

// model factory function with additional methods and properties
export interface CustomProvider {
  (
    modelId: CustomChatModelId,
    settings?: CustomChatSettings
  ): CustomChatLanguageModel;

  // explicit method for targeting a specific API in case there are several
  chat(
    modelId: CustomChatModelId,
    settings?: CustomChatSettings
  ): CustomChatLanguageModel;
}

// provider factory function
export function createCustomProvider(
  options: CustomProviderSettings = {}
): CustomProvider {
  const createModel = (
    modelId: CustomChatModelId,
    settings: CustomChatSettings = {}
  ) =>
    new CustomChatLanguageModel(modelId, settings, {
      provider: "custom.chat",
      baseURL:
        withoutTrailingSlash(options.baseURL) ?? "https://custom.ai/api/v1",
      headers: () => ({
        Authorization: `Bearer ${loadApiKey({
          apiKey: options.apiKey,
          environmentVariableName: "CUSTOM_API_KEY",
          description: "Custom Provider",
        })}`,
        ...options.headers,
      }),
      generateId: generateId,
    });

  const provider = function (
    modelId: CustomChatModelId,
    settings?: CustomChatSettings
  ) {
    if (new.target) {
      throw new Error(
        "The model factory function cannot be called with the new keyword."
      );
    }

    return createModel(modelId, settings);
  };

  provider.chat = createModel;

  return provider;
}

/**
 * Default custom provider instance.
 */
export const customProvider = createCustomProvider();
