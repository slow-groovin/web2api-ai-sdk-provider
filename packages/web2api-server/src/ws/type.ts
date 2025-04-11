import { z } from "zod";
/*
Messages Type
*/
export type ProviderType = "moonshot" | "chatgpt" | "grok" | "doubao";

const providerTypeEnum = ["moonshot", "chatgpt", "grok", "doubao"] as const;
export type RxRegisterType = {
  type: "register";
  content: {
    version: string;
    support: ProviderType[];
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

export type RxStartChatType = {
  type: "startChat";
  id: string;
  content: {};
};
export type RxErrorType = TxErrorType;
export type RxType =
  | RxRegisterType
  | RxStreamType
  | RxStartChatType
  | RxErrorType;

export type TxChatType = {
  type: "startChat";
  id: string;
  serviceType: ProviderType;
  content: { role: "user" | "system"; content: string }[];
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
    support: z.array(z.enum(providerTypeEnum)), // 假设 ProviderType[] 是一个字符串数组
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

const startChatSchema = z.object({
  type: z.literal("startChat"),
  id: z.string(),
  content: z.object({}),
});
const errorSchema = z.object({
  type: z.literal("error"),
  content: z.string(),
});
// 根据这些子类型，定义联合类型的 Zod Schema
export const rxTypeSchema = z.union([
  registerSchema,
  streamSchema,
  startChatSchema,
  errorSchema,
]);
