import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { createRouter, createWebHashHistory } from "vue-router";
import OpenAIComptable from "./pages/OpenAIComptable.vue";
import HelloWorld from "@/components/HelloWorld.vue";
import GlobalLayout from "./layout/GlobalLayout.vue";

import CustomProvider from "./pages/CustomProvider.vue";
import HackKimi from "./pages/HackKimi.vue";
import MoonshotWebProvider from "./pages/MoonshotWebProvider.vue";
import WebsocketInteraction from "./pages/WebsocketInteraction.vue";
import WebsocketClientImplementation from "./pages/WebsocketClientImplementation.vue";
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      component: GlobalLayout,
      children: [
        {
          path: "/",
          component: HelloWorld,
        },
        {
          path: "open-ai-compatible",
          component: OpenAIComptable,
        },
        {
          path: "custom-provider",
          component: CustomProvider,
        },
        {
          path: "hack-kimi",
          component: HackKimi,
        },
        {
          path: "moonshot-web-provider",
          component: MoonshotWebProvider,
        },
        {
          path: "websocket-interaction-sample",
          component: WebsocketInteraction,
        },
        {
          path: "websocket-impl",
          component: WebsocketClientImplementation,
        },
      ],
    },
  ],
});

createApp(App).use(router).mount("#app");
