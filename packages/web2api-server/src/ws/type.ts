import type { Message } from "@/handler/completion-types.js";
import { z } from "zod";
/*
Messages Type
*/
export type ModelId =
  | "kimi"
  | "k1"
  | "chatgpt"
  | "grok"
  | "doubao"
  | (string & {});

export type RxRegisterType = {
  type: "register";
  content: {
    version: string;
    support: ModelId[];
  };
};

export type RxStreamType = {
  type: "stream";
  id: string;
  content: {
    textPart: string;
    done?: boolean;
  };
};
export type RxStreamErrorType = {
  type: "stream-error";
  id: string;
  content: string;
};
export type RxErrorType = TxErrorType;
export type RxType =
  | RxRegisterType
  | RxStreamType
  | RxErrorType
  | RxStreamErrorType;

export type TxChatType = {
  type: "startChat";
  id: string;
  model: ModelId;
  content: Message[];
  options?: Record<string, any>;
};

export type TxErrorType = {
  type: "error";
  content: string;
};
export type TxType = TxChatType | TxErrorType;
/*
定义各个子类型的 Zod Schema
*/
const registerSchema = z.object({
  type: z.literal("register"),
  content: z.object({
    version: z.string(),
    support: z.array(z.string()), // 假设 ProviderType[] 是一个字符串数组
  }),
});

const streamSchema = z.object({
  type: z.literal("stream"),
  id: z.string(),
  content: z.object({
    textPart: z.string(),
    done: z.boolean().optional(),
  }),
});

const streamErrorSchema = z.object({
  type: z.literal("stream-error"),
  id: z.string(),
  content: z.string(),
});

const errorSchema = z.object({
  type: z.literal("error"),
  content: z.string(),
});

// 根据这些子类型，定义联合类型的 Zod Schema
export const rxTypeSchema = z.union([
  registerSchema,
  streamSchema,
  streamErrorSchema,
  errorSchema,
]);
