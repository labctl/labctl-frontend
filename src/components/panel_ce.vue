<template>
  <l-panel ref="ceref" v-model:visible="vis" title="Config Engine">
    <template #header-extra>
      <n-tabs
        v-model:value="selected_tab"
        type="bar"
        size="large"
        :style="{ 'margin-right': '20px' }"
      >
        <n-tab :name="tab.run">
          <n-badge type="warning" processing :value="results_all.length">
            <n-icon
              :component="PlayArrowTwotone"
              color="var(--n-tab-text-color)"
            />
          </n-badge>
        </n-tab>
        <n-tab :name="tab.vars">
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
        <n-tab :name="tab.templates">
          <n-icon :component="DescriptionOutlined" />
        </n-tab>
      </n-tabs>
    </template>

    <tab-templates v-if="selected_tab === tab.templates" />

    <div v-else-if="selected_tab === tab.run">
      <p>
        <n-input-group>
          <n-input-group-label>Run a command</n-input-group-label>
          <n-input
            ref="inputref"
            v-model:value="cmd_active"
            placeholder="compare / commit / send"
            :style="{ width: '100%' }"
            @keyup.ctrl.enter="run_config"
          >
          </n-input>
          <n-button :loading="loading_config" @click="run_config">
            <template #icon>
              <n-icon><play-arrow-twotone /> </n-icon>
            </template>
          </n-button>
        </n-input-group>
      </p>

      <p v-if="results_all.length > 0">
        <n-space justify="space-between">
          Nodes with results
          <n-space>
            <l-switch
              v-for="name in results_all"
              :key="`ce:nres:${name}`"
              :value="props.selected.includes(name)"
              @update:value="toggleSelected(name)"
            >
              {{ name }}
            </l-switch>
          </n-space>
        </n-space>
      </p>

      <p v-if="cmd_lastrun != ''">
        The current results were obtained by running "{{ cmd_lastrun }}".
      </p>

      <n-grid :cols="2">
        <n-grid-item
          v-for="name in results_selected"
          :key="`ce:tabs:${name}`"
          :tab="name"
          :name="name"
        >
          <n-card :title="name" closable @close="toggleSelected(name)">
            <config-results :node="name"></config-results>
          </n-card>
        </n-grid-item>
      </n-grid>
    </div>

    <div v-else-if="selected_tab === tab.vars">
      <template
        v-if="props.selected.length > 0 || props.selectedLinks.length > 0"
      >
        <h3>Available variables</h3>
        <n-grid :cols="2">
          <n-grid-item v-for="nid in props.selected" :key="`gnode:${nid}`">
            <vars-view :id="nid" @close="toggleSelected(nid, false)" />
          </n-grid-item>

          <n-grid-item v-for="lid in props.selectedLinks" :key="`glink:${lid}`">
            <vars-view :id="lid" link @close="popLink(lid)" />
          </n-grid-item>
        </n-grid>
      </template>
      <template v-else>
        <p>Select a node/link to show available variables.</p>

        <h3>Available nodes</h3>
        <n-table striped size="small">
          <thead>
            <tr>
              <th>Node</th>
              <th>Role</th>
              <th>Kind</th>
              <th>system_ip</th>
              <th>Image</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(node, name) in store.topo.nodes" :key="`a:nde:${name}`">
              <td>
                <n-button
                  quaternary
                  x-small
                  @click="toggleSelected(name, true)"
                >
                  {{ name }}
                </n-button>
              </td>
              <td>{{ store.topo.vars[name].clab_role }}</td>
              <td>{{ node.kind }}</td>
              <td>{{ store.topo.vars[name].clab_system_ip }}</td>
              <td>{{ node.image }}</td>
            </tr>
          </tbody>
        </n-table>
      </template>
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
import { computed, ref } from "vue"
import {
  NBadge,
  NButton,
  NCard,
  NGrid,
  NGridItem,
  NIcon,
  NInput,
  NInputGroup,
  NInputGroupLabel,
  NSpace,
  NTab,
  NTable,
  NTabs,
} from "naive-ui"
import { useMainStore } from "@/stores/mainStore"
import LPanel from "@/components/l_panel.vue"
import LSwitch from "@/components/l_switch.vue"
import VarsView from "@/components/vars_view.vue"
import TabTemplates from "@/components/tab_templates.vue"
import {
  DescriptionOutlined,
  PlayArrowTwotone,
  SettingsEthernetOutlined,
} from "@vicons/material"
import ConfigResults from "@/components/config_results.vue"

import { WsMsgCodes, wsRxBus, wsSend } from "@/utils/websocket"
import { MsgWarning } from "@/utils/message"
import TemplatePreviewDialog from "@/components/template_preview_dialog.vue"
import { ActionEvent, actionBus } from "@/utils/action"

export interface PropDef {
  visible: number
  selected: Array<string>
  selectedLinks: Array<string>
}
const props = defineProps<PropDef>()
const store = useMainStore()
const loading_config = ref(false)

enum tab {
  run = "run",
  templates = "templates",
  vars = "vars",
}

const emit = defineEmits([
  "update:visible",
  "update:selected",
  "update:selectedLinks",
])
const vis = computed({
  get: () => props.visible,
  set: (v) => emit("update:visible", v),
})
const cmd_active = ref("")
const selected_tab = ref(tab.run)

const cmd_lastrun = ref("")
/** Run the config command */
function run_config() {
  if (loading_config.value) {
    MsgWarning("Busy executing config")
    return
  }
  cmd_lastrun.value = cmd_active.value
  Object.keys(store.results).forEach((key) => delete store.results[key])
  loading_config.value = true

  wsSend({
    code: WsMsgCodes.config,
    config: {
      cmd: cmd_active.value,
    },
  })
}

const results_all = computed(() => Object.keys(store.results).sort())
const results_selected = computed(() =>
  Object.keys(store.results)
    .sort()
    .filter((v) => props.selected.includes(v))
)

wsRxBus.on((msg) => {
  if (msg.code === WsMsgCodes.config && msg.config && msg.config.results) {
    // add this node to selected
    const n = msg.config.results[0].node
    toggleSelected(n, true)
  }

  if (msg.code === WsMsgCodes.config && msg.config?.cmd) {
    // wait for 1second before allowing more commands
    setTimeout(() => {
      loading_config.value = false
    }, 100)
  }
})

/** Toggle the selected nodes, or set it to a specific value (setTo) */
function toggleSelected(n: string, setTo?: boolean) {
  const current = props.selected.includes(n)
  if (typeof setTo === "undefined") {
    setTo = !current // toggle
  }
  if (setTo == current) {
    return // no changes
  }
  const newp = [...props.selected]
  if (setTo) {
    newp.push(n)
  } else {
    newp.splice(newp.indexOf(n), 1)
  }
  emit("update:selected", newp)
}

/** Remove a link from the selectedLinks */
function popLink(linkId: string) {
  const newL = [...props.selectedLinks]
  newL.splice(newL.indexOf(linkId), 1)
  emit("update:selectedLinks", newL)
}

const ceref = ref()
const inputref = ref()

/** Received a click action event */
actionBus.on((action: ActionEvent) => {
  if (action.action === "config") {
    cmd_active.value = action.command
    selected_tab.value = tab.run
    inputref.value?.focus()
  }
})

const templateView = ref("")
</script>

<style></style>
