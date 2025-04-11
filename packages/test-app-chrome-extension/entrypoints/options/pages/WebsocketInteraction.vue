<script setup lang="ts">

let ws: WebSocket
async function initWs() {
  const url = 'ws://localhost:3001/ws'; // 注意：WebSocket使用ws://协议而不是http://

  try {
    // 创建WebSocket连接
    ws = new WebSocket(url);

    // 返回一个Promise来处理连接状态
    return new Promise((resolve, reject) => {
      // 连接建立时的处理
      ws.onopen = () => {
        console.log('WebSocket连接已建立');
        // 可以发送初始消息
        ws.send(JSON.stringify({
          type: 'init',
          message: '客户端已连接'
        }));
      };

      // 接收消息的处理
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('收到消息:', event);
          // 在这里处理接收到的消息
          // 可以根据消息类型进行不同处理
          switch (data.type) {
            case 'message':
              console.log('收到普通消息:', data.content);
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
        resolve({}); // 连接关闭时解析Promise
      };

      // 错误处理
      ws.onerror = (error) => {
        console.error('WebSocket错误:', error);
        reject(error);
      };


    });
  } catch (error) {
    console.error('WebSocket初始化失败:', error);
    throw error;
  }
}

async function sendWsMessage() {
  // 示例：发送消息的函数
  const message = { type: "message", content: 'hello from html.' }
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
    return true;
  } else {
    console.error('WebSocket连接未打开');
    return false;
  }

}

async function closeWs() {
  ws.close()

}

</script>
<template>

  <h1>Websocket Interaction(most simple interaction, code of server-side has been changed, this page has been
    DEPRECATED. )</h1>
  <button @click="initWs">initWs</button>
  <button @click="sendWsMessage">sendWsMessage</button>
  <button @click="closeWs">closeWs</button>
</template>