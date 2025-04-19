import { type LogLevel } from "./logger.js";
import { ChatgptRequestOption } from "./request/types.js";

export type ChatgptWebModelId =
  | "gpt-4o"
  | "gpt-4o-mini"
  | "auto"
  | (string & {});

/**
 * for  model constructor
 */
export type ChatgptWebModelConstructSettings = ChatgptWebProviderSettings;
/**
 * settings for create model
 */
export type ChatgptWebModelSetting = {
  /**
   * set true to enable chat model with serach
   */
  use_search?: boolean;
};

/**
 * provider create option
 */
export type ChatgptWebProviderSettings = {
  logLevel?: LogLevel;
} & ChatgptRequestOption;
