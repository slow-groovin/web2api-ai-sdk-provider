import { Hono } from "hono";
import { createBunWebSocket } from "hono/bun";
import type { ServerWebSocket } from "bun";
import { wsHandler } from "./ws/ws-entry.js";
import { apiApp } from "./handler/api.js";
import { controlApi } from "./handler/control.js";
const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket>();
const app = new Hono();

app.get(
  "/ws",
  upgradeWebSocket((c) => {
    return wsHandler;
  })
);

app.get("/", async (ctx) => {
  return ctx.text("ok");
});
app.route("/v1", apiApp);
app.route("/api", controlApi);
export default {
  fetch: app.fetch,
  port: 3001,
  websocket,
};
