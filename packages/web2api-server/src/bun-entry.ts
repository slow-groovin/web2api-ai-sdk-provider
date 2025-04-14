import { createBunWebSocket } from "hono/bun";
import { app } from "./index.js";
import { wsHandler } from "./ws/ws-entry.js";
import type { ServerWebSocket } from "bun";
import { consola } from "consola/basic";
import { serverInfo } from "./variables.js";
const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket>();

app.get(
  "/ws",
  upgradeWebSocket((c) => {
    return wsHandler;
  })
);
Bun.serve({
  port: process.env.PORT ?? 3000,
  websocket: websocket,
  fetch: app.fetch,
});
consola.box(
  `web2api-servers [bun] ${serverInfo.fullVersion}`,
  "\nServer running on port",
  process.env.PORT ?? 3000
);
