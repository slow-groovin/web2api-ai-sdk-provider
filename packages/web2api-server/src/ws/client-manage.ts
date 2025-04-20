/**
 * store state of client extension in memory
 */

import type { WSContext } from "hono/ws";
import type { ModelId, TxChatType } from "./type.js";
import { uid } from "radash";
import { createManagedStream } from "@/lib/stream.js";
import type {
  AddtionalChatCompletionRequestParams,
  Message,
} from "@/handler/completion-types.js";

/**
 * Manage the interaction with client(browser extension)
 */
class ClientManager {
  private ws: WSContext | undefined;
  private writersMap: Map<
    string,
    ReturnType<typeof createManagedStream>["writer"]
  > = new Map();
  #provideModels: Record<string, string[]>;
  #clientVersion: string = "";
  constructor() {
    this.#provideModels = {};
  }
  setWsContext(ws: WSContext) {
    if (this.ws && this.ws.readyState === 1) {
      // this.ws.close();
    }
    this.ws = ws;
  }

  get state() {
    return this.ws?.readyState ?? -1; // -1 means not connect
  }

  setProvideModels(provideModels: Record<string, string[]>) {
    this.#provideModels = provideModels;
  }
  get provideModels() {
    return this.#provideModels;
  }

  includeModel(modelId: string) {
    return !!Object.values(this.#provideModels).find((arr) =>
      arr.includes(modelId)
    );
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
  startChat(
    model: ModelId,
    msg: Message[],
    addtionalParameter?: AddtionalChatCompletionRequestParams
  ) {
    if (!this.ws || this.state !== 1) {
      throw new Error("ws is not ready, state:" + this.state);
    }
    const id = "chatcmpl-" + uid(16);
    const message: TxChatType = {
      type: "startChat",
      model: model,
      id: id,
      content: msg,
      options: addtionalParameter,
    };

    this.ws.send(JSON.stringify(message));
    const { stream, writer } = createManagedStream();
    this.writersMap.set(id, writer);

    //auto delete after 5 mins
    setTimeout(() => {
      writer.tryClose();
      this.writersMap.delete(id);
    }, 300_000);
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
      this.writersMap.delete(id);
    } else if (flag === "error") {
      writer.error(part);
    } else {
      writer.write(part);
    }
  }
}

export const globalClientManager = new ClientManager();
