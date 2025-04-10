/**
 * 刷新 access token
 * @returns {Promise<{access_token: string, refresh_token: string}>} 包含 access_token 和 refresh_token 的 Promise
 */
export async function refreshToken(): Promise<{
  access_token: string;
  refresh_token: string;
}> {
  const response = await globalThis.fetch(
    "https://kimi.moonshot.cn/api/auth/token/refresh",
    {
      headers: {
        accept: "*/*",
        // Authorization: `Bearer ${1234}`,
        Origin: "https://kimi.moonshot.cn",
      },
      method: "GET",
      // mode: "no-cors",
      // credentials: "include",
    }
  );
  return await response.json();
}
