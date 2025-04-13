import { serverInfo } from "@/variables.js";
import { globalClientManager } from "@/ws/client-manage.js";
import { Hono, type Handler } from "hono";

/**
 * server control/manage api
 */
export const controlApiHandler = new Hono();
export const stateHandler: Handler = async (c) => {
  /*
   * same <Major version>.<Minor version> are compatible
   */
  const clientVersion = globalClientManager.clientVersion;
  const serverVersion = serverInfo.version;
  const providers = globalClientManager.providers;
  const clientWebsocketState = globalClientManager.state;

  return c.json({
    clientVersion,
    serverVersion,
    providers,
    clientWebsocketState,
  });
};

controlApiHandler.get("/state", stateHandler);

controlApiHandler.get("/serverFullVersion", async (c) => {
  return c.text(serverInfo.fullVersion);
});
