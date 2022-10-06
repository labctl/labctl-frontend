<template>
  <l-panel v-model:visible="visible" title="Lab">
    <template #header-extra>
      <n-tabs
        v-model:value="tab"
        type="bar"
        size="large"
        :style="{ 'margin-right': '20px' }"
      >
        <n-tab name="home">
          <n-icon :component="HomeOutlined" />
        </n-tab>
        <n-tab name="readme">
          <n-icon :component="Readme" />
        </n-tab>
      </n-tabs>
    </template>

    <tab-home v-if="tab === 'home'" />

    <div v-else-if="tab === 'readme'">
      <h3>Readme.md</h3>
      <div-markdown :value="store.labFiles['readme.md'] || ''"></div-markdown>
    </div>

    <div v-else>Unknown tab: {{ tab }}</div>

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
import TabHome from "@/components/tab_home.vue"
import LPanel from "@/components/l_panel.vue"
import DivMarkdown from "@/components/div_markdown.vue"
import { HomeOutlined } from "@vicons/material"
import { Readme } from "@vicons/fa"

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

const tab = ref<"home" | "clab" | "readme">(
  optCommands.value.length > 0 ? "home" : "readme"
)

const templateView = ref("")
</script>

<style></style>
