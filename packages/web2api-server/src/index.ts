import { Hono } from "hono";
import { completionAPIHandler } from "./handler/completion.js";
import { controlApiHandler, stateHandler } from "./handler/api.js";
import { logger } from "hono/logger";
import { except } from "hono/combine";
// ESM
import { consola, LogLevels } from "consola/basic";
export const app = new Hono();

app.use(
  except(
    ["/", "/api/state"], //skip these route
    logger((message: string, ...rest: string[]) => {
      consola.debug(message, ...rest);
    })
  )
);
app.get("/", stateHandler);
app.route("/v1", completionAPIHandler);
app.route("/api", controlApiHandler);

// --- Runtime Detection ---
const isBun = typeof process.versions?.bun !== "undefined";

//cannot set CONSOLA_LEVEL to verbose(other levels can be set using number)
if (process.env.CONSOLA_LEVEL === "verbose") {
  consola.level = LogLevels.verbose;
}
consola.debug("runtime:", isBun ? "bun" : "node", "  loglevel:", consola.level);
