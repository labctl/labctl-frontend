<template>
  <l-panel v-model:visible="vis" :title="'SSH ' + props.target">
    <template #header-extra>
      <n-button quaternary size="small" @click="connected = !connected">
        <n-icon
          :component="connected ? CancelOutlined : PlugDisconnected20Filled"
        />
        {{ connected ? "Disconnect" : "Connect" }}
      </n-button>
      <n-tooltip trigger="hover" placement="bottom">
        <template #trigger>
          <n-button quaternary size="small" @click="pingToggle">
            <n-icon :component="ConnectWithoutContactRound" />
            {{ !ping ? "Ping" : pconnected ? "Stop ping" : "Close ping" }}
          </n-button>
        </template>
        Ping the node. Click to start/stop/hide
      </n-tooltip>
    </template>
    <div-xterm
      v-if="ping"
      v-model:connected="pconnected"
      :cmd="'ping ' + props.target"
      :rows="6"
      background-color="#00008B"
    />
    <div ref="xtermref">
      <div-xterm
        v-model:connected="connected"
        :cmd="'labctl color ssh ' + props.target"
      />
    </div>
  </l-panel>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { NButton, NIcon, NTooltip } from "naive-ui"
import DivXterm from "@/components/div_xterm.vue"
import LPanel from "@/components/l_panel.vue"
import { PlugDisconnected20Filled } from "@vicons/fluent"
import { CancelOutlined, ConnectWithoutContactRound } from "@vicons/material"

const props = defineProps<{
  target: string
  visible: number
}>()
const emit = defineEmits<{
  (e: "close"): void
  (e: "update:visible", v: number): void
}>()

const vis = computed({
  get: () => props.visible,
  set: (v) => {
    if (v < 0) {
      emit("close")
    }
    emit("update:visible", v)
  },
})

const connected = ref(false)

const ping = ref(false)
const pconnected = ref(false)

function pingToggle() {
  if (pconnected.value) {
    pconnected.value = false
    return
  }
  ping.value = !ping.value
}

watch(vis, (v: number) => {
  if (v > 0) {
    return
  }
  //   if (connected.value) {
  //     console.log("disconnect!")
  //   }
})
</script>

<style></style>
