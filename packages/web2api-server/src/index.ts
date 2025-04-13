import { Hono } from "hono";
import { createBunWebSocket } from "hono/bun";
import type { ServerWebSocket } from "bun";
import { wsHandler } from "./ws/ws-entry.js";
import { completionAPIHandler } from "./handler/completion.js";
import { controlApiHandler, stateHandler } from "./handler/api.js";
const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket>();
const app = new Hono();

app.get(
  "/ws",
  upgradeWebSocket((c) => {
    return wsHandler;
  })
);

app.get("/", stateHandler);
app.route("/v1", completionAPIHandler);
app.route("/api", controlApiHandler);
export default {
  fetch: app.fetch,
  port: 3001,
  websocket,
};
