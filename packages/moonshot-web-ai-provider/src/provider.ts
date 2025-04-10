import { MoonshotWebLanguageModel } from "./model.js";
import {
  MoonshotWebChatSettings,
  MoonshotWebProviderSettings,
} from "./setting.js";
// model factory function with additional methods and properties
export interface MoonshotWebProvider {
  (): MoonshotWebLanguageModel;

  // explicit method for targeting a specific API in case there are several
  chat(settings?: MoonshotWebChatSettings): MoonshotWebLanguageModel;
}

// provider factory function
export function createMoonshotWebProvider(
  options: MoonshotWebProviderSettings = {}
): MoonshotWebProvider {
  const createModel = (settings: MoonshotWebChatSettings = {}) =>
    new MoonshotWebLanguageModel({ logLevel: options.logLevel });

  const provider = function () {
    if (new.target) {
      throw new Error(
        "The model factory function cannot be called with the new keyword."
      );
    }

    return createModel();
  };

  provider.chat = createModel;

  return provider;
}

/**
 * Default custom provider instance.
 */
export const moonshotWebProvider = createMoonshotWebProvider();
