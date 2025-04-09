export default defineBackground(() => {
  console.log("Hello background!", new Date().toLocaleString(), {
    id: browser.runtime.id,
  });

  // 没有必要拦截, 有权限的页面即可附带cookie, 不附带origin
  // modifyHeaders();
});

function modifyHeaders() {
  console.log("begin modifyHeaders");

  browser.webRequest.onBeforeSendHeaders.addListener(
    (details) => {
      const url = new URL(details.url);
      const headers = details.requestHeaders;
      if (!headers) return;
      for (let i = 0; i < headers.length; i++) {
        if (headers[i].name === "Origin" || headers[i].name === "Referer") {
          if (headers[i].value?.startsWith("chrome-extension://"))
            console.log(headers[i].name, headers[i].value, url.origin);
          headers[i].value = url.origin;
        }
      }

      return { requestHeaders: headers };
    },
    {
      urls: [
        // "https://kimi.moonshot.cn/*",
        // "https://*.moonshot.cn/*",
        "<all_urls>",
      ],
      types: ["xmlhttprequest", "websocket", "other"],
    },
    ["requestHeaders", "extraHeaders"]
  );
  console.log("reg addListener 1");

  // browser.webRequest.onBeforeRequest.addListener(
  //   (details) => {
  //     console.log("details", details);
  //   },
  //   {
  //     urls: [
  //       "https://*.openai.com/*",
  //       "https://*.chatgpt.com/*",
  //       "https://*.moonshot.cn/*",
  //     ],
  //     types: ["xmlhttprequest"],
  //   },
  //   ["requestBody", "extraHeaders"]
  // );
  // console.log("reg addListener 2");
}
