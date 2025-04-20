import { createMoonshotWebProvider } from "moonshot-web-ai-provider";
import { createChatgptWebProvider } from "chatgpt-web-ai-provider";
import { ProviderV1 } from "@ai-sdk/provider";
export type ProviderKey = "moonshot" | "chatgpt";

const ACCESS_TOKEN_KEY = "local:chatgpt-web-access_token";

export const providerMap = {
  moonshot: createMoonshotWebProvider(),
  chatgpt: createChatgptWebProvider({
    accessToken: () => {
      return storage.getItem(ACCESS_TOKEN_KEY);
    },
    accessTokenSetter: (v) => {
      return storage.setItem(ACCESS_TOKEN_KEY, {
        value: v,
        savedAt: Date.now(),
      });
    },
    async oai() {
      const deviceId = await browser.cookies.get({
        name: "Oai-Device-Id",
        url: "https://chatgpt.com/",
      });
      return {
        oaiDeviceId: deviceId?.value ?? "",
        oaiLanguage: navigator.language,
      };
    },
  }),
};
export type ModelState = {
  name: string;
  enabled: boolean;
};
export type ProviderStates = Record<
  ProviderKey,
  {
    name: string;
    models: ModelState[];
  }
>;
