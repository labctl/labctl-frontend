<template>
  <v-network-graph
    ref="graph"
    v-model:selected-nodes="selNodes"
    v-model:selected-edges="selLinks"
    :style="{ height: `${store.optHeight}px` }"
    :nodes="store.topo.nodes"
    :edges="store.topo.links"
    :paths="paths"
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
        v-if="nodeId in props.nodeLabels && props.nodeLabels[nodeId].label"
        x="0"
        y="0"
        :font-size="9 * scale"
        text-anchor="middle"
        dominant-baseline="central"
        fill="#ffffff"
      >
        {{ props.nodeLabels[nodeId].label }}
      </text>
      <text
        v-if="
          nodeId in props.nodeLabels && props.nodeLabels[nodeId].label_below
        "
        :x="x"
        :y="y"
        :font-size="config.fontSize * scale"
        :text-anchor="textAnchor"
        :dominant-baseline="dominantBaseline"
        :fill="config.color"
      >
        {{ props.nodeLabels[nodeId].label_below }}
      </text>
    </template>
    <template #edge-label="{ edgeId, scale, ...slotProps }">
      <v-edge-label
        v-if="
          edgeId in props.linkLabels && props.linkLabels[edgeId].center_above
        "
        :text="String(props.linkLabels[edgeId].center_above)"
        align="center"
        vertical-align="above"
        v-bind="slotProps"
        :font-size="12 * scale"
      />
      <v-edge-label
        v-if="
          edgeId in props.linkLabels && props.linkLabels[edgeId].center_below
        "
        :text="String(props.linkLabels[edgeId].center_below)"
        align="center"
        vertical-align="below"
        v-bind="slotProps"
        :font-size="12 * scale"
      />
      <v-edge-label
        v-if="
          edgeId in props.linkLabels && props.linkLabels[edgeId].source_above
        "
        :text="String(props.linkLabels[edgeId].source_above)"
        align="source"
        vertical-align="above"
        v-bind="slotProps"
        fill="#ff5500"
        :font-size="10 * scale"
      />
      <v-edge-label
        v-if="
          edgeId in props.linkLabels && props.linkLabels[edgeId].source_below
        "
        :text="String(props.linkLabels[edgeId].source_below)"
        align="source"
        vertical-align="below"
        v-bind="slotProps"
        fill="#ff5500"
        :font-size="10 * scale"
      />
      <v-edge-label
        v-if="
          edgeId in props.linkLabels && props.linkLabels[edgeId].target_above
        "
        :text="String(props.linkLabels[edgeId].target_above)"
        align="target"
        vertical-align="above"
        v-bind="slotProps"
        fill="#ff5500"
        :font-size="10 * scale"
      />
      <v-edge-label
        v-if="
          edgeId in props.linkLabels && props.linkLabels[edgeId].target_below
        "
        :text="String(props.linkLabels[edgeId].target_below)"
        align="target"
        vertical-align="below"
        v-bind="slotProps"
        fill="#ff5500"
        :font-size="10 * scale"
      />
    </template>
  </v-network-graph>

  <div
    ref="tooltip"
    class="tooltip"
    :style="{ ...tooltipPos, opacity: tooltipOpacity }"
  >
    <div>
      {{ store.topo.nodes[tooltipTNode]?.name ?? "" }}
      {{ props.nodeLabels[tooltipTNode]?.label ?? "" }}
      {{ props.nodeLabels[tooltipTNode]?.label_below ?? "" }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMainStore } from "@/stores/mainStore"
import { actionBus, logBus } from "@/utils/action"
import { computed, reactive, ref, watch } from "vue"
import * as vNG from "v-network-graph"
import { ForceLayout } from "v-network-graph/lib/force-layout"
import { storeToRefs } from "pinia"
import { LinkLabels, NodeLabels } from "@/utils/types"
import { labelDirection } from "@/utils/helpers"

interface PropDef {
  selectedNodes: Array<string>
  selectedLinks: Array<string>
  linkLabels: Record<string, LinkLabels>
  nodeLabels: Record<string, NodeLabels>
  nodeSize?: number
}
const props = withDefaults(defineProps<PropDef>(), { nodeSize: 30 })

const emit = defineEmits(["update:selectedNodes", "update:selectedLinks"])

const selNodes = computed({
  get: () => props.selectedNodes,
  set: (v) => emit("update:selectedNodes", v),
})

const selLinks = computed({
  get: () => props.selectedLinks,
  set: (v) => emit("update:selectedLinks", v),
})

const store = useMainStore()
const { optLayout, optLayouts } = storeToRefs(store)

const configs = reactive(
  vNG.defineConfigs({
    view: {
      layoutHandler: getLayoutHandler(),
      scalingObjects: true,
      minZoomLevel: 0.5, // 0.1,
      maxZoomLevel: 8, // 16
      //autoPanAndZoomOnLoad: false,
      boxSelectionEnabled: true,
      selection: {
        box: {
          color: "#0000ff20",
          strokeWidth: 1,
          strokeColor: "#aaaaff",
          strokeDasharray: "0",
        },
      },
    },
    node: {
      normal: { radius: props.nodeSize / 2 },
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
    path: {
      visible: true,
      path: {
        width: 10,
      },
    },
  } as vNG.UserConfigs)
)

const directions = computed(() =>
  labelDirection(optLayouts.value.nodes, store.topo.links)
)

watch(optLayout, () => {
  store.save()
  if (configs.view) {
    configs.view.layoutHandler = getLayoutHandler()
  }
})

const paths = reactive<vNG.Paths>({
  //path1: { edges: ["edge1", "edge3", "edge5", "edge7"] },
  //path2: { edges: ["edge2", "edge4", "edge6", "edge10"] },
})

actionBus.on((action) => {
  if (action.action === "path") {
    const path = action.command
    if (Object.keys(paths).includes(path)) {
      delete paths[path]
    } else {
      paths[path] = { edges: path.split(",") }
    }
  }
  if (action.action === "center") {
    console.debug("center")
    graph.value?.fitToContents()
    // graph.value?.panToCenter();
    // graph.value?.transitionWhile(() => {});
  }
})

const graph = ref<vNG.VNetworkGraphInstance>() // ref="graph"
const tooltip = ref<HTMLDivElement>() // ref="tooltip"

const tooltipTNode = ref("")
const tooltipPos = computed(() => {
  if (!graph.value || !tooltip.value) return { x: 0, y: 0 }
  if (!tooltipTNode.value) return { x: 0, y: 0 }

  const nodePos = store.optLayouts.nodes[tooltipTNode.value]
  // translate coordinates: SVG -> DOM
  const domPoint = graph.value.translateFromSvgToDomCoordinates(nodePos)
  // calculates top-left position of the tooltip.
  return {
    left: domPoint.x - tooltip.value.offsetWidth / 2 + "px",
    top:
      domPoint.y - props.nodeSize / 2 - tooltip.value.offsetHeight - 10 + "px",
  }
})
const tooltipOpacity = ref(0) // 0 or 1

const eventHandlers: vNG.EventHandlers = {
  "node:pointerover": ({ node }) => {
    tooltipTNode.value = node
    tooltipOpacity.value = 1 // show
  },
  "node:pointerout": () => {
    tooltipOpacity.value = 0 // hide
  },
  "node:pointermove": store.save,
  "view:zoom": () => {
    // if (eventLogs.length > 4) {
    //   // dont save initial zoom event
    //   store.save();
    // }
  },
  // wildcard: capture all events
  "*": (m, ev) => logBus.emit({ msg: m, ev: ev }),
}

function getLayoutHandler() {
  if (optLayout.value === "force") {
    return new ForceLayout()
  } else if (optLayout.value === "grid") {
    return new vNG.GridLayout({ grid: 15 })
  }
  return new vNG.SimpleLayout()
}
</script>
