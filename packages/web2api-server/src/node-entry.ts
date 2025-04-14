#!/usr/bin/env node
import "dotenv/config";
import { serve } from "@hono/node-server";
import { createNodeWebSocket } from "@hono/node-ws";
import { app } from "./index.js";
import { wsHandler } from "./ws/ws-entry.js";
import { consola } from "consola/basic";
import { serverInfo } from "./variables.js";

const { upgradeWebSocket, injectWebSocket } = createNodeWebSocket({ app });

app.get(
  "/ws",
  upgradeWebSocket((c) => {
    return wsHandler;
  })
);

const server = serve({
  fetch: app.fetch,
  port: parseInt(process.env.PORT ?? "3000"),
});

injectWebSocket(server);
consola.box(
  `web2api-servers      ${serverInfo.fullVersion}`,
  "\nServer running on port",
  process.env.PORT ?? 3000
);
