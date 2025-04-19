# moonshot-web-ai-provider

use the Kimi-moonshot web version just like using the [@ai-sdk](https://github.com/vercel/ai) provider

This provider can only run in a browser extension environment.

## install

> this package is published on [jsr](https://jsr.io/)

```sh
npx jsr add @slow-groovin/moonshot-web-ai-provider
```

```sh
pnpm dlx jsr add @slow-groovin/moonshot-web-ai-provider
```

```sh
bunx jsr add @slow-groovin/moonshot-web-ai-provider
```

## usage

```ts
import { moonshotWebProvider } from "moonshot-web-ai-provider";

const model = moonshotWebProvider.languageModel("kimi", { use_search: true });
const { textStream } = streamText({
  model: chatModel,
  prompt: "hello?",
});
```

## config

### models

- 'kimi'
- 'k1'

### additional setting

- `use_search`: use search

## how to examine the request?

- Open the extension's options page,
- Use F12 to open the console -> Network.
