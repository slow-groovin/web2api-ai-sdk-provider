import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-vue"],
  manifest: {
    permissions: ["webRequest", "storage"],
    host_permissions: ["<all_urls>"],
    minimum_chrome_version: "116",
  },
});
