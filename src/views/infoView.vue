<template>
  <n-divider>websock state</n-divider>
  <json-viewer
    :value="store.wsState"
    copyable
    boxed
    color
    theme="dark"
    expanded
    :expand-depth="3"
  />

  <n-divider>store</n-divider>
  <json-viewer
    :value="store"
    copyable
    boxed
    color
    theme="dark"
    :expand-depth="3"
    preview-mode
  />

  <p align="right">
    Designed 2022 by Johann Kellerman,
    <a href="//github.com/kellerza">@kellerza</a>
  </p>
</template>

<script setup lang="ts">
import {} from "vue";
import { NDivider } from "naive-ui";
import { JsonViewer } from "vue3-json-viewer";

import { useMainStore } from "@/stores/mainStore";
const store = useMainStore();

// function pretty(json: any) {
//   return JSON.stringify(json, null, 4);
// }
</script>
