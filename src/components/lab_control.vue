<template>
  <n-card
    v-if="props.visible > 0"
    title="Lab"
    closable
    style="min-height: 500px"
    @close="close"
  >
    <template #header-extra>
      <n-tabs
        v-model:value="selected_tab"
        type="bar"
        size="large"
        :style="{ 'margin-right': '20px' }"
      >
        <n-tab :name="tab.home">
          <n-icon :component="HomeOutlined" />
        </n-tab>
        <n-tab :name="tab.clab">
          <n-icon
            :component="SettingsEthernetOutlined"
            color="var(--n-tab-text-color)"
          />
        </n-tab>
      </n-tabs>
      <n-button
        quaternary
        tiny
        :focusable="false"
        @click="$emit('update:visible', visible > 1 ? 1 : 2)"
      >
        <n-icon
          :component="
            visible > 1 ? ArrowMinimize20Regular : FullScreenMaximize20Filled
          "
      /></n-button>
    </template>

    <CeTabHome v-if="selected_tab === tab.home" />

    <div v-else-if="selected_tab === tab.clab">
      <h2>filename.clab.yml</h2>
      <pre>abc</pre>
    </div>

    <div v-else>Unknown tab: {{ selected_tab }}</div>
  </n-card>
  <template-preview-dialog
    v-if="templateView !== ''"
    visible
    :template="templateView"
    @close="templateView = ''"
  ></template-preview-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { NButton, NCard, NIcon, NTab, NTabs } from "naive-ui"
import { useMainStore } from "@/stores/mainStore"
import CeTabHome from "@/components/ce_tab_home.vue"
import { HomeOutlined, SettingsEthernetOutlined } from "@vicons/material"
import {
  FullScreenMaximize20Filled,
  ArrowMinimize20Regular,
} from "@vicons/fluent"

import { storeToRefs } from "pinia"
import TemplatePreviewDialog from "@/components/template_preview_dialog.vue"

export interface PropDef {
  visible: number
}
const props = defineProps<PropDef>()
const store = useMainStore()

const { optCommands } = storeToRefs(store)

enum tab {
  home = "home",
  clab = "clab",
  labctl = "labctl",
}

const emit = defineEmits([
  "path",
  "update:visible",
  "update:selected",
  "update:selectedLinks",
])
const selected_tab = ref(optCommands.value.length > 0 ? tab.home : tab.home)

function close() {
  emit("update:visible", 0)
}

const templateView = ref("")
</script>

<style></style>
