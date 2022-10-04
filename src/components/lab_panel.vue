<template>
  <l-panel v-model:visible="visible" title="Lab">
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
    </template>

    <CeTabHome v-if="selected_tab === tab.home" />

    <div v-else-if="selected_tab === tab.clab">
      <h2>filename.clab.yml</h2>
      <pre>abc</pre>
    </div>

    <div v-else>Unknown tab: {{ selected_tab }}</div>
    <template-preview-dialog
      v-if="templateView !== ''"
      visible
      :template="templateView"
      @close="templateView = ''"
    />
  </l-panel>
</template>

<script setup lang="ts">
import { ref, computed } from "vue"
import { NIcon, NTab, NTabs } from "naive-ui"
import { useMainStore } from "@/stores/mainStore"
import CeTabHome from "@/components/ce_tab_home.vue"
import LPanel from "@/components/l_panel.vue"
import { HomeOutlined, SettingsEthernetOutlined } from "@vicons/material"

import { storeToRefs } from "pinia"
import TemplatePreviewDialog from "@/components/template_preview_dialog.vue"

export interface PropDef {
  visible: number
}
const props = defineProps<PropDef>()
const emit = defineEmits([
  "path",
  "update:visible",
  "update:selected",
  "update:selectedLinks",
])

const store = useMainStore()
const { optCommands } = storeToRefs(store)

const visible = computed({
  get: () => props.visible,
  set: (v) => emit("update:visible", v),
})

enum tab {
  home = "home",
  clab = "clab",
  labctl = "labctl",
  term = "term",
}

const selected_tab = ref(optCommands.value.length > 0 ? tab.home : tab.home)

const templateView = ref("")
</script>

<style></style>
