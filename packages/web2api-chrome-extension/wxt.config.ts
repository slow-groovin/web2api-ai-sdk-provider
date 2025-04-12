import { build } from "bun";
import { defineConfig } from "wxt";
import { visualizer } from "rollup-plugin-visualizer";
import { rand } from "@vueuse/core";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-vue"],
  // vite: (configEnv) => {
  // const random = (Math.random() * 1000).toFixed(0);
  // console.log("  configEnv", random);
  // return {
  //   build: {
  //     minify: false,
  //   },
  //   plugins: [
  //     visualizer({
  //       open: true, // 构建完成后自动打开浏览器显示分析图表
  //       filename: `.output/visualizer/stats-${random}.html`, // 生成的分析文件名称
  //       gzipSize: true, // 显示 gzip 压缩后的大小
  //       brotliSize: true, // 显示 brotli 压缩后的大小
  //     }),
  //   ],
  // };
  // },
  manifest: {
    permissions: ["webRequest", "storage"],
    host_permissions: ["<all_urls>"],
    minimum_chrome_version: "116",
  },
});
