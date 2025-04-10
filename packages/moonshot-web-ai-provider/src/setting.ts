import { LogLevel } from "./logger";

export interface MoonshotWebChatSettings {
  /**
Whether to inject a safety prompt before all conversations.

Defaults to `false`.
   */
  safePrompt?: boolean;
  logLevel?: LogLevel;
}

// optional settings for the provider
export interface MoonshotWebProviderSettings {
  logLevel?: LogLevel;
}

export type KimiStreamRequest = {
  kimiplus_id?: "kimi" | string;
  extend?: {
    sidebar: true | false;
  };
  model: "kimi" | "k1";
  use_search: boolean;
  messages: {
    role: "user" | "tool" | "system" | "assistant";
    content: string;
  }[];
  refs?: any[]; //附件
  history?: any[]; //无用
  scene_labels?: any[]; //无用
};
