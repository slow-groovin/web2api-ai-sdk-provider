import { ProviderType, TxType } from "web2api-server/type";
import { RxRegisterType, RxStreamType } from "web2api-server/type";
import { LanguageModel, streamText } from "ai";
import { moonshotWebProvider } from "moonshot-web-ai-provider";
import { clientInfo } from "./variables";
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
    // 可以发送初始消息
    const registerMsg: RxRegisterType = {
      type: "register",
      content: {
        support: ["moonshot"],
        version: clientInfo.version,
      },
    };
    ws.send(JSON.stringify(registerMsg));
  };

  // 接收消息的处理
  ws.onmessage = async (event) => {
    try {
      const data = JSON.parse(event.data) as TxType;

      // 在这里处理接收到的消息
      // 可以根据消息类型进行不同处理
      switch (data.type) {
        case "startChat":
          const { content, id, serviceType } = data;
          const model = providerModelMap[serviceType];
          if (!model) {
            throw new Error(
              "model is not exist for providertype:" + serviceType
            );
          }
          const { textStream } = streamText({
            model: model,
            messages: content,
            onError(e) {},
          });
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
          console.error("收到错误:", data.content);
          break;
        default:
          console.log("收到未知类型消息:", data);
      }
    } catch (error) {
      console.error("消息解析错误:", error);
    }
  };

  // 连接关闭时的处理
  ws.onclose = (event) => {
    console.log("WebSocket连接已关闭", event.code, event.reason);
  };

  // 错误处理
  ws.onerror = (error) => {
    console.error("WebSocket错误:", error);
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

const providerModelMap: Partial<Record<ProviderType, LanguageModel>> = {
  moonshot: moonshotWebProvider.chat(),
};
