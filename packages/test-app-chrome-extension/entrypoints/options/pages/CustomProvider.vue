<script lang="ts" setup>
import { generateText, streamText } from 'ai'
import { createOpenAICompatible } from '@slow-groovin/openai-compatible';
import { version, customProvider, createCustomProvider } from '@slow-groovin/custom-provider-playground';

const rs = ref<any>({})
async function chat() {
  console.log('version', version)
  const provier = createCustomProvider({
    apiKey: 'sk-' + version,
    baseURL: 'http://test.cc/' + version,
    headers: {
      'by': 'provider' + version
    }
  })
  const model = provier.chat('ministral-3b-latest', {
    safePrompt: true
  })
  const _rs = await generateText({
    model: model,
    topK: 1,
    prompt: 'hello',
    headers: {
      'test': "wxt-app"
    }
  })
  const { text, ...otherRs } = _rs
  console.log('text', text)
  rs.value = _rs

}

async function stream() {
  rs.value = ''
  console.log('version', version)
  const provier = createCustomProvider({
    apiKey: 'sk-' + version,
    baseURL: 'http://test.cc/' + version,
    headers: {
      'by': 'provider' + version
    }
  })
  const model = provier.chat('ministral-3b-latest', {
    safePrompt: true
  })
  const {
    finishReason, response, request, providerMetadata, text, usage, warnings,
    textStream

  } = streamText({
    model,
    prompt: "-prompt",
    onChunk(e) {
      // console.log('e', e)
    },
    onError({ error }) {
      console.error(error); // your error logging logic here
    },

  })
  console.log("call streaText()")

  finishReason.then(r => console.log('finishReason:', r))
  response.then(r => console.log('response:', r))
  request.then(r => console.log('request:', r))
  providerMetadata.then(r => console.log('providerMetadata:', r))
  text.then(r => console.log('text:', r))
  usage.then(r => console.log('usage:', r))
  warnings.then(r => console.log('warnings:', r))

  for await (const textPart of textStream) {
    rs.value += textPart
  }
}
</script>

<template>
  <div>
    <h1>Custom Provider</h1>
    <button @click="chat">generateText</button>
    <button @click="stream">streamText</button>
    <pre>{{ rs }}</pre>
  </div>
</template>

<style scoped></style>
