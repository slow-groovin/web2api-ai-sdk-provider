import { onMessage } from "@/messaging";
import { heartbeat, init, reRegister } from "./communication";

export default defineBackground(() => {
  console.log("Hello background!", new Date().toLocaleString(), {
    id: browser.runtime.id,
  });

  heartbeat();

  onMessage("init", async (message) => {
    await init(message.data);
  });
  console.debug("[onMessage]", "init");
  onMessage("reRegister", async (message) => {
    await reRegister(message.data);
  });
  console.debug("[onMessage]", "reRegister");
});
