# chatgpt-web-ai-provider

use the [@ai-sdk](https://github.com/vercel/ai) provider to chat with the chatgpt web

> [!IMPORTANT]
> This provider can only run in a browser extension environment.

## install

> this package is published on [jsr](https://jsr.io/)

```sh
npx jsr add @slow-groovin/chatgpt-web-ai-provider
```

```sh
pnpm dlx jsr add @slow-groovin/chatgpt-web-ai-provider
```

```sh
bunx jsr add @slow-groovin/chatgpt-web-ai-provider
```

## usage

```ts
import { storage } from "wxt/utils/storage";
import { createChatgptWebProvider } from "chatgpt-web-ai-provider";

const provider = createChatgptWebProvider({
  //getter for access_token in storage
  accessToken: () => {
    return storage.getItem(ACCESS_TOKEN_KEY);
  },
  //setter for access_token in storage
  accessTokenSetter: (v) => {
    return storage.setItem(ACCESS_TOKEN_KEY, {
      value: v,
      savedAt: Date.now(),
    });
  },
  //getter for oai in cookie
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
});
const model = provider.languageModel("gpt4o-mini", {
  use_search: true,
});
const { textStream } = streamText({
  model: chatModel,
  prompt: "hello? what's GPT-4.1? When is it released?",
});
```

## config

### models

```ts
const models = await provider.getModels();
```

### additional setting

- `use_search`: use search

## how to examine the request?

- Open the extension's options page,
- Use F12 to open the console -> Network.
