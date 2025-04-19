import { z } from "zod";

export type StorageGetter = <T>(
  key: string,
  defaultValue?: T
) => Promise<T | null | undefined>;

export type StorageSetter = <T>(key: string, value: T) => Promise<void>;
export type Maybe<T> = T | undefined | null;

export type ValueOrGetter<T> = Maybe<T> | (() => Maybe<T> | Promise<Maybe<T>>);
export type ValueSetter<T> = (value: T) => void | Promise<void>;

export type ChatgptRequestOption = {
  /**
   * custom acessToken getter, for retriving accessToken when sending request.
   ** for example, you can use chrome.storage or localStorage
   * ```text
   *  getter<------ +-----------------+
   *                |   accessToken   |
   *  setter------> +-----------------+
   *```
   * @required
   */
  accessToken: ValueOrGetter<{ value: string; savedAt: number }>;
  /**
   * custom accessToken setter, for setting accessToken when it is refreshed
   **  for example, you can use chrome.storage or localStorage
   * ```text
   *  getter<------ +-----------------+
   *                |   accessToken   |
   *  setter------> +-----------------+
   * @required
   *
   */
  accessTokenSetter: ValueSetter<string>;
  /**
   * getter for `Oai-Language` and `Oai-Device-Id` in cookies
   * @required
   *
   */
  oai: ValueOrGetter<{ oaiDeviceId: string; oaiLanguage: string }>;
  /**
   * set true to enable chat model with serach
   */
  use_search?: boolean;
};

export interface ChatRequirements {
  token?: string;
  proofofwork?: {
    required: boolean;
    seed: string;
    difficulty: string;
  };
  turnstile?: {
    required: boolean;
    dx?: string;
  };
  force_login?: boolean;
}

export const ChatRequirementsSchema = z.object({
  token: z.string().nullable().optional(),
  proofofwork: z
    .object({
      required: z.boolean(),
      seed: z.string(),
      difficulty: z.string(),
    })
    .nullable()
    .optional(),
  turnstile: z
    .object({
      required: z.boolean(),
      dx: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  force_login: z.boolean().nullable().optional(),
});

export type ConversationInput = {
  action: "next";
  messages: {
    id: string;
    author: {
      role: "user";
    };
    create_time?: number;
    content: {
      content_type: "text";
      parts: string[];
    };
    // metadata: {
    //   selected_github_repos: any[];
    //   serialization_metadata: {
    //     custom_symbol_offsets: any[];
    //   };
    //   dictation: boolean;
    // };
  }[];
  parent_message_id: "client-created-root" | null | string;
  model: "auto" | string;
  timezone_offset_min: number;
  timezone: string;
  conversation_mode: {
    kind: "primary_assistant";
  };
  suggestions: string[];
  force_use_search?: boolean;

  enable_message_followups?: boolean;
  supports_buffering: true;
  supported_encodings: ["v1"];
  // system_hints: any[];
  // supports_buffering: boolean;
  // supported_encodings: string[];
  // client_contextual_info: {
  //   is_dark_mode: boolean;
  //   time_since_loaded: number;
  //   page_height: number;
  //   page_width: number;
  //   pixel_ratio: number;
  //   screen_height: number;
  //   screen_width: number;
  // };
  // paragen_cot_summary_display_override: "allow";

  // force_paragen?: false;
  // force_rate_limit?: false;
  // history_and_training_disabled?: true;
};
