import { globalClientManager } from "@/ws/client-manage.js";
import { Hono } from "hono";

/**
 * server control/manage api
 */
export const controlApi = new Hono();
controlApi.get("/version", async (c) => {
  return c.text(globalClientManager.clientVersion);
});
controlApi.get("/providers", async (c) => {
  return c.json(globalClientManager.providers);
});

controlApi.get("/state", async (c) => {
  return c.json(globalClientManager.state);
});
