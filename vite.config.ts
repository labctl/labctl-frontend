import { defineConfig } from "vite"

import eslintPlugin from "vite-plugin-eslint"
import vue from "@vitejs/plugin-vue"
import { base_uri } from "./src/utils/const"

import { resolve } from "path"

// https://vitejs.dev/config/
export default defineConfig({
  base: base_uri,
  plugins: [vue(), eslintPlugin()],
  define: { "process.env": {} },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  // test: {},
  build: {
    rollupOptions: {
      maxParallelFileReads: 5,
    },
  },
})
