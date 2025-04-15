## web2api-server

server part of a full web2api service

## run

```sh
npx web2api-server@latest
```

## API

### POST `/v1/chat/completions`

openai-compatible api

support params:

- `stream`
- `model`
- `messages`

### GET `/`/ `/api/state`

response sample:

```json
{
  "clientVersion": "0.1",
  "serverVersion": "0.1",
  "providers": ["moonshot", "chatgpt"],
  "clientWebsocketState": 1
}
```

> The client refers to the `web2api-chrome-extension` part.

- clientVersion: the connected client's version ( `Major version`.`Minor version`)
- serverVersion: server's version
- providers: the connected client's supported providers
- clientWebsocketState: readyState of the websocket with client

### GET `/serverFullVersion`

response sample:
`0.1.8`

## dev

```sh
bun install
bun run dev
```
