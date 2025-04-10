<script lang="ts" setup>
import { generateText } from 'ai'
import { createOpenAICompatible } from '@slow-groovin/openai-compatible';
import { version, customProvider, createCustomProvider } from '@slow-groovin/custom-provider-playground';
import { refreshToken, getToken, createChat, sendMessage, callUserApi } from './kimi-helper';
import { useLocalStorage } from '@vueuse/core'
const rs = ref<any>({})
const sendMessageRespText = useLocalStorage('kimi-hack-send-message-resp-text', '')
const createdConversationId = useLocalStorage('kimi-conversation-id', '')

const token = ref<{
  access_token: string;
  refresh_token: string;
}>()
async function setToken() {
  token.value = await refreshToken()
}

async function createChatWrapper() {
  const rs = await createChat()
  const { id } = rs
  createdConversationId.value = id
}

async function sendMessageWrapper() {
  if (!createdConversationId.value) {
    return;
  }
  const text = await sendMessage({
    conversationId: createdConversationId.value,
    message: '(reply in chinese)China carried out a tariff counterattack on April 8th. How should the we (we are United States) respond? '
  })
  sendMessageRespText.value = text
}

</script>

<template>
  <div>
    <h1>Hack Kimi</h1>
    <button @click="callUserApi">callUserApi</button>
    <button @click="setToken">refreshToken</button>
    <button @click="getToken">getToken</button>
    <button @click="createChatWrapper">createChat</button>
    <button @click="sendMessageWrapper">sendMessageWrapper</button>

    <pre>{{ rs }}</pre>

    <div class="block">
      <h3>conversation id</h3>
      <input type="text" v-model="createdConversationId" disabled />
    </div>
    <div class="block">
      <h3>sendMessageRespText:</h3>
      <pre>{{ sendMessageRespText }}</pre>
    </div>


  </div>
</template>

<style scoped>
div.block {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 16px;
}
</style>
