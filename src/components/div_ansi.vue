<template>
  <div class="jv-container boxed jv-dark">
    <!--
    <div class="jv-tooltip right">
      <span class="jv-button" @click="copy">copy</span>
    </div>
    -->
    <div
      :style="{
        'white-space': 'pre',
        // 'font-family': 'var(--n-font-family-mono)',
        // 'font-size': 'var(--n-font-size-tiny)',
        padding: '10px',
      }"
      :class="{ boxed: true, 'jv-code': true, open: open }"
      v-html="value"
    ></div>

    <div class="jv-more" @click="toggleOpen">
      <span :class="{ 'jv-toggle': true, open: open }"></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import AnsiUp from "ansi_up"
import DOMPurify from "dompurify"

interface PropDef {
  value: string
  open?: boolean
}
const props = withDefaults(defineProps<PropDef>(), { open: false })
const open = ref(props.open)
function toggleOpen() {
  open.value = !open.value
}

// function copy() {
//   console.log("copy");
// }

const value = computed(() => {
  const ansiup = new AnsiUp()
  const result = ansiup.ansi_to_html(props.value)

  // DOMPurify
  try {
    return DOMPurify.sanitize(result)
  } catch (error) {
    const value = props.value
    /* eslint-disable-next-line no-console */
    console.error({ msg: "DOMPurify issue with ansiup", value, error })
    return String(error)
  }
})
</script>

// uses css imported by vue3-json-viewer
