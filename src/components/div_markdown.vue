<template>
  <div
    :style="{ 'white-space': 'pre-wrap' }"
    class="markdown-body jv-code"
    v-html="value"
  ></div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { marked } from "marked";
import DOMPurify from "dompurify";

export interface PropDef {
  value: string;
}
const props = defineProps<PropDef>();

const value = computed(() => {
  const default_text = "---";
  let result = "";
  // Convert MD to html
  try {
    result = marked(props.value || default_text, { smartLists: true });
  } catch (error) {
    const value = props.value;
    /* eslint-disable-next-line no-console */
    console.error({ msg: "marked issue", value, error });
    return String(error);
  }

  // DOMPurify
  try {
    return DOMPurify.sanitize(result);
  } catch (error) {
    const value = props.value;
    /* eslint-disable-next-line no-console */
    console.error({ msg: "DOMPurify issue with ansiup", value, error });
    return String(error);
  }
});
</script>

<style>
@import "@/assets/github-markdown.css";

.markdown-body {
  box-sizing: border-box;
  min-width: 200px;
  max-width: 980px;
  margin: 0 auto;
  padding: 10px;
}

@media (max-width: 767px) {
  .markdown-body {
    padding: 15px;
  }
}
</style>
