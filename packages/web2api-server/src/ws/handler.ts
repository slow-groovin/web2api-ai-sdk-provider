import type { WSContext } from "hono/ws";
import type {
  RxErrorType,
  RxRegisterType,
  RxStartChatType,
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

export function handleStartChat(data: RxStartChatType, ws: WSContext) {}

export function handleStream(data: RxStreamType, ws: WSContext) {
  const { content, id } = data;
  const { textPart, done } = content;
  if (done) {
    globalClientManager.enqueueChatStream(id, "", "close");
  } else if (textPart)
    globalClientManager.enqueueChatStream(id, content.textPart);
}
export function handleClientError(data: RxErrorType, ws: WSContext) {
  console.error("received unknown data:", data);
}
export function handleError(data: unknown, ws: WSContext) {
  console.error("received unknown data:", data);
  const msg: TxErrorType = {
    type: "error",
    content: "data is unknown",
  };
  ws.send(JSON.stringify(msg));
}
