// ./messaging.ts
import { defineExtensionMessaging } from "@webext-core/messaging";
import { RxRegisterType } from "web2api-server/type";

interface ProtocolMap {
  init(options?: { force?: boolean }): Promise<void>;
  reRegister(support: RxRegisterType["content"]["support"]): Promise<void>;
}

export const { sendMessage, onMessage } =
  defineExtensionMessaging<ProtocolMap>();
