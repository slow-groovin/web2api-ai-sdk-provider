// https://docs.mistral.ai/getting-started/models/models_overview/
export type CustomChatModelId =
  // premier
  | "ministral-3b-latest"
  | "ministral-8b-latest"
  | "mistral-large-latest"
  | "mistral-small-latest"
  | "pixtral-large-latest"
  // free
  | "pixtral-12b-2409"
  // legacy
  | "open-mistral-7b"
  | "open-mixtral-8x7b"
  | "open-mixtral-8x22b"
  | (string & {});

export interface CustomChatSettings {
  /**
Whether to inject a safety prompt before all conversations.

Defaults to `false`.
   */
  safePrompt?: boolean;
}

// optional settings for the provider
export interface CustomProviderSettings {
  /**
Use a different URL prefix for API calls, e.g. to use proxy servers.
   */
  baseURL?: string;

  /**
API key.
   */
  apiKey?: string;

  /**
Custom headers to include in the requests.
     */
  headers?: Record<string, string>;
}

export type OpenAICompatibleCompletionConfig = {
  provider: string;
  baseURL: string;
  headers: () => Record<string, string | undefined>;
  // url: (options: { modelId: string; path: string }) => string;
  generateId: (size?: number) => string;
  // fetch?: FetchFunction;
  // errorStructure?: ProviderErrorStructure<any>;
};
