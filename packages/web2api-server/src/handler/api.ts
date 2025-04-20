import { serverInfo } from "@/variables.js";
import { globalClientManager } from "@/ws/client-manage.js";
import { Hono, type Handler } from "hono";

import type { ModelId } from "@/ws/type.js";

/**
 * server control/manage api
 */

export type ServerState = {
  clientVersion: string;
  serverVersion: string;
  supportModels: Record<string, string[]>;
  clientWebsocketState: number;
};
export const controlApiHandler = new Hono();
export const stateHandler: Handler = async (c) => {
  /*
   * same <Major version>.<Minor version> are compatible
   */
  const clientVersion = globalClientManager.clientVersion;
  const serverVersion = serverInfo.version;
  const supportModels = globalClientManager.provideModels;
  const clientWebsocketState = globalClientManager.state;

  return c.json({
    clientVersion,
    serverVersion,
    supportModels,
    clientWebsocketState,
  } as ServerState);
};

controlApiHandler.get("/state", stateHandler);

controlApiHandler.get("/serverFullVersion", async (c) => {
  return c.text(serverInfo.fullVersion);
});
