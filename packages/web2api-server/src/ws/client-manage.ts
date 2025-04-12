/**
 * store state of client extension in memory
 */

import type { WSContext } from "hono/ws";
import type { ProviderType, TxChatType } from "./type.js";
import { uid } from "radash";
import { createManagedStream } from "@/lib/stream.js";
import type { Message } from "@/handler/completion-types.js";

/**
 * Manage the interaction with client(browser extension)
 */
class ClientManager {
  private ws: WSContext | undefined;
  private writersMap: Map<
    string,
    ReturnType<typeof createManagedStream>["writer"]
  > = new Map();
  #providers: ProviderType[];
  #clientVersion: string = "";
  constructor() {
    this.#providers = [];
  }
  setWsContext(ws: WSContext) {
    if (this.ws && this.ws.readyState === 1) {
      this.ws.close();
    }
    this.ws = ws;
  }

  get state() {
    return this.ws?.readyState ?? -1; // -1 means not connect
  }

  setProviders(providers: ProviderType[]) {
    this.#providers = providers;
  }
  get providers() {
    return this.#providers;
  }

  setClientVersion(version: string) {
    this.#clientVersion = version;
  }

  get clientVersion() {
    return this.#clientVersion;
  }

  /*
   * mutations
   */

  /**
   * send startChat to client-side
   */
  startChat(msg: Message[]) {
    if (!this.ws || this.state !== 1) {
      throw new Error("ws is not ready, state:" + this.state);
    }
    const id = "chatcmpl-" + uid(16);
    const message: TxChatType = {
      type: "startChat",
      serviceType: "moonshot",
      id: id,
      content: msg,
    };

    this.ws.send(JSON.stringify(message));
    const { stream, writer } = createManagedStream();
    this.writersMap.set(id, writer);
    return { id, stream, writer };
  }

  /**
   * transform textPart from client-side to the readStream created in `startChat`
   */
  enqueueChatStream(id: string, part: string, flag?: "close" | "error") {
    const writer = this.writersMap.get(id);
    if (!writer) {
      throw new Error("writer not exist for id:" + id);
    }
    if (flag === "close") {
      writer.close();
    } else if (flag === "error") {
      writer.error(part);
    } else {
      writer.write(part);
    }
  }
}

export const globalClientManager = new ClientManager();
