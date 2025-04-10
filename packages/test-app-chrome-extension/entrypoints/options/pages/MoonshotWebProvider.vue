<script lang="ts" setup>
import { generateText, streamText } from 'ai'
import { version, createMoonshotWebProvider } from 'moonshot-web-ai-provider';
import { useLocalStorage } from '@vueuse/core';
const rs = ref('')
const provider = createMoonshotWebProvider({ logLevel: 'DEBUG' })
const input = useLocalStorage('moonshotWebProvider-input-text', '')
async function chat() {
  if (!input.value) {
    alert("input is empty")
    return;
  }
  const { finishReason, response, request, providerMetadata, text, usage, warnings, textStream } = streamText({
    model: provider.chat(),
    messages: [
      // { role: 'system', content: 'you are a AI, answer user\'s question' },
      { role: 'user', content: input.value },
    ],
    onFinish(e) {
      console.log('onFinish event', e)
    },
    onChunk(c) {

    },
    onError(e) {
      console.error('onError', e)

    }
  })
  console.log("call streaText()")
  finishReason.then(r => console.log('finishReason:', r))
  response.then(r => console.log('response:', r))
  request.then(r => console.log('request:', r))
  providerMetadata.then(r => console.log('providerMetadata:', r))
  text.then(r => console.log('text:', r))
  usage.then(r => console.log('usage:', r))
  warnings.then(r => console.log('warnings:', r))
  rs.value = ''
  for await (const textPart of textStream) {
    rs.value += textPart
  }
}
</script>

<template>
  <div>
    <h1>Moonshot Web Provider</h1>
    <div>{{ version }}</div>
    <input type="text" v-model="input" />
    <button @click="chat">chat</button>
    <div>{{ rs }}</div>
  </div>
</template>

<style scoped></style>
