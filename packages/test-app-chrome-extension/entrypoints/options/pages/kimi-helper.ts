import { useLocalStorage } from "@vueuse/core";
export async function callUserApi() {
  const { access_token } = await getToken();
  const response = await fetch("https://kimi.moonshot.cn/api/user", {
    headers: {
      accept: "*/*",
      Authorization: `Bearer ${access_token}`,
      Origin: "https://kimi.moonshot.cn",
    },
    method: "GET",
    // mode: "no-cors",
    // credentials: "include",
  });
  if (response.status === 200) {
    console.log("moonshot web is ready");
  } else {
    console.log("moonshot web is NOT ready. Need to refresh token!.");
  }
  console.log("/api/user response json", await response.json());
}
/**
 * 刷新 access token
 * @returns {Promise<{access_token: string, refresh_token: string}>} 包含 access_token 和 refresh_token 的 Promise
 */
export async function refreshToken(): Promise<{
  access_token: string;
  refresh_token: string;
}> {
  const pre_refresh_token = await storage.getItem<string>(
    "local:kimi-refresh_token"
  );

  const response = await globalThis.fetch(
    "https://kimi.moonshot.cn/api/auth/token/refresh",
    {
      headers: {
        accept: "*/*",
        Authorization: `Bearer ${pre_refresh_token}`,
        Origin: "https://kimi.moonshot.cn",
      },
      method: "GET",
      // mode: "no-cors",
      // credentials: "include",
    }
  );
  const rs = await response.json();
  const { refresh_token, access_token } = rs;
  if (refresh_token && access_token) {
    await storage.setItems([
      { key: "local:kimi-refresh_token", value: refresh_token },
      { key: "local:kimi-access_token", value: access_token },
    ]);
  }
  return { refresh_token, access_token };
}

export async function createChat() {
  const { refresh_token, access_token } = await getToken();
  const resp = await fetch("https://kimi.moonshot.cn/api/chat", {
    headers: {
      accept: "*/*",
      "content-type": "application/json",
      Authorization: `Bearer ${access_token}`,
      Origin: "https://kimi.moonshot.cn",
    },
    method: "POST",
    body: JSON.stringify({ name: "未命名会话", is_example: false }),
  });
  const rs = await resp.json();
  const { id, name, created_at } = rs;
  console.log("rs", rs);
  return rs;
}

export async function getToken() {
  const refresh_token = await storage.getItem("local:kimi-refresh_token");
  const access_token = await storage.getItem("local:kimi-access_token");
  return { refresh_token, access_token };
}

export async function sendMessage(opt: {
  message: string;
  conversationId: string;
}) {
  const { message, conversationId } = opt;
  const { access_token } = await getToken();
  const body = {
    messages: [{ role: "user", content: message }],
    refs: [],
    use_search: false,
  };

  // 建立 SSE 连接
  const response = await fetch(
    `https://kimi.moonshot.cn/api/chat/${conversationId}/completion/stream`,
    {
      method: "POST",
      headers: {
        accept: "*/*",
        "content-type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify(body),
    }
  );
  if (!response.body) {
    throw new Error("body is null");
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let fullResponse = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split("\n");

    for (const line of lines) {
      parseLine(line);
    }
  }
  return fullResponse;

  function parseLine(line: string) {
    if (line.startsWith("data:")) {
      const data = line.substring(5).trim();
      try {
        const parsed = JSON.parse(data);
        if (parsed.event === "cmpl" && parsed.text) fullResponse += parsed.text;
      } catch (e) {
        console.error(e);
      }

      // fullResponse += data;
      // 在这里处理接收到的数据
    }
  }
}
