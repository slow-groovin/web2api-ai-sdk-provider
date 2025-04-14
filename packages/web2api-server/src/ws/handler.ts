import type { WSContext } from "hono/ws";
import type {
  RxErrorType,
  RxRegisterType,
  RxStreamErrorType,
  RxStreamType,
  RxType,
  TxErrorType,
} from "./type.js";
import { globalClientManager } from "./client-manage.js";

/*
 * Handlers for handling the message through ws from client
 */

export function handleRegister(data: RxRegisterType, ws: WSContext) {
  const { support, version } = data.content;
  globalClientManager.setClientVersion(version);
  globalClientManager.setProviders(support);
}

export function handleStream(data: RxStreamType, ws: WSContext) {
  const { content, id } = data;
  const { textPart, done } = content;

  if (done) {
    globalClientManager.enqueueChatStream(id, "", "close");
  } else if (textPart)
    globalClientManager.enqueueChatStream(id, content.textPart);
}

export function handleStreamError(data: RxStreamErrorType, ws: WSContext) {
  const { content, id } = data;
  globalClientManager.enqueueChatStream(id, content, "error");
}

export function handleClientError(data: RxErrorType, ws: WSContext) {
  console.error("received client error.", data);
}
export function handleError(data: unknown, ws: WSContext) {
  console.error("received unknown data:", data);
}
