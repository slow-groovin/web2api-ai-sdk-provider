import { createManagedStream } from "@/lib/stream.js";
import { globalClientManager } from "@/ws/client-manage.js";
import { Hono } from "hono";
import { stream, streamText, streamSSE } from "hono/streaming";

export const apiApp = new Hono();
apiApp.post("/completion", async (c) => {
  const { stream: chatStream, writer } = globalClientManager.startChat([
    {
      content: "(reply in chinese) tell me something about ReadbleStream",
      role: "user",
    },
  ]);

  return streamSSE(c, async (stream) => {
    // Write a process to be executed when aborted.
    stream.onAbort(() => {
      console.log("Aborted!");
    });
    let id = 1;
    for await (const k of chatStream) {
      // console.log("k", k, typeof k);
      stream.writeSSE({
        data: k,
        event: "message",
        id: String(id++),
      });
    }
    writer.close();
    stream.close();
    // Pipe a readable stream.
  });
});
