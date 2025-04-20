import { type LogLevel } from "./logger.js";
/**
 * moonshot web model id, types are hard-coded
 */
export type MoonshotWebModelId = "kimi" | "k1" | (string & {});
/**
 * settings used in `.languageModel()`
 */
export type MoonshotWebChatSettings = {
  /**
Whether to inject a safety prompt before all conversations.

Defaults to `false`.
   */
  use_search?: boolean;
} & MoonshotWebProviderSettings;

// optional settings for the provider
export interface MoonshotWebProviderSettings {
  logLevel?: LogLevel;
}

export type KimiStreamRequest = {
  kimiplus_id?: "kimi" | string;
  extend?: {
    sidebar: true | false;
  };
  model: MoonshotWebModelId;
  use_search: boolean;
  messages: {
    role: "user" | "tool" | "system" | "assistant";
    content: string;
  }[];
  refs?: any[]; //附件
  history?: any[]; //无用
  scene_labels?: any[]; //无用
};
