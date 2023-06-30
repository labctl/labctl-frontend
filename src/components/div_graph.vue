<template>
  <div class="tooltip-wrapper">
    <v-network-graph
      ref="graph"
      v-model:selected-nodes="selNodes"
      v-model:selected-edges="selLinks"
      :style="{ height: `${optHeight}px` }"
      :nodes="topoNodes"
      :edges="topoLinks"
      :paths="paths"
      :configs="configs"
      :layouts="optNodeLayouts"
      :event-handlers="eventHandlers"
    >
      <defs>
        <!-- Cannot use <style> directly due to restrictions of Vue. -->
        <component :is="'style'">
          @font-face { font-family: 'Material Icons'; font-style: normal;
          font-weight: 400; src:
          url(https://fonts.gstatic.com/s/materialicons/v97/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2)
          format('woff2'); }
        </component>
      </defs>

      <!-- Replace the node component -->
      <template #override-node="{ nodeId, scale, config, ...slotProps }">
        <rect
          v-if="getNodeProps(nodeId).type == 'rect'"
          :x="(-config.width * scale) / 2"
          :y="(-config.height * scale) / 2"
          :width="config.width * scale"
          :height="config.height * scale"
          :fill="config.color"
          v-bind="slotProps"
        />
        <circle
          v-else
          :r="config.radius * scale"
          :fill="config.color"
          v-bind="slotProps"
        />
        <!-- Use v-html to interpret escape sequences for icon characters. -->
        <!-- eslint-disable -->
        <text
          font-family="Material Icons"
          :font-size="22 * scale"
          fill="#ffffff"
          text-anchor="middle"
          dominant-baseline="central"
          style="pointer-events: none"
          v-html="getNodeProps(nodeId).icon"
        />
        <!-- eslint-enable -->
        {{ getNodeProps(nodeId).icon }}
      </template>

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
          v-if="nodeId in nodeLabels && nodeLabels[nodeId].label"
          x="0"
          y="0"
          :font-size="9 * scale"
          text-anchor="middle"
          dominant-baseline="central"
          fill="#ffffff"
        >
          {{ nodeLabels[nodeId].label }}
        </text>
        <text
          v-if="nodeId in nodeLabels && nodeLabels[nodeId].label_below"
          :x="x"
          :y="y"
          :font-size="config.fontSize * scale"
          :text-anchor="textAnchor"
          :dominant-baseline="dominantBaseline"
          :fill="config.color"
        >
          {{ nodeLabels[nodeId].label_below }}
        </text>
      </template>
      <template #edge-label="{ edgeId, scale, ...slotProps }">
        <v-edge-label
          v-if="edgeId in linkLabels && linkLabels[edgeId].center_above"
          :text="String(linkLabels[edgeId].center_above)"
          align="center"
          vertical-align="above"
          v-bind="slotProps"
          :font-size="12 * scale"
        />
        <v-edge-label
          v-if="edgeId in linkLabels && linkLabels[edgeId].center_below"
          :text="String(linkLabels[edgeId].center_below)"
          align="center"
          vertical-align="below"
          v-bind="slotProps"
          :font-size="12 * scale"
        />
        <v-edge-label
          v-if="edgeId in linkLabels && linkLabels[edgeId].source_above"
          :text="String(linkLabels[edgeId].source_above)"
          align="source"
          vertical-align="above"
          v-bind="slotProps"
          fill="#ff5500"
          :font-size="10 * scale"
        />
        <v-edge-label
          v-if="edgeId in linkLabels && linkLabels[edgeId].source_below"
          :text="String(linkLabels[edgeId].source_below)"
          align="source"
          vertical-align="below"
          v-bind="slotProps"
          fill="#ff5500"
          :font-size="10 * scale"
        />
        <v-edge-label
          v-if="edgeId in linkLabels && linkLabels[edgeId].target_above"
          :text="String(linkLabels[edgeId].target_above)"
          align="target"
          vertical-align="above"
          v-bind="slotProps"
          fill="#ff5500"
          :font-size="10 * scale"
        />
        <v-edge-label
          v-if="edgeId in linkLabels && linkLabels[edgeId].target_below"
          :text="String(linkLabels[edgeId].target_below)"
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
      {{ store.topo.nodes[tooltipTNode]?.name ?? "" }}
      {{ nodeLabels[tooltipTNode]?.label ?? "" }}
      {{ nodeLabels[tooltipTNode]?.label_below ?? "" }}
    </div>
  </div>

  <dialog-nodeprop
    v-model:node="editNode"
    :selected-nodes="selectedNodes"
    :x="dialogPos.x"
    :y="dialogPos.y"
  >
  </dialog-nodeprop>
</template>

<script setup lang="ts">
import { useMainStore } from "@/stores/mainStore"
import { actionBus, logBus } from "@/utils/action"
import { computed, reactive, ref, watch } from "vue"
import * as vNG from "v-network-graph"
import { ForceLayout } from "v-network-graph/lib/force-layout"
import { storeToRefs } from "pinia"
import { LinkLabels, Links, NodeLabels, NodeProps, Nodes } from "@/utils/types"
import dialogNodeprop from "./dialog_nodeprop.vue"
import { colors } from "@/utils/colors"

const props = withDefaults(
  defineProps<{
    selectedNodes: Array<string>
    selectedLinks: Array<string>
    linkLabels: Record<string, LinkLabels>
    nodeLabels: Record<string, NodeLabels>
    nodeSize?: number
    optLayoutHandler: string
    canedit?: boolean
    topoNodes: Nodes
    topoLinks: Links
    optHeight: number
    // optNodeLayouts: vngLayouts
    // optNodeProps: Record<string, NodeProps>
  }>(),
  { nodeSize: 30, canedit: false }
)

const emit = defineEmits<{
  "update:selectedNodes": [nodes: string[]]
  "update:selectedLinks": [links: string[]]
}>()

const selNodes = computed({
  get: () => props.selectedNodes,
  set: (v) => emit("update:selectedNodes", v),
})

const selLinks = computed({
  get: () => props.selectedLinks,
  set: (v) => emit("update:selectedLinks", v),
})

const store = useMainStore()
const { optNodeLayouts } = storeToRefs(store)

/** Get a node's properties from optNodeProps */
function getNodeProps(node: string | undefined): NodeProps {
  if (!node) {
    return {} as NodeProps
  }
  if (!store.optNodeProps[node]) {
    store.optNodeProps[node] = {}
  }
  return store.optNodeProps[node]
}

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
      normal: {
        radius: (node) => getNodeProps(node.name).size ?? props.nodeSize / 2,
        color: (node) => getNodeProps(node.name).color ?? colors.blue,
        type: (node) => getNodeProps(node.name).type ?? "circle",
      },
      hover: {
        radius: (node) =>
          (getNodeProps(node.name).size ?? props.nodeSize / 2) + 2,
        color: (node) => getNodeProps(node.name).color ?? colors.blue,
        type: (node) => getNodeProps(node.name).type ?? "circle",
      },
      label: {
        visible: true,
        fontFamily: undefined,
        fontSize: 11,
        lineHeight: 1.1,
        color: "#000000",
        margin: 4,
        directionAutoAdjustment: true,
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

watch(
  () => props.optLayoutHandler,
  () => {
    if (configs.view) {
      configs.view.layoutHandler = getLayoutHandler()
    }
  }
)

const paths = reactive<vNG.Paths>({
  //path1: { edges: ["edge1", "edge3", "edge5", "edge7"] },
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
const tooltipPos = ref({ left: "0px", top: "0px" })
const tooltipOpacity = ref<0 | 1>(0)

// Update `tooltipPos`
watch(
  () => [tooltipTNode.value, tooltipOpacity.value],
  () => {
    if (!graph.value || !tooltip.value) return

    const nodePos = store.optNodeLayouts.nodes[tooltipTNode.value]
    const radius = getNodeProps(tooltipTNode.value).size ?? props.nodeSize / 2
    // translate coordinates: SVG -> DOM
    const domPoint = graph.value.translateFromSvgToDomCoordinates(nodePos)
    // calculates top-left position of the tooltip.
    tooltipPos.value = {
      left: domPoint.x - tooltip.value.offsetWidth / 2 + "px",
      top: domPoint.y - radius - tooltip.value.offsetHeight - 10 + "px",
    }
  },
  { deep: true }
)

const eventHandlers: vNG.EventHandlers = {
  "node:pointerover": ({ node }) => {
    tooltipTNode.value = node
    tooltipOpacity.value = 1 // show
  },
  "node:pointerout": () => {
    tooltipOpacity.value = 0 // hide
  },
  "node:pointermove": store.save,
  "node:click": ({ node, event }) => {
    if (props.canedit && event.detail == 2) {
      // double-click
      nodeProps(node)
    }
  },
  // wildcard: capture all events
  "*": (m, ev) => logBus.emit({ msg: m, ev: ev }),
}

function getLayoutHandler() {
  if (props.optLayoutHandler === "force") {
    return new ForceLayout()
  } else if (props.optLayoutHandler === "grid") {
    return new vNG.GridLayout({ grid: 15 })
  }
  return new vNG.SimpleLayout()
}

const editNode = ref("")
const dialogPos = ref({ x: 0, y: 0 })
/** Open the property editor for the node */
function nodeProps(node: string) {
  if (!graph.value) return
  // translate coordinates: SVG -> DOM
  const nodePos = store.optNodeLayouts.nodes[node]
  dialogPos.value = graph.value.translateFromSvgToDomCoordinates(nodePos)
  var element = graph.value.$el
  dialogPos.value.x += element.getBoundingClientRect().left + window.scrollX
  dialogPos.value.y += element.getBoundingClientRect().top + window.scrollY

  // show the dialog
  editNode.value = node
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
  display: grid;
  place-content: center;
  text-align: center;
  font-size: 12px;
  background-color: #fff0bd;
  border: 1px solid #ffb950;
  box-shadow: 2px 2px 2px #aaa;
  transition: opacity 0.2s linear;
  pointer-events: none;
}
</style>
