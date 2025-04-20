## web2api-server

server part of a full [web2api](https://github.com/slow-groovin/web2api-ai-sdk-provider) service

## run

```sh
npx web2api-server@latest
```

## API

### POST `/v1/chat/completions`

openai-compatible api

not supported params:

- `top_p`
- `top_k`
- `temperature`
- ...

support params:

- `stream`
- `model`
- `messages`

there are some addtional params for web-special feature:

- `use_search`

example request body:

```json
{
  "stream": true,
  "model": "xxx",
  "messages": [
    {
      "role": "user",
      "content": "hello?"
    }
  ],
  "additional_parameters": {
    "use_search": true
  }
}
```

### GET `/` or `/api/state`

response sample:

```json
{
  "clientVersion": "0.3",
  "serverVersion": "0.3",
  "supportModels": ["kimi", "gpt-4o-mini"],
  "clientWebsocketState": 1
}
```

> The client refers to the `web2api-chrome-extension` part.

- `clientVersion`: the connected client's version ( `Major version`.`Minor version`)
- `serverVersion`: server's version
- `supportModels`: the connected client's supported models
- `clientWebsocketState`: readyState of the websocket with client

### GET `/serverFullVersion`

response sample:

```json
"0.3.0"
```

## dev

```sh
bun install
bun run dev
```
