console.log("visible")
<template>
  <l-panel
    v-model:visible="vis"
    :title="'Run script ' + props.cmd"
    :min-v="minV"
    :max-v="maxV"
  >
    <template #header-extra>
      <n-button v-if="connected" quaternary @click="connected = !connected">
        <n-icon
          :component="connected ? CancelOutlined : PlugDisconnected20Filled"
        />
        {{ connected ? "Disconnect" : "Connect" }}
      </n-button>
    </template>
    <div ref="xtermwrap">
      <div-xterm
        v-if="!delayShow || showterm"
        v-model:connected="connected"
        :cmd="props.cmd"
      />
    </div>
  </l-panel>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { NButton, NIcon } from "naive-ui"
import DivXterm from "@/components/div_xterm.vue"
import LPanel from "@/components/l_panel.vue"
import { PlugDisconnected20Filled } from "@vicons/fluent"
import { CancelOutlined } from "@vicons/material"
import { useElementVisibility } from "@vueuse/core"

const props = withDefaults(
  defineProps<{
    cmd: string
    visible: number
    minV?: number
    maxV?: number
    /** Delay the show for a 'modal' window */
    delayShow?: boolean
  }>(),
  {
    minV: 2,
    maxV: 4,
    delayShow: false,
  }
)
const emit = defineEmits<{
  (e: "close"): void
  (e: "update:visible", v: number): void
}>()

const xtermwrap = ref<HTMLElement>()
const isvisible = useElementVisibility(xtermwrap)
watch(
  () => isvisible.value,
  (v) => {
    console.log(props.delayShow)
    if (props.delayShow && v) {
      console.log("visible")
      setTimeout(() => {
        showterm.value = true
      }, 200)
    }
  }
)

const vis = computed({
  get: () => props.visible,
  set: (v) => {
    if (v < 0) {
      emit("close")
    }
    emit("update:visible", v)
  },
})

const showterm = ref(false)
const connected = ref(false)

// watch(
//   () => props.visible,
//   (v: number) => {
//     console.log("visible", v, props.visible)
//     if (v > 0) {
//       return
//     }
//   }
// )
</script>

<style></style>
