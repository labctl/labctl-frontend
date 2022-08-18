<template>
  <div
    :style="{ 'white-space': 'pre-wrap' }"
    class="jv-container boxed jv-code jv-dark"
    v-html="value"
  ></div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import AnsiUp from "ansi_up";
import DOMPurify from "dompurify";

export interface PropDef {
  value: string;
}
const props = defineProps<PropDef>();

const value = computed(() => {
  const ansiup = new AnsiUp();
  const result = ansiup.ansi_to_html(props.value);

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

// uses css imported by vue3-json-viewer
