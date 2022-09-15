<template>
  <n-card title="Lab" closable style="min-height: 500px" @close="close">
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
          <n-badge
            type="info"
            processing
            :value="props.selected.length + props.selectedLinks.length"
          >
            <n-icon
              :component="SettingsEthernetOutlined"
              color="var(--n-tab-text-color)"
            />
          </n-badge>
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

    <CeTabHome v-if="selected_tab === tab.home" @action="clickAction" />

    <div v-else-if="selected_tab === tab.templates">
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
import { ref, computed } from "vue";
import { NBadge, NButton, NCard, NIcon, NTab, NTabs } from "naive-ui";
import { useMainStore } from "@/stores/mainStore";
import CeTabHome from "@/components/ce_tab_home.vue";
import { HomeOutlined, SettingsEthernetOutlined } from "@vicons/material";
import {
  FullScreenMaximize20Filled,
  ArrowMinimize20Regular,
} from "@vicons/fluent";

import { WsMsgCodes, wsRxBus } from "@/utils/websocket";
import { storeToRefs } from "pinia";
import TemplatePreviewDialog from "@/components/template_preview_dialog.vue";
import { ActionEvent } from "@/utils/types";

export interface PropDef {
  visible: number;
  selected: Array<string>;
  selectedLinks: Array<string>;
}
const props = defineProps<PropDef>();
const store = useMainStore();
const loading_config = ref(false);

const { optCommands } = storeToRefs(store);

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
]);
const cmd_active = ref("");
const selected_tab = ref(optCommands.value.length > 0 ? tab.home : tab.run);

function close() {
  emit("update:visible", 0);
}

const templateView = ref("");
</script>

<style></style>
