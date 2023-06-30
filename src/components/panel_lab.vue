<template>
  <l-panel v-model:visible="vis" title="Lab">
    <template #header-extra>
      <n-tabs
        v-model:value="tab"
        type="bar"
        size="large"
        :style="{ 'margin-right': '20px' }"
      >
        <n-tab name="readme">
          <n-icon :component="Readme" />
        </n-tab>
      </n-tabs>
    </template>

    <!-- <tab-home v-if="tab === 'home'" /> -->

    <div v-if="tab === 'readme'">
      <div v-for="(text, fn) in store.labFiles" :key="`md_${fn}`">
        <h2>{{ fn }}</h2>
        <div-markdown :value="text" @action="action" />
      </div>
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
import { computed, ref } from "vue"
import { NIcon, NTab, NTabs } from "naive-ui"
import { useMainStore } from "@/stores/mainStore"
// import TabHome from "@/components/tab_home.vue"
import LPanel from "@/components/l_panel.vue"
import DivMarkdown from "@/components/div_markdown.vue"
import { Readme } from "@vicons/fa"

import TemplatePreviewDialog from "@/components/template_preview_dialog.vue"
import { ActionEvent, actionBus } from "@/utils/action"

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

const vis = computed({
  get: () => props.visible,
  set: (v) => emit("update:visible", v),
})

const tab = ref<"clab" | "readme">("readme")

const templateView = ref("")

function action(a: ActionEvent) {
  actionBus.emit(a)
}
</script>

<style></style>
