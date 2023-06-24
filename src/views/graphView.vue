<template>
  <teleport to="#mtoolbar">
    <n-space justify="end">
      <l-button @click="centerGraph">
        <n-icon><center-focus-weak-sharp /></n-icon>
        <template #tooltip> Center graph view </template>
      </l-button>
      <l-button :disabled="selectedNodes.length !== 1" @click="sshNode">
        <n-icon><ConnectedTvSharp /></n-icon>
        <template #tooltip> SSH to {{ selectedNodes[0] }} </template>
        <template #tooltip-disabled>
          Select a single node to enable SSH
        </template>
      </l-button>
      <n-button-group>
        <l-switch
          :value="lab_visible > 0"
          @update:value="lab_visible = toggleVisible(lab_visible)"
        >
          Lab
          <template #tooltip>
            Show the Lab Readme, topology file etc.
          </template>
        </l-switch>
        <l-switch
          :value="ce_visible > 0"
          @update:value="ce_visible = toggleVisible(ce_visible)"
        >
          Config Engine
          <template #tooltip> Show the Config Engine. </template>
        </l-switch>
      </n-button-group>
    </n-space>
  </teleport>

  <n-layout has-sider>
    <n-layout-sider
      v-model:collapsed="show_sidebar"
      show-trigger="arrow-circle"
      content-style="padding: 24px;"
      bordered
      static
      embedded
    >
      <n-list>
        <n-list-item>
          Labels
          <n-dropdown
            :options="labelLayers"
            trigger="hover"
            @select="selectLayer"
          >
            <n-button size="small" secondary round>
              {{ labelLayer }} layer
            </n-button>
          </n-dropdown>
          <template #suffix>
            <l-button circle secondary @click="updatelabels">
              <n-icon><refresh-sharp /></n-icon>
              <template #tooltip>
                Refresh the labels using the node.{{ labelLayer }} & link.{{
                  labelLayer
                }}
                templates
              </template>
            </l-button>
          </template>
        </n-list-item>
        <n-list-item>
          <n-space justify="space-between">
            <span>Select all</span>
            <n-button
              size="small"
              secondary
              round
              @click="selectedLinks = Object.keys(store.topo.links)"
            >
              Links
            </n-button>
            <n-button
              size="small"
              secondary
              round
              @click="selectedNodes = Object.keys(store.topo.nodes)"
            >
              Nodes
            </n-button>
          </n-space>
        </n-list-item>
        <n-list-item>
          <n-space justify="space-between">
            Layout: {{ optLayout }}
            <l-switch @update:value="centerGraph">
              <n-icon><center-focus-weak-sharp /></n-icon>
              <template #tooltip>Center the graph</template>
            </l-switch>
          </n-space>

          <template #suffix>
            <l-switch
              :value="optLayout === 'force'"
              @update:value="(v) => (optLayout = v ? 'force' : 'grid')"
            >
              F
              <template #tooltip>Toggle force layout</template>
            </l-switch>
          </template>
        </n-list-item>
        <n-list-item>
          Show logs
          <template #suffix>
            <l-switch
              :value="show_logs > 0"
              @update:value="show_logs = toggleVisible(show_logs)"
            >
              L
              <template #tooltip>Toggle logs</template>
            </l-switch>
          </template>
        </n-list-item>
      </n-list>
    </n-layout-sider>

    <n-layout-content embedded :native-scrollbar="false">
      <n-alert
        v-if="context.topoerror"
        title="Failed to read topology file"
        type="error"
      >
        {{ context.topoerror }}
        <p style="font-size: smaller; text-align: right">
          {{ context.topofile }}<br />
          <a href="https://containerlab.dev/rn/0.42/" target="blank">
            Containerlab Release notes</a
          >
        </p>
      </n-alert>
      <div-graph
        v-model:selectedNodes="selectedNodes"
        v-model:selectedLinks="selectedLinks"
        :node-labels="lblNode"
        :link-labels="lblLink"
      ></div-graph>
    </n-layout-content>
  </n-layout>

  <n-grid cols="2 1210:4 2420:6" :x-gap="10" :y-gap="10">
    <n-grid-item v-if="lab_visible > 0" :span="lab_visible">
      <panel-lab v-model:visible="lab_visible" />
    </n-grid-item>

    <n-grid-item v-if="ce_visible > 0" :span="ce_visible">
      <panel-ce
        v-model:visible="ce_visible"
        v-model:selected="selectedNodes"
        v-model:selectedLinks="selectedLinks"
      />
    </n-grid-item>

    <n-grid-item
      v-for="n in sshNodes"
      :key="'ssh_' + n"
      :span="panelWidth[n] ?? 2"
    >
      <panel-xterm
        :target="store.hostName(n)"
        :visible="panelWidth[n] ?? 2"
        @update:visible="(v) => sshVis(n, v)"
      />
    </n-grid-item>

    <n-grid-item v-if="show_logs > 0" :span="show_logs">
      <l-panel v-model:visible="show_logs" title="Logs" :min-v="1" :max-v="2">
        <template #header-extra>
          <l-switch v-model:value="show_g_logs">
            G
            <template #tooltip>Include graph events in the logs</template>
          </l-switch>
        </template>
        <div
          v-for="([timestamp, type, log], idx) in eventLogs"
          :key="`${timestamp}/${type}/${log}`"
          :style="{ 'background-color': idx % 2 ? 'white' : '#f4f0ec' }"
        >
          <n-ellipsis :line-clamp="4">
            {{ timestamp }}
            <b class="event-type">{{ type }}</b> {{ log }}
          </n-ellipsis>
        </div>
      </l-panel>
    </n-grid-item>
  </n-grid>
</template>

<script setup lang="ts">
import { reactive, computed, ref, onMounted, nextTick } from "vue"
import { storeToRefs } from "pinia"

import {
  NGridItem,
  NGrid,
  NSpace,
  NButton,
  NEllipsis,
  NList,
  NListItem,
  NButtonGroup,
  NLayout,
  NLayoutSider,
  NLayoutContent,
  SelectOption,
  NDropdown,
  NIcon,
  useMessage,
  useNotification,
  NAlert,
} from "naive-ui"

import LButton from "@/components/l_button.vue"
import LSwitch from "@/components/l_switch.vue"
import LPanel from "@/components/l_panel.vue"
import PanelCe from "@/components/panel_ce.vue"
import PanelLab from "@/components/panel_lab.vue"
import PanelXterm from "@/components/panel_xterm.vue"
import DivGraph from "@/components/div_graph.vue"
// import ConfigResults from "@/components/config_results.vue";
// import VarsView from "@/components/vars_view.vue";

import {
  RefreshSharp,
  CenterFocusWeakSharp,
  ConnectedTvSharp,
} from "@vicons/material"

import dayjs from "dayjs"

import { useMainStore } from "@/stores/mainStore"
import {
  wsTemplateBus,
  wsTxBus,
  wsRxBus,
  wsSend,
  WsTemplate,
  WsMsgCodes,
} from "@/utils/websocket"
import { LinkLabels, NodeLabels } from "@/utils/types"
import { useLocalStorage, watchDebounced } from "@vueuse/core"

import { MsgInit } from "@/utils/message"
import { TipsInit, TipsShow } from "@/utils/tips"
import { actionBus, ActionEvent, logBus } from "@/utils/action"

MsgInit(useMessage())
TipsInit(useNotification())

const store = useMainStore()
const selectedNodes = ref<string[]>([])
const selectedLinks = ref<string[]>([])
const { optLayout, context } = storeToRefs(store)

const lblLink = ref({} as Record<string, LinkLabels>)
const lblNode = ref({} as Record<string, NodeLabels>)

const ce_visible = useLocalStorage("ceVisible", -2)
const lab_visible = useLocalStorage("labVisible", 2)
const show_logs = useLocalStorage("showLogs", -1)
const show_g_logs = useLocalStorage("showGraphLogs", false)
const show_sidebar = useLocalStorage("showSiderbar", true)
const EVENTS_COUNT = 12
const panelWidth = ref<Record<string, number>>({})

const eventLogs = reactive<[string, string, string][]>([])

logBus.on((l) => {
  if (show_g_logs.value) {
    logEvent(l.msg, l.ev)
  }
})

function logEvent(msg: string, ev: any) {
  const timestamp = dayjs().format("HH:mm:ss.SSS")
  if (eventLogs.length > EVENTS_COUNT) {
    eventLogs.splice(EVENTS_COUNT, eventLogs.length - EVENTS_COUNT)
  }
  if (ev instanceof Object && "event" in ev) {
    Object.assign(ev, { event: "(...)" })
  }
  eventLogs.unshift([timestamp, msg, JSON.stringify(ev)])
}

function centerGraph() {
  actionBus.emit({ action: "center", command: "" })
}

onMounted(() => {
  logEvent("mounted", {})
  nextTick(() => {
    TipsShow("select")
    if (lab_visible.value < 1) {
      lab_visible.value = toggleVisible(lab_visible.value)
    }
    centerGraph()
  })
})

wsTxBus.on((ev) => {
  logEvent("WS Tx", ev)
})

wsRxBus.on((ev) => {
  console.debug("WS Rx", ev)
  logEvent("WS Rx", ev)
  if (ev.code === WsMsgCodes.uidata) {
    logEvent("WS load", {})
    nextTick(centerGraph)
  }
})

wsTemplateBus.on((t) => {
  console.debug("WS T", t)
  logEvent("WS T", t)

  if (t.resulty) {
    updateLabel(t)
  }
})

/*
 * Graphs Labels
 */

const labelLayer = ref("base")
function selectLayer(l: string | number) {
  if (l) {
    labelLayer.value = String(l)
  }
}
const labelLayers = computed(() => {
  var res = [{ label: "base", key: "base" }] as Array<SelectOption>
  const s = new Set()
  Object.keys(store.optTemplates).forEach((k) => {
    const [nl, name] = k.split(".")
    if (name && (nl === "node" || nl === "link")) {
      if (s.has(name)) {
        return
      }
      s.add(name)
      res.push({ label: name, key: name })
    }
  })
  return res
})

// If the templates changes, update the labels
watchDebounced(store.optTemplates, updatelabels)
watchDebounced(labelLayer, updatelabels)

/** save the template result in the node/link labels */
function updateLabel(t: WsTemplate) {
  if (t.name === "link" && t.resulty && t.id in store.topo.links) {
    lblLink.value[t.id] = { ...{ size: 12 }, ...t.resulty }
  }
  if (t.name === "node" && t.resulty && t.id in store.topo.nodes) {
    lblNode.value[t.id] = { ...{ size: 12 }, ...t.resulty }
  }
}

/** Update all the topology labels */
function updatelabels() {
  const l = labelLayer.value === "base" ? "" : "." + labelLayer.value

  Object.keys(store.topo.links).forEach((lid) => {
    wsSend({
      code: WsMsgCodes.template,
      template: {
        id: lid,
        name: "link",
        template: store.optTemplates["link" + l] ?? "",
        vars: store.linkVars(lid),
        result: "",
      },
    })
  })
  Object.keys(store.topo.nodes).forEach((nid) => {
    wsSend({
      code: WsMsgCodes.template,
      template: {
        id: nid,
        name: "node",
        template: store.optTemplates["node" + l] ?? "",
        vars: store.topo.vars[nid],
        result: "",
      },
    })
  })
}

function toggleVisible(v: number) {
  return isNaN(v) || v === 0 ? 2 : -v
}

const sshNodes = ref([] as string[])

function sshVis(n: string, v: number) {
  if (v < 1) {
    if (sshNodes.value.includes(n)) {
      sshNodes.value.splice(sshNodes.value.indexOf(n), 1)
    }
    panelWidth.value[n] = -v // for the next show!
  } else {
    panelWidth.value[n] = v
  }
}
function sshNode() {
  if (selectedNodes.value.length !== 1) {
    return
  }
  const n = selectedNodes.value[0]

  if (sshNodes.value.includes(n)) {
    actionBus.emit({ action: "ssh", command: n })
    return
  }
  sshNodes.value.push(n)
  console.log(sshNodes)
}

/** Received a click action event */
actionBus.on((action: ActionEvent) => {
  if (action.action === "config") {
    if (ce_visible.value < 1) {
      ce_visible.value = toggleVisible(ce_visible.value)
      nextTick(() => actionBus.emit(action))
    }
  }
})
</script>

<style lang="css" scoped>
.tooltip-wrapper {
  position: relative;
}
.tooltip {
  top: 0;
  left: 0;
  opacity: 0;
  position: absolute;
  width: 80px;
  height: 36px;
  padding: 10px;
  text-align: center;
  font-size: 12px;
  background-color: #fff0bd;
  border: 1px solid #ffb950;
  box-shadow: 2px 2px 2px #aaa;
  transition: opacity 0.2s linear;
}
</style>
