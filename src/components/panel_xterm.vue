<template>
  <l-panel v-model:visible="visible" :title="'SSH ' + props.target">
    <template #header-extra>
      <n-button v-if="connected" quaternary @click="connected = false">
        <n-icon :component="CancelOutlined" />
        Disconnect
      </n-button>
      <n-button v-else quaternary @click="connected = true">
        <n-icon :component="PlugDisconnected20Filled" />
        Connect
      </n-button>
      <l-button quaternary @click="pingToggle">
        <n-icon :component="ConnectWithoutContactRound" />
        <template #tooltip>Ping the node. Click to start/stop/hide</template>
      </l-button>
    </template>
    <div-xterm
      v-if="ping"
      v-model:connected="pconnected"
      :cmd="'ping ' + props.target"
    />
    <div-xterm
      v-model:connected="connected"
      :cmd="'labctl color ssh ' + props.target"
    />
  </l-panel>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue"
import { NButton, NIcon } from "naive-ui"
import DivXterm from "@/components/div_xterm.vue"
import LButton from "@/components/l_button.vue"
import LPanel from "@/components/l_panel.vue"
import { PlugDisconnected20Filled } from "@vicons/fluent"
import { CancelOutlined, ConnectWithoutContactRound } from "@vicons/material"

export interface PropDef {
  target: string
  visible: number
}
const props = defineProps<PropDef>()
const emit = defineEmits(["close", "update:visible"])

const visible = computed({
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

watch(visible, (v: number) => {
  if (v > 0) {
    return
  }
  //   if (connected.value) {
  //     console.log("disconnect!")
  //   }
})
</script>

<style></style>
