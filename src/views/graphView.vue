<template>
  <teleport to="#mtoolbar">
    <n-space justify="end">
      <n-button round size="small" @click="centerGraph"> Center </n-button>
      <n-button-group>
        <n-button
          round
          type="primary"
          size="small"
          :tertiary="!show_vars"
          @click="show_vars = !show_vars"
        >
          Variables
        </n-button>
        <n-button
          round
          size="small"
          :tertiary="show_results"
          type="primary"
          @click="show_results = !show_results"
        >
          Results
        </n-button>
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
          <n-dropdown v-model:value="labelLayer" :options="labelLayers">
            <n-button size="small" secondary round>
              {{ labelLayer === "" ? "base" : labelLayer }} layer
            </n-button>
          </n-dropdown>
          <template #suffix>
            <n-button circle secondary @click="updatelabels">
              <n-icon><refresh-sharp /></n-icon>
            </n-button>
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
              @click="selectedLinks = Object.keys(store.topo.nodes)"
            >
              Nodes
            </n-button>
          </n-space>
        </n-list-item>
        <n-list-item>
          <template #suffix>
            <j-switch
              :value="optLayout === 'force'"
              @update:value="(v) => (optLayout = v ? 'force' : 'grid')"
            >
              F
              <template #tooltip>Toggle force layout</template>
            </j-switch>
          </template>
          Layout {{ optLayout }}
        </n-list-item>
        <n-list-item>
          Show logs
          <template #suffix>
            <j-switch v-model:value="show_logs">
              L
              <template #tooltip>Toggle logs</template>
            </j-switch>
          </template>
        </n-list-item>
      </n-list>
    </n-layout-sider>

    <n-layout-content embedded :native-scrollbar="false">
      <v-network-graph
        ref="graph"
        v-model:selected-nodes="selectedNodes"
        v-model:selected-edges="selectedLinks"
        :style="{ height: `${store.optHeight}px` }"
        :nodes="store.topo.nodes"
        :edges="store.topo.links"
        :configs="configs"
        :layouts="optLayouts"
        :event-handlers="eventHandlers"
      >
        <template
          #override-node-label="{
            nodeId,
            scale,
            x,
            y,
            config,
            textAnchor,
            dominantBaseline,
          }"
        >
          <text
            v-if="nodeId in lblNode && lblNode[nodeId].label"
            x="0"
            y="0"
            :font-size="9 * scale"
            text-anchor="middle"
            dominant-baseline="central"
            fill="#ffffff"
          >
            {{ lblNode[nodeId].label }}
          </text>
          <text
            v-if="nodeId in lblNode && lblNode[nodeId].label_below"
            :x="x"
            :y="y"
            :font-size="config.fontSize * scale"
            :text-anchor="textAnchor"
            :dominant-baseline="dominantBaseline"
            :fill="config.color"
          >
            {{ lblNode[nodeId].label_below }}
          </text>
        </template>
        <template #edge-label="{ edgeId, scale, ...slotProps }">
          <v-edge-label
            v-if="edgeId in lblLink && lblLink[edgeId].center_below"
            :text="String(lblLink[edgeId].center_below)"
            align="center"
            vertical-align="below"
            v-bind="slotProps"
            :font-size="12 * scale"
          />
          <v-edge-label
            v-if="edgeId in lblLink && lblLink[edgeId].source_above"
            :text="String(lblLink[edgeId].source_above)"
            align="source"
            vertical-align="above"
            v-bind="slotProps"
            fill="#ff5500"
            :font-size="10 * scale"
          />
          <v-edge-label
            v-if="edgeId in lblLink && lblLink[edgeId].source_below"
            :text="String(lblLink[edgeId].source_below)"
            align="source"
            vertical-align="below"
            v-bind="slotProps"
            fill="#ff5500"
            :font-size="10 * scale"
          />
          <v-edge-label
            v-if="edgeId in lblLink && lblLink[edgeId].target_above"
            :text="String(lblLink[edgeId].target_above)"
            align="target"
            vertical-align="above"
            v-bind="slotProps"
            fill="#ff5500"
            :font-size="10 * scale"
          />
          <v-edge-label
            v-if="edgeId in lblLink && lblLink[edgeId].target_below"
            :text="String(lblLink[edgeId].target_below)"
            align="target"
            vertical-align="below"
            v-bind="slotProps"
            fill="#ff5500"
            :font-size="10 * scale"
          />
        </template>
        <!-- <template #badge="{ scale }">
        <circle
          v-for="(pos, node) in optLayouts.nodes"
          :key="node"
          :cx="pos.x + 9 * scale + pan.x"
          :cy="pos.y - 9 * scale + pan.y"
          :r="4 * scale"
          :fill="'#00cc00'"
          style="pointer-events: none"
        />
      </template> -->
      </v-network-graph>

      <div
        ref="tooltip"
        class="tooltip"
        :style="{ ...tooltipPos, opacity: tooltipOpacity }"
      >
        <div>
          {{ store.topo.nodes[tooltipTNode]?.name ?? "" }}
          {{ lblNode[tooltipTNode]?.label ?? "" }}
          {{ lblNode[tooltipTNode]?.label_below ?? "" }}
        </div>
      </div>
    </n-layout-content>
  </n-layout>

  <n-grid :cols="4" :x-gap="10" :y-gap="10">
    <n-grid-item :span="2"> <ce-control /> </n-grid-item>
    <template v-if="show_vars">
      <n-grid-item v-for="nid in selectedNodes" :key="nid">
        <vars-view
          :id="nid"
          @close="selectedNodes.splice(selectedNodes.indexOf(nid, 0), 1)"
        ></vars-view>
      </n-grid-item>
      <n-grid-item v-for="lid in selectedLinks" :key="lid">
        <vars-view
          :id="lid"
          link
          @close="selectedLinks.splice(selectedLinks.indexOf(lid, 0), 1)"
        ></vars-view>
      </n-grid-item>
    </template>
    <n-grid-item v-if="show_logs">
      <n-card title="Logs" closable @close="show_logs = false">
        selected:{{ selectedNodes }} {{ selectedLinks }}
        <ul class="event-logs">
          <li
            v-for="[timestamp, type, log] in eventLogs"
            :key="`${timestamp}/${type}/${log}`"
          >
            {{ timestamp }}
            <b class="event-type">{{ type }}</b> {{ log }}
          </li>
        </ul>
      </n-card>
    </n-grid-item>
  </n-grid>
</template>

<script setup lang="ts">
import { reactive, computed, watch, ref, onMounted, nextTick } from "vue";
import { storeToRefs } from "pinia";

import {
  NGridItem,
  NGrid,
  NSpace,
  NButton,
  NList,
  NListItem,
  NCard,
  NButtonGroup,
  NLayout,
  NLayoutSider,
  NLayoutContent,
  SelectOption,
  NDropdown,
  NIcon,
  useMessage,
} from "naive-ui";
import JSwitch from "@/components/j_switch.vue";
import { RefreshSharp } from "@vicons/material";
// import { ArrowExpand20Regular } from "@vicons/fluent";
import * as vNG from "v-network-graph";
import { ForceLayout } from "v-network-graph/lib/force-layout";
import dayjs from "dayjs";

import { useMainStore } from "@/stores/mainStore";
import VarsView from "@/components/vars_view.vue";
import CeControl from "@/components/ce_control.vue";
import { wsTemplateBus, wsTxBus, wsRxBus, wsSend } from "@/utils/eventbus";
import { WsMsgCodes, LinkLabels, NodeLabels, WsTemplate } from "@/utils/types";
import { useLocalStorage, watchDebounced } from "@vueuse/core";
import { labelDirection } from "@/utils/helpers";

(window as any).$message = useMessage();
const store = useMainStore();
const selectedNodes = ref<string[]>([]);
const selectedLinks = ref<string[]>([]);
const { optLayout, optLayouts } = storeToRefs(store);

const lblLink = ref({} as Record<string, LinkLabels>);
const lblNode = ref({} as Record<string, NodeLabels>);

const show_logs = useLocalStorage("showLogs", false);
const show_sidebar = useLocalStorage("showSiderbar", true);
const show_vars = useLocalStorage("showVars", true);
const show_results = useLocalStorage("showResults", true);
const EVENTS_COUNT = 12;

const eventLogs = reactive<[string, string, string][]>([]);

function logEvent(msg: string, ev: any) {
  const timestamp = dayjs().format("HH:mm:ss.SSS");
  if (eventLogs.length > EVENTS_COUNT) {
    eventLogs.splice(EVENTS_COUNT, eventLogs.length - EVENTS_COUNT);
  }
  if (ev instanceof Object && "event" in ev) {
    Object.assign(ev, { event: "(...)" });
  }
  eventLogs.unshift([timestamp, msg, JSON.stringify(ev)]);
}

const eventHandlers: vNG.EventHandlers = {
  "node:pointerover": ({ node }) => {
    tooltipTNode.value = node;
    tooltipOpacity.value = 1; // show
  },
  "node:pointerout": () => {
    tooltipOpacity.value = 0; // hide
  },
  "node:pointermove": store.save,
  "view:zoom": () => {
    // if (eventLogs.length > 4) {
    //   // dont save initial zoom event
    //   store.save();
    // }
  },
  // wildcard: capture all events
  "*": logEvent,
};

function getLayoutHandler() {
  if (optLayout.value === "force") {
    return new ForceLayout();
  } else if (optLayout.value === "grid") {
    return new vNG.GridLayout({ grid: 15 });
  }
  return new vNG.SimpleLayout();
}

watch(optLayout, () => {
  store.save();
  if (configs.view) {
    configs.view.layoutHandler = getLayoutHandler();
  }
});

const nodeSize = 30;

const directions = computed(() =>
  labelDirection(optLayouts.value.nodes, store.topo.links)
);

const configs = reactive(
  vNG.defineConfigs({
    view: {
      layoutHandler: getLayoutHandler(),
      scalingObjects: true,
      minZoomLevel: 0.5, // 0.1,
      maxZoomLevel: 8, // 16
      autoPanAndZoomOnLoad: false,
    },
    node: {
      normal: { radius: nodeSize / 2 },
      label: {
        visible: true,
        fontFamily: undefined,
        fontSize: 11,
        lineHeight: 1.1,
        color: "#000000",
        margin: 4,
        direction: (n) =>
          (n.name ? directions.value[n.name] : false) || "south",
        text: "name",
      },
      selectable: true,
    },
    edge: {
      selectable: true,
    },
  } as vNG.UserConfigs)
);

const graph = ref<vNG.VNetworkGraphInstance>(); // ref="graph"
const tooltip = ref<HTMLDivElement>(); // ref="tooltip"

const tooltipTNode = ref("");
const tooltipPos = computed(() => {
  if (!graph.value || !tooltip.value) return { x: 0, y: 0 };
  if (!tooltipTNode.value) return { x: 0, y: 0 };

  const nodePos = store.optLayouts.nodes[tooltipTNode.value];
  // translate coordinates: SVG -> DOM
  const domPoint = graph.value.translateFromSvgToDomCoordinates(nodePos);
  // calculates top-left position of the tooltip.
  return {
    left: domPoint.x - tooltip.value.offsetWidth / 2 + "px",
    top: domPoint.y - nodeSize / 2 - tooltip.value.offsetHeight - 10 + "px",
  };
});
const tooltipOpacity = ref(0); // 0 or 1

function centerGraph() {
  graph.value?.fitToContents();
  // graph.value?.panToCenter();
  // graph.value?.transitionWhile(() => {});
}

onMounted(() => {
  logEvent("mounted", {});
});

wsTxBus.on((ev) => {
  console.debug("WS Tx", ev);
  logEvent("WS Tx", ev);
});

wsRxBus.on((ev) => {
  console.debug("WS Rx", ev);
  logEvent("WS Rx", ev);
  if (ev.code === WsMsgCodes.save) {
    logEvent("WS load", {});
    nextTick(centerGraph);
    setTimeout(centerGraph, 200);
    setTimeout(centerGraph, 1000);
    //nextTick(centerGraph);
  }
});

wsTemplateBus.on((t) => {
  console.debug("WS T", t);
  logEvent("WS T", t);

  if (t.resulty) {
    updateLabel(t);
  }
});

/*
 * Graphs Labels
 */

const labelLayer = ref("");
const labelLayers = computed(() => {
  var res = [{ label: "base", value: "" }] as Array<SelectOption>;

  return res;
});

// If the templates changes, update the labels
watchDebounced(store.optTemplates, updatelabels);
watchDebounced(labelLayer, updatelabels);

/** save the template result in the node/link labels */
function updateLabel(t: WsTemplate) {
  if (t.name === "link" && t.resulty && t.id in store.topo.links) {
    lblLink.value[t.id] = { ...{ size: 12 }, ...t.resulty };
  }
  if (t.name === "node" && t.resulty && t.id in store.topo.nodes) {
    lblNode.value[t.id] = { ...{ size: 12 }, ...t.resulty };
  }
}

/** Update all the topology labels */
function updatelabels() {
  Object.keys(store.topo.links).forEach((lid) => {
    wsSend({
      code: WsMsgCodes.render,
      template: {
        id: lid,
        name: "link",
        template: store.optTemplates["link"],
        vars: store.linkVars(lid),
        result: "",
      },
    });
  });
  Object.keys(store.topo.nodes).forEach((nid) => {
    wsSend({
      code: WsMsgCodes.render,
      template: {
        id: nid,
        name: "node",
        template: store.optTemplates["node"],
        vars: store.topo.vars[nid],
        result: "",
      },
    });
  });
}
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
