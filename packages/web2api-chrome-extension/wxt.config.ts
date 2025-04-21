import { defineConfig } from "wxt";

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
    permissions: ["storage", "cookies", "declarativeNetRequest"],
    host_permissions: ["https://chatgpt.com/*", "https://kimi.moonshot.cn/*"],
    minimum_chrome_version: "116",
    // declarative_net_request: {
    //   rule_resources: [
    //     {
    //       id: "ruleset",
    //       enabled: true,
    //       path: "rules.json",
    //     },
    //   ],
    // },
  },
});
