import { ModelId, RxStreamErrorType, TxType } from "web2api-server/type";
import { RxRegisterType, RxStreamType } from "web2api-server/type";
import { LanguageModel, streamText } from "ai";
import { moonshotWebProvider } from "moonshot-web-ai-provider";
import { clientInfo, supportModels } from "./variables";
import { createModel } from "./model";
let ws: WebSocket;
const logTitle = "[web2api-chrome-ext]";
/**
 * init ws, send `register` message
 */
export async function init() {
  const host = await storage.getItem("local:server-host", {
    fallback: "localhost:3001",
  });
  if (ws && ws.readyState === 1) {
    ws.close();
  }
  ws = new WebSocket(`ws://${host}/ws`);

  ws.onopen = () => {
    console.log(logTitle, "WebSocket to web2api-server had been opened.");
    // send a register message
    const registerMsg: RxRegisterType = {
      type: "register",
      content: {
        support: supportModels,
        version: clientInfo.version,
      },
    };
    ws.send(JSON.stringify(registerMsg));
  };

  // 接收消息的处理
  ws.onmessage = async (event) => {
    try {
      const data = JSON.parse(event.data) as TxType;
      // 可以根据消息类型进行不同处理
      switch (data.type) {
        case "startChat":
          const { content, id, model, options } = data;
          const chatModel = createModel(model, options);
          if (!chatModel) {
            throw new Error("model is not exist for model id:" + model);
          }
          const { textStream } = streamText({
            model: chatModel,
            messages: content,
            onError(e) {
              ws.send(
                JSON.stringify({
                  type: "stream-error",
                  id,
                  /**
                   * ERROR  -> OPENAI sse ERROR
                   */
                  content: JSON.stringify(error2OpenaiSseError(e)),
                } as RxStreamErrorType)
              );
            },
          });
          /*
           * reasoning will be deserted for now, because ai-sdk has no reasoning stream implemention now, 
             which lead to that the completion api of server cannot not stream reasoning before cmpl part.
           */

          for await (const part of textStream) {
            const msg: RxStreamType = {
              type: "stream",
              content: {
                textPart: part,
              },
              id: id,
            };
            ws.send(JSON.stringify(msg));
          }
          ws.send(
            JSON.stringify({
              type: "stream",
              id,
              content: { textPart: "", done: true },
            } as RxStreamType)
          );
          break;
        case "error":
          console.error("receive error from server:", data.content);
          break;
        default:
          console.log("receive unknown data from server::", data);
      }
    } catch (error) {
      console.error("unexpect error:", error);
    }
  };

  // 连接关闭时的处理
  ws.onclose = (event) => {
    console.log("WebSocket closed.", event.code, event.reason);
  };

  // 错误处理
  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
  };
}

export async function heartbeat() {
  let failCount = 0;
  const intervalId = setInterval(async () => {
    console.log(logTitle, "check state:", ws?.readyState);
    if (ws?.readyState !== 1 && ws?.readyState !== 0) {
      failCount++;
      console.log(
        logTitle,
        `reconnect (current state: ${ws?.readyState}), failCount: ${failCount}`
      );
      init();
      if (failCount >= 60) {
        console.log(logTitle, "heartbeat failed 60 times, clearing interval");
        clearInterval(intervalId);
      }
    } else {
      failCount = 0; // Reset failCount if the connection is healthy
    }
  }, 5000);
}

function error2OpenaiSseError(e: any): {
  error: {
    message: string;
    type: "server_error";
    code: string;
  };
} {
  const message = e.message ?? e?.error?.message ?? e.name ?? e?.error?.name;
  if (!message) {
    console.warn("informated error:", e);
  }
  return {
    error: {
      message,
      type: "server_error",
      code: "internal_server_error",
    },
  };
}
