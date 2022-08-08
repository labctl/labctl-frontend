import { defineConfig } from "vite";
import eslintPlugin from "vite-plugin-eslint";

import vue from "@vitejs/plugin-vue";
//import Components from 'unplugin-vue-components/vite'
//import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'

const path = require("path");

// https://vitejs.dev/config/
export default defineConfig({
  base: "/labctl/", // allow mounting to another path /s2 etc
  plugins: [
    vue(),
    eslintPlugin(),
    // Components({
    //   resolvers: [NaiveUiResolver()]
    // })
  ],
  define: { "process.env": {} },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  /* remove the need to specify .vue files https://vitejs.dev/config/#resolve-extensions
  resolve: {
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx',
      '.vue',
    ]
  },
  */
});
