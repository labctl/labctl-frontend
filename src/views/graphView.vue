<template>
  <teleport to="#mtoolbar">
    <n-space justify="end">
      <n-button @click="selectedNodes = Object.keys(store.topo.nodes)">
        Nodes
      </n-button>
      <n-button @click="selectedLinks = Object.keys(store.topo.links)">
        Links
      </n-button>
      <n-button @click="updatelabels">Update labels</n-button>
      <!-- <n-select
        v-model:value="layout"
        :options="layoutOptions"
        style="width: 160px"
      /> -->
      <n-switch
        :value="layout === 'force'"
        label="a"
        @update:value="(v) => (layout = v ? 'force' : 'grid')"
      >
        <template #checked> force </template>
        <template #unchecked> {{ layout }} </template></n-switch
      >
    </n-space>
  </teleport>

  <div :style="{ height: `${ttheight}px` }">
    <v-network-graph
      ref="graph"
      v-model:zoom-level="zoom"
      v-model:selected-nodes="selectedNodes"
      v-model:selected-edges="selectedLinks"
      :nodes="store.topo.nodes"
      :edges="store.topo.links"
      :configs="configs"
      :layouts="layouts"
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
          v-for="(pos, node) in layouts.nodes"
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
  </div>

  <n-divider>selected nodes/links</n-divider>

  <n-grid :cols="4" :x-gap="10" :y-gap="10">
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
    <n-grid-item>
      <n-card title="Logs">
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
import { reactive, computed, watch, ref, onMounted } from "vue";
import { storeToRefs } from "pinia";

import {
  NDivider,
  NGridItem,
  NGrid,
  NSpace,
  NButton,
  NCard,
  NSwitch,
} from "naive-ui";
import * as vNG from "v-network-graph";
import { ForceLayout } from "v-network-graph/lib/force-layout";
import dayjs from "dayjs";

import { useMainStore } from "@/stores/mainStore";
import VarsView from "@/components/vars_view.vue";
import { wsTemplateBus, wsTxBus, wsRxBus, wsSend } from "@/utils/eventbus";
import { WsMsgCodes } from "@/utils/types";

const store = useMainStore();
const selectedNodes = ref<string[]>([]);
const selectedLinks = ref<string[]>([]);
const { layout, zoom, layouts } = storeToRefs(store);

// const layoutOptions = [
//   {
//     label: "Force layout",
//     value: "force",
//   },
//   {
//     label: "Grid layout",
//     value: "grid",
//   },
//   {
//     label: "Free layout",
//     value: "free",
//   },
// ];

interface lblLinkT {
  source_above?: string;
  source_below?: string;
  target_above?: string;
  target_below?: string;
  center_above?: string;
  center_below?: string;
  size: number;
}
interface ndeLinkT {
  label_below?: string;
  label?: string;
  size: number;
}

const lblLink = ref({} as Record<string, lblLinkT>);
const lblNode = ref({} as Record<string, ndeLinkT>);

const ttheight = ref(450);
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
    if (eventLogs.length > 4) {
      // dont save initial zoom event
      store.save();
    }
  },
  // wildcard: capture all events
  "*": logEvent,
};

// watch(layout, store.save);

function getLayoutHandler() {
  if (layout.value === "force") {
    return new ForceLayout();
  } else if (layout.value === "grid") {
    return new vNG.GridLayout({ grid: 15 });
  }
  return new vNG.SimpleLayout();
}

watch(layout, () => {
  store.save();
  if (configs.view) {
    configs.view.layoutHandler = getLayoutHandler();
  }
});

const nodeSize = 30;

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
        direction: "south",
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

  const nodePos = store.layouts.nodes[tooltipTNode.value];
  // translate coordinates: SVG -> DOM
  const domPoint = graph.value.translateFromSvgToDomCoordinates(nodePos);
  // calculates top-left position of the tooltip.
  return {
    left: domPoint.x - tooltip.value.offsetWidth / 2 + "px",
    top: domPoint.y - nodeSize / 2 - tooltip.value.offsetHeight - 10 + "px",
  };
});
const tooltipOpacity = ref(0); // 0 or 1

onMounted(() => {
  logEvent("mounted", {});
  graph.value?.panToCenter();
  graph.value?.fitToContents();
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
    graph.value?.panToCenter();
    graph.value?.fitToContents();
    // graph.value?.transitionWhile(() => {
    //   //
    //   //setBoundingBox();
    // });
  }
});

wsTemplateBus.on((t) => {
  console.debug("WS T", t);
  logEvent("WS T", t);

  // save the template result in the node/link labels
  if (t.name === "link" && t.resulty && t.id in store.topo.links) {
    lblLink.value[t.id] = { ...{ size: 12 }, ...t.resulty };
  }
  if (t.name === "node" && t.resulty && t.id in store.topo.nodes) {
    lblNode.value[t.id] = { ...{ size: 12 }, ...t.resulty };
  }
});

watch(store.templates, () => {
  // If the templates changes, update the labels
  updatelabels();
});

function updatelabels() {
  Object.keys(store.topo.links).forEach((lid) => {
    wsSend({
      code: WsMsgCodes.render,
      template: {
        id: lid,
        name: "link",
        template: store.templates["link"],
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
        template: store.templates["node"],
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
