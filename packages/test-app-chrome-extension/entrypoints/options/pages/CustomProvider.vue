<script lang="ts" setup>
import { generateText } from 'ai'
import { createOpenAICompatible } from '@slow-groovin/openai-compatible';
import { version, customProvider } from '@slow-groovin/custom-provider-playground';
import { createCustomProvider } from '../../../../custom-provider-playground/src/custom-provider-1';

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
</script>

<template>
  <div>
    <h1>Custom Provider</h1>
    <button @click="chat">generateText</button>
    <pre>{{ rs }}</pre>
  </div>
</template>

<style scoped></style>
