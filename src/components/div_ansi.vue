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
      :class="{ boxed: true, 'jv-code': true, open: opn }"
      v-html="ansi"
    ></div>

    <div class="jv-more" @click="toggleOpen">
      <span :class="{ 'jv-toggle': true, open: opn }"></span>
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
const opn = ref(props.open)
function toggleOpen() {
  opn.value = !opn.value
}

// function copy() {
//   console.log("copy");
// }

const ansi = computed(() => {
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
