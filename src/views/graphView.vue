<template>
  <n-grid :cols="5" :x-gap="4" :y-gap="4">
    <n-grid-item> . </n-grid-item>
    <n-grid-item :span="2"> . </n-grid-item>
    <n-grid-item></n-grid-item>
    <n-grid-item>
      <n-select v-model:value="layout" :options="layoutOptions" />
    </n-grid-item>
  </n-grid>

  <div class="tooltip-wrapper" :style="{ height: `${ttheight}px` }">
    <v-network-graph
      ref="graph"
      v-model:zoom-level="zoom"
      v-model:selected-nodes="selectedNodes"
      v-model:selected-edges="selectedEdges"
      :nodes="store.topo.nodes"
      :edges="store.topo.links"
      :configs="configs"
      :layouts="store.layouts"
      :event-handlers="eventHandlers"
    >
    </v-network-graph>

    <div
      ref="tooltip"
      class="tooltip"
      :style="{ ...tooltipPos, opacity: tooltipOpacity }"
    >
      <div>
        {{ store.topo.nodes[targetNodeId]?.name ?? "" }}
      </div>
    </div>
  </div>

  <n-divider>selected nodes/links</n-divider>

  <n-grid :cols="3" :x-gap="4">
    <n-grid-item v-for="nid in selectedNodes" :key="nid">
      <vars-view :id="nid"></vars-view>
    </n-grid-item>
    <n-grid-item v-for="lid in selectedEdges" :key="lid">
      <vars-view :id="lid" link></vars-view>
    </n-grid-item>
    <n-grid-item>
      selected:{{ selectedNodes }} {{ selectedEdges }}
      <div class="event-logs">
        <div
          v-for="[timestamp, type, log] in eventLogs"
          :key="`${timestamp}/${type}/${log}`"
        >
          {{ timestamp }}
          <span class="event-type">{{ type }}</span>
          {{ log }}
        </div>
      </div>
    </n-grid-item>
  </n-grid>
</template>

<script setup lang="ts">
import { reactive, computed, watch, ref } from "vue";
import { storeToRefs } from "pinia";

import { NDivider, NSelect, NGridItem, NGrid } from "naive-ui";
import * as vNG from "v-network-graph";
import { ForceLayout } from "v-network-graph/lib/force-layout";
import dayjs from "dayjs";

import { useMainStore } from "@/stores/mainStore";
import VarsView from "@/components/vars_view.vue";
import { wsBus } from "@/plugins/eventbus.js";

const store = useMainStore();

const { layout, zoom } = storeToRefs(store);

// const route = useRoute();
const layoutOptions = [
  {
    label: "Force",
    value: "force",
  },
  {
    label: "Grid",
    value: "grid",
  },
  {
    label: "Free layout",
    value: "free",
  },
];

const ttheight = ref(400);
const EVENTS_COUNT = 6;

const eventLogs = reactive<[string, string, string][]>([]);

const eventHandlers: vNG.EventHandlers = {
  "node:pointerover": ({ node }) => {
    targetNodeId.value = node;
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
  "*": (type, event) => {
    const timestamp = dayjs().format("HH:mm:ss.SSS");
    if (eventLogs.length > EVENTS_COUNT) {
      eventLogs.splice(EVENTS_COUNT, eventLogs.length - EVENTS_COUNT);
    }
    if (event instanceof Object && "event" in event) {
      Object.assign(event, { event: "(...)" });
    }
    eventLogs.unshift([timestamp, type, JSON.stringify(event)]);
  },
};

watch(layout, store.save);

function getLayoutHandler() {
  if (layout.value === "force") {
    return new ForceLayout();
  } else if (layout.value === "grid") {
    return new vNG.GridLayout({ grid: 15 });
  }
  return new vNG.SimpleLayout();
}

watch(layout, () => {
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

wsBus.on((ev) => {
  if (!ev) return;
  if (ev.code === 100) {
    console.log(`ex: ${ev}`);
    graph.value?.transitionWhile(() => {
      setBoundingBox();
    });
  }
});

function setBoundingBox() {
  const box: Record<string, number | undefined> = {};
  Object.keys(store.layouts.nodes).forEach((nodeId: string) => {
    // update node position
    const { x, y } = store.layouts.nodes[nodeId];
    //lLayouts.value.nodes[nodeId] = { x, y };

    // calculate bounding box size
    box.top = box.top ? Math.min(box.top, y) : y;
    box.bottom = box.bottom ? Math.max(box.bottom, y) : y;
    box.left = box.left ? Math.min(box.left, x) : x;
    box.right = box.right ? Math.max(box.right, x) : x;
  });

  const graphMargin = nodeSize * 2;
  const viewBox = {
    top: (box.top ?? 0) - graphMargin,
    bottom: (box.bottom ?? 0) + graphMargin,
    left: (box.left ?? 0) - graphMargin,
    right: (box.right ?? 0) + graphMargin,
  };
  console.log(graph.value?.getViewBox());
  console.log(box);
  graph.value?.setViewBox(viewBox);
  ttheight.value = Math.max((box.bottom ?? 0) - (box.top ?? 0), 400);
  console.log(`height ${ttheight.value}`);
}

const targetNodeId = ref("");

const tooltip = ref<HTMLDivElement>(); // ref="tooltip"

const tooltipPos = computed(() => {
  if (!graph.value || !tooltip.value) return { x: 0, y: 0 };
  if (!targetNodeId.value) return { x: 0, y: 0 };

  const nodePos = store.layouts.nodes[targetNodeId.value];
  // translate coordinates: SVG -> DOM
  const domPoint = graph.value.translateFromSvgToDomCoordinates(nodePos);
  // calculates top-left position of the tooltip.
  return {
    left: domPoint.x - tooltip.value.offsetWidth / 2 + "px",
    top: domPoint.y - nodeSize / 2 - tooltip.value.offsetHeight - 10 + "px",
  };
});
const tooltipOpacity = ref(0); // 0 or 1

const selectedNodes = ref<string[]>([]);
const selectedEdges = ref<string[]>([]);
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
