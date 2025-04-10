<script lang="ts" setup>
import { generateText, streamText } from 'ai'
import { createOpenAICompatible } from '@slow-groovin/openai-compatible';
const rs = ref<any>({})
const rsText = ref('')
const model = createOpenAICompatible({
  name: 'siliconflow',
  baseURL: 'https://api.siliconflow.cn/v1/',
  apiKey: import.meta.env.WXT_SILICONFLOW_API_KEY,
}).languageModel('Qwen/Qwen2.5-7B-Instruct')
async function chat() {



  const _rs = await generateText({
    model: model,
    prompt: 'give me a random sentence'
  })
  rs.value = _rs
  rsText.value = _rs.text
  console.log('rs', _rs)
}

async function stream() {
  rsText.value = ''
  const {
    finishReason, response, request, providerMetadata, text, usage, warnings,
    textStream
  } = streamText({
    model,
    prompt: "(reply in Chinese) give me a random sentence about politic joke (2000 workds)",
    onError({ error }) {
      console.error(error); // your error logging logic here
    },

  })
  for await (const chunk of textStream) {
    // console.log('chunk', chunk)
    rsText.value += chunk
  }

  finishReason.then(r => console.log('finishReason:', r))
  response.then(r => console.log('response:', r))
  request.then(r => console.log('request:', r))
  providerMetadata.then(r => console.log('providerMetadata:', r))
  text.then(r => console.log('text:', r))
  usage.then(r => console.log('usage:', r))
  warnings.then(r => console.log('warnings:', r))
}
</script>

<template>
  <div>
    <h1>AI Debug</h1>
    <button @click="chat">generateText</button>
    <button @click="stream">stream</button>

    <div>{{ rsText }}</div>
    <pre>{{ rs }}</pre>
  </div>
</template>

<style scoped></style>
