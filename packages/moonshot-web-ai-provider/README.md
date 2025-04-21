# moonshot-web-ai-provider

[![NPM Version](https://img.shields.io/npm/v/moonshot-web-ai-provider?color=crimson)](https://www.npmjs.com/package/moonshot-web-ai-provider)
[![JSR](https://jsr.io/badges/@ryoppippi/mirror-jsr-to-npm)](https://jsr.io/@slow-groovin/moonshot-web-ai-provider)

use the [@ai-sdk](https://github.com/vercel/ai) provider to chat with the Kimi-moonshot web

> [!IMPORTANT]
> This provider can only run in a browser extension environment.

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
import { createMoonshotWebProvider } from "moonshot-web-ai-provider";

const model = createMoonshotWebProvider().languageModel("kimi", {
  use_search: true,
});
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
