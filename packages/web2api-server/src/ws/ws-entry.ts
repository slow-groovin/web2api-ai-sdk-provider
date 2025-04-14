import type { WSEvents } from "hono/ws";
import { globalClientManager } from "./client-manage.js";
import { rxTypeSchema } from "./type.js";
import {
  handleClientError,
  handleError,
  handleRegister,
  handleStream,
  handleStreamError,
} from "./handler.js";
import { isString } from "radash";

export const wsHandler: WSEvents = {
  onOpen(evt, ws) {
    globalClientManager.setWsContext(ws);
  },
  onError(evt, ws) {
    globalClientManager.setWsContext(ws);
  },
  onClose(evt, ws) {
    globalClientManager.setWsContext(ws);
  },
  onMessage(evt, ws) {
    // console.debug("evt.data", evt.data, typeof evt.data);
    if (!isString(evt.data)) {
      throw new Error("data is not string.");
    }
    const result = rxTypeSchema.safeParse(JSON.parse(evt.data));

    if (result.success) {
      const data = result.data;

      switch (data.type) {
        case "register":
          handleRegister(data, ws);
          break;
        case "stream":
          handleStream(data, ws);
          break;
        case "stream-error":
          handleStreamError(data, ws);
          break;
        case "error":
          handleClientError(data, ws);
        default:
          handleError(data, ws);
      }
    } else {
      console.error("Invalid data:", result.error);
    }
  },
};
