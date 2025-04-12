<script setup lang="ts">
import { RxStartChatType, TxType } from 'web2api-server/type'
import { RxRegisterType, RxStreamType } from 'web2api-server/type';
import { streamText } from 'ai';
import { moonshotWebProvider } from 'moonshot-web-ai-provider';
console.log('Hono',)
let ws: WebSocket
const host = 'localhost:3001'
/*
 *  a copy of code in this file will run in background.js
 */
/**
 * init ws, send `register` message
 */
async function init() {
  const url = `ws://${host}/ws`;
  ws = new WebSocket(url);
  ws.onopen = () => {
    console.log('WebSocket to web2api-server had been opened.');
    // 可以发送初始消息
    const registerMsg: RxRegisterType = {
      type: 'register',
      content: {
        support: [
          'moonshot',
        ],
        version: '0.1.1'
      }
    }
    ws.send(JSON.stringify(registerMsg));
  };

  // 接收消息的处理
  ws.onmessage = async (event) => {
    try {
      const data = JSON.parse(event.data) as TxType;

      // 在这里处理接收到的消息
      // 可以根据消息类型进行不同处理
      switch (data.type) {
        case 'startChat':
          const { content, id, serviceType } = data
          const provider = moonshotWebProvider
          const { textStream } = streamText({
            model: provider.chat(),
            messages: content,
            onError(e) {

            }
          })
          for await (const part of textStream) {
            const msg: RxStreamType = {
              type: 'stream',
              content: {
                textPart: part
              },
              id: id,
            }
            ws.send(JSON.stringify(msg))
          }
          ws.send(JSON.stringify({
            type: 'stream',
            id,
            content: { textPart: '', done: true },

          } as RxStreamType))
          break;
        case 'error':
          console.error('收到错误:', data.content);
          break;
        default:
          console.log('收到未知类型消息:', data);
      }
    } catch (error) {
      console.error('消息解析错误:', error);
    }
  };

  // 连接关闭时的处理
  ws.onclose = (event) => {
    console.log('WebSocket连接已关闭', event.code, event.reason);
  };

  // 错误处理
  ws.onerror = (error) => {
    console.error('WebSocket错误:', error);
  };

  fetchServerApi()
}



async function closeWs() {
  ws.close()

}


const serverVersion = ref('')
const serverState = ref(999)
const serverSupport = ref([])
async function fetchServerApi() {
  fetch(`http://${host}/api/version`).then(res => res.text().then(version => serverVersion.value = version))
  fetch(`http://${host}/api/state`).then(res => res.text().then(t => serverState.value = parseInt(t)))
  fetch(`http://${host}/api/providers`).then(res => res.json().then(t => serverSupport.value = t))
}
const serverCompletionText = ref('')
async function fetchCompletion() {
  fetch(`http://${host}/v1/chat/completions`, {
    body: JSON.stringify({
      model: 'moonshot',
      messages: [
        {
          role: 'user',
          content: '请给我一个随机的段子'
        }
      ],
      stream: true,
    }),
    method: 'POST'
  }).then(async (res) => {
    const reader = res.body?.getReader();
    if (!reader) {
      console.error('无法获取响应流');
      return;
    }
    const decoder = new TextDecoder('utf-8');
    let done = false;
    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) {
        const chunk = decoder.decode(value, { stream: true });
        const dataPart = parseSSEMessage(chunk).data;
        serverCompletionText.value += (JSON.parse(dataPart).choices as any[]).map(c => c.delta.content).join('')
      }
    }
  }).catch((error) => {
    console.error('fetchCompletion 错误:', error);
  });

}


function parseSSEMessage(sseText: string) {
  const message: {
    data: string;
    event?: string;
    id?: string;
    retry?: number;
  } = { data: '' };
  const lines = sseText.split('\n');

  for (const line of lines) {
    if (!line) continue; // Skip empty lines

    // Check for 'data' field
    if (line.startsWith('data: ')) {
      message.data = line.slice(6).trim(); // Remove 'data: ' prefix
    }

    // Check for 'event' field
    else if (line.startsWith('event: ')) {
      message.event = line.slice(7).trim(); // Remove 'event: ' prefix
    }

    // Check for 'id' field
    else if (line.startsWith('id: ')) {
      message.id = line.slice(4).trim(); // Remove 'id: ' prefix
    }

    // Check for 'retry' field
    else if (line.startsWith('retry: ')) {
      const retryValue = line.slice(7).trim();
      message.retry = retryValue ? parseInt(retryValue, 10) : undefined;
    }
  }

  return message;
}
</script>
<template>

  <h1>Impl Client side of `web2api-server`</h1>
  <button @click="init">init</button>
  <button @click="closeWs">closeWs</button>

  <div class="block">
    <h2>server control api (`/api/...`)</h2>
    <div>
      <div>version: {{ serverVersion }}</div>
      <div>state: {{ serverState }}</div>
      <div>support: {{ serverSupport }}</div>
      <button @click="fetchServerApi">fetch </button>
    </div>
  </div>


  <div class="block">
    <h2>fetch /v1/chat/completions api</h2>
    <button @click="fetchCompletion">fetch</button>
    <div>serverCompletionText:<br />{{ serverCompletionText }}</div>
  </div>


</template>

<style scoped>
div.block {
  border: 1px solid #ccc;
  border-radius: 16px;
  padding: 0.5rem;
  margin-top: 16px;
}
</style>