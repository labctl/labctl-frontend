import { defineConfig, mergeConfig } from "vite"
import { defineConfig as defineVitestConfig } from "vitest/config"

import eslintPlugin from "vite-plugin-eslint"
import vue from "@vitejs/plugin-vue"
import { base_uri } from "./src/utils/const"
import { visualizer } from "rollup-plugin-visualizer"
import { resolve } from "path"

// https://vitejs.dev/config/
const viteConfig = defineConfig({
  base: base_uri,
  plugins: [
    vue(),
    eslintPlugin(),
    visualizer({ open: true, filename: "stats.html", gzipSize: true }),
  ],
  define: { "process.env": {} },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    minify: "esbuild",
    rollupOptions: {
      output: {
        manualChunks: {
          graph: ["v-network-graph"],
          markdown: [
            "dompurify",
            "markdown-it-emoji",
            "markdown-it-mark",
            "markdown-it",
          ],
          utils: ["clipboard", "dayjs", "dayjs/plugin/relativeTime"],
          vue: ["pinia", "vue-router", "vue"],
          vueuse: ["@vueuse/core", "@vueuse/shared"],
          xterm: ["@xterm/addon-fit", "@xterm/addon-webgl", "@xterm/xterm"],
          naive: ["naive-ui"],
        },
      },
    },
  },
})

const vitestConfig = defineVitestConfig({
  test: {
    globals: true,
    environment: "jsdom",
  },
})

export default mergeConfig(viteConfig, vitestConfig)
