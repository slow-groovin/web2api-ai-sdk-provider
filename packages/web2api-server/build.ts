import { $ } from "bun";

await $`rm -rf dist`;
await Bun.build({
  entrypoints: ["./src/node-entry.ts"],
  outdir: "./dist",
  target: "node",
});
