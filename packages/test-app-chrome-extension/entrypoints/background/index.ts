import { heartbeat } from "./communication";

export default defineBackground(() => {
  console.log("Hello background!", new Date().toLocaleString(), {
    id: browser.runtime.id,
  });

  modifyHeaders();
});

/**
 * modify `Origin` for requests.
 */
function modifyHeaders() {
  const listener = (details: Browser.webRequest.WebRequestHeadersDetails) => {
    const url = new URL(details.url);
    const headers = details.requestHeaders;
    if (!headers) return;
    for (let i = 0; i < headers.length; i++) {
      if (
        headers[i].name === "Origin"
        // || headers[i].name === "Referer"
      ) {
        if (headers[i].value?.startsWith("chrome-extension://"))
          console.log(headers[i].name, headers[i].value, url.origin);
        headers[i].value = url.origin;
      }
    }

    return { requestHeaders: headers };
  };
  console.log(
    "[modifyHeaders] onBeforeSendHeaders.addListener",
    "hasListener:",
    browser.webRequest.onBeforeSendHeaders.hasListener(listener)
  );
  browser.webRequest.onBeforeSendHeaders.addListener(
    listener,
    {
      urls: [
        // "https://kimi.moonshot.cn/*",
        "https://*.moonshot.cn/*",
        // "<all_urls>",
      ],
      types: ["xmlhttprequest", "websocket"],
    },
    ["requestHeaders", "extraHeaders"]
  );
  console.log(
    "[modifyHeaders]done onBeforeSendHeaders.addListener",
    "hasListener:",
    browser.webRequest.onBeforeSendHeaders.hasListener(listener)
  );

  heartbeat();
}
