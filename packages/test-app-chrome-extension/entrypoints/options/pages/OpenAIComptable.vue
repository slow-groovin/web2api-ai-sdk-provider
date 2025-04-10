<script lang="ts" setup>
import { generateText } from 'ai'
import { createOpenAICompatible } from '@slow-groovin/openai-compatible';
const rs = ref<any>({})
async function chat() {
  const model = createOpenAICompatible({
    name: 'siliconflow',
    baseURL: 'https://api.siliconflow.cn/v1/',
    apiKey: import.meta.env.WXT_SILICONFLOW_API_KEY,
  })


  const _rs = await generateText({
    model: model.languageModel('Qwen/Qwen2.5-7B-Instruct'),
    prompt: 'give me a random sentence'
  })
  rs.value = rs
  console.log('rs', _rs)
}
</script>

<template>
  <div>
    <h1>AI Debug</h1>
    <button @click="chat">generateText</button>
    <pre>{{ rs }}</pre>
  </div>
</template>

<style scoped></style>
