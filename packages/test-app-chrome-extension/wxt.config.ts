import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-vue"],
  manifest: {
    permissions: ["webRequest", "webRequestBlocking"],
    host_permissions: ["<all_urls>"],
  },
});
