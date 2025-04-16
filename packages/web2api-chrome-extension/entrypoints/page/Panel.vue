<script lang="ts" setup>
import { init } from '../background/communication'
import { ServerState } from '../../../web2api-server/src/handler/api';
import { supportModels } from '../background/variables';


const host = ref()
const isServerSecure = ref(false)

function getHostConfig() {
  return Promise.all([
    storage.getItem('local:server-host', { fallback: 'localhost:3001' }).then(rs => (host.value = rs) && refreshServerUrl()),
    storage.getItem<boolean>('local:server-is-secure', { fallback: false }).then(rs => (isServerSecure.value = rs) && refreshServerUrl())
  ])
}

const serverWsUrl = ref('')
const serverApiUrl = ref('')
function refreshServerUrl() {
  serverWsUrl.value = `${isServerSecure.value ? 'wss' : 'ws'}://${host.value}/ws`
  serverApiUrl.value = `${isServerSecure.value ? 'https' : 'http'}://${host.value}/api`
}


async function applyServerHost() {
  if (!host.value) {
    alert('server host is not set.')
  }
  const currentHost = await storage.getItem('local:server-host')
  if (currentHost === host.value) {
    await dashFetchServerState()
    return
  }
  await storage.setItem('local:server-host', host.value)
  // re-init
  await init();
  refreshServerUrl()
  await dashFetchServerState()
}

const serverState = ref<ServerState>()


/**
 *readonly CONNECTING: 0;
   OPEN: 1;
   CLOSING: 2;
   CLOSED: 3;
 */
const stateMap: Record<number, { color: string, text: string }> = {
  [-1]: { color: 'gray', text: 'not connected.' },
  [0]: { color: 'yellow', text: 'connecting' },
  [1]: { color: 'green', text: 'connected' },
  [2]: { color: 'red', text: 'closing' },
  [3]: { color: 'gray', text: 'closed' },
}

async function fetchServerState() {
  if (!serverApiUrl.value) {
    return false
  }
  const resp = await fetch(serverApiUrl.value + '/state')
  serverState.value = await resp.json()
  return serverState.value?.clientWebsocketState === 1
}


async function dashFetchServerState() {
  let retryCount = 0;
  let maxRetries = 10
  while (retryCount < maxRetries) {
    const result = await fetchServerState();
    if (result) {
      break;
    }
    retryCount++
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}
onMounted(() => {
  getHostConfig().then(() => {
    fetchServerState()

  })

  setInterval(fetchServerState, 60000)

})
</script>

<template>
  <div class="panel">
    <div class="header">
      <img src="/icon/96.png" class="logo" />
      <h1 class="title">Panel</h1>
    </div>

    <div class="content">
      <div id="client-block" class="client-block" v-if="false">
        <h2 class="client-title">Client</h2>
      </div>

      <div id="server-block" class="server-block">
        <h2 class="server-title">Server</h2>
        <div id="setting-server-block">

          <label>
            <div>Server host:</div>
            <input type="url" v-model.lazy="host" />
          </label>

          <details>
            <summary>detail setting</summary>
            <input type="checkbox" v-model="isServerSecure" /> secure ('wss://', 'https://')
          </details>

          <div class="btn-group">
            <button @click="applyServerHost">apply</button>
            <button @click="() => init().then(dashFetchServerState)" class="btn-icon">
              <div class="material-symbols--refresh"></div>
            </button>

          </div>





        </div>

        <div class="display-item">
          <span>State: </span>
          <span class="state-tag"
            :style="{ backgroundColor: stateMap[serverState?.clientWebsocketState ?? -1].color }">{{
              stateMap[serverState?.clientWebsocketState ?? -1].text }}</span>
        </div>

        <div id="display-server-block">
          <div class="display-item">
            <span>Server websocket url:</span>
            <span class="url">{{ serverWsUrl }}</span>
          </div>
          <div class="display-item">
            <span>Server api url:</span>
            <span class="url">{{ serverApiUrl }}</span>
          </div>



          <div class="display-item">
            <span>Client version:</span>
            <span>{{ serverState?.clientVersion }}</span>
          </div>
          <div class="display-item">
            <span>Server version:</span>
            <span>{{ serverState?.serverVersion }}</span>
          </div>

          <div class="display-item">
            <span>support models:</span>
            <span>{{ serverState?.supportModels }}</span>
          </div>
          <div class="btn-group">
            <button @click="fetchServerState" class="btn-icon">
              <div class="material-symbols--refresh"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel {
  margin: 0 auto;
  padding: 1rem;
  max-width: 768px;
  width: fit-content;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-size: 14px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: start;
  /* margin-bottom: 1rem; */
  padding: 0.5rem;
}

.logo {
  width: 2rem;
  height: 2rem;
  border: gray 1px solid;
  margin-right: 0.5rem;
}

.title {
  font-size: 2rem;
  margin: 0 0;
  font-weight: bold;
  color: #333;
}

.content {
  display: flex;
}

.client-block {
  width: 50%;
  padding: 1rem;
  border: 1px solid #ddd;
  background-color: #fff;
}

.server-block {
  width: fit-content;
  padding: 1rem;
  border: 1px solid #ddd;
  background-color: #fff;
}

.client-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #555;
}

.server-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #555;
}

button {
  background-color: #4CAF50;
  border: none;
  color: white;
  padding: 0.5rem 0.25rem;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 4px;
  margin-top: 0.5rem;
}

button.btn-icon {
  padding: 0.25rem 0.25rem;
  display: block;
  aspect-ratio: 1;
  width: 28px;
}

button:hover {
  background-color: #3e8e41;
}

.btn-group {
  display: flex;
  width: 100%;
  justify-content: space-around;
  gap: 0.5rem;
}

.display-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
}

.display-item>span:first-child {
  width: 150px;
  font-weight: bold;
  color: #333;
  margin-right: 1rem;
  text-align: right;
}

.url {
  font-weight: bold;
  color: green;
  text-decoration: underline dotted;
  font-weight: 600;

}

.state-tag {
  padding: 0.2rem 0.5rem;
  border-radius: 0.2rem;
  color: white;
  font-size: 1rem;
  font-weight: 600;
}

#setting-server-block {
  display: flex;
  flex-direction: column;
  min-width: fit-content;
  align-items: start;
  margin-bottom: 0.75rem;
  margin-left: auto;
  margin-right: auto;
  border: 1px rgba(128, 128, 128, 0.368) solid;
  padding: 1rem;
  border-radius: 1rem;
}

#setting-server-block label {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1rem;
  text-wrap: nowrap;
  margin-right: 1rem;
  text-align: right;
  font-weight: bold;
  color: #333;
}

#setting-server-block input[type="url"] {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  flex-grow: 1;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}



.material-symbols--refresh {
  display: inline-block;
  width: 100%;
  height: 100%;
  --svg: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' d='M12 20q-3.35 0-5.675-2.325T4 12t2.325-5.675T12 4q1.725 0 3.3.712T18 6.75V4h2v7h-7V9h4.2q-.8-1.4-2.187-2.2T12 6Q9.5 6 7.75 7.75T6 12t1.75 4.25T12 18q1.925 0 3.475-1.1T17.65 14h2.1q-.7 2.65-2.85 4.325T12 20'/%3E%3C/svg%3E");
  background-color: currentColor;
  -webkit-mask-image: var(--svg);
  mask-image: var(--svg);
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
}
</style>
