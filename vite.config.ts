import { defineConfig } from "vite";

import eslintPlugin from "vite-plugin-eslint";
import vue from "@vitejs/plugin-vue";

const path = require("path");

// https://vitejs.dev/config/
export default defineConfig({
  base: "/labctl/", // allow mounting to another path /s2 etc
  plugins: [vue(), eslintPlugin()],
  define: { "process.env": {} },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {},
  build: {
    rollupOptions: {
      maxParallelFileReads: 5,
    },
  },
});
