<template>
  <n-grid :cols="5" :x-gap="4" :y-gap="4">
    <n-grid-item> . </n-grid-item>
    <n-grid-item :span="2"> . </n-grid-item>
    <n-grid-item></n-grid-item>
    <n-grid-item>
      <n-select v-model:value="layout" :options="layoutOptions" />
    </n-grid-item>
  </n-grid>

  <n-divider>{{ store.topo.name }}</n-divider>

  <v-network-graph
    :nodes="store.topo.nodes"
    :edges="store.topo.links"
    :configs="configs"
    :layouts="store.lab.layouts"
    :event-handlers="eventHandlers"
  >
  </v-network-graph>

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
</template>

<script setup lang="ts">
import { reactive, computed, watch } from "vue";
import { useMainStore } from "@/stores/mainStore";
import { NDivider, NSelect, NGridItem, NGrid } from "naive-ui";
import * as vNG from "v-network-graph";
import { ForceLayout } from "v-network-graph/lib/force-layout";
import dayjs from "dayjs";
import { useDebounceFn } from "@vueuse/core";
import { wsSend } from "@/stores/socketStore";

const store = useMainStore();

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

const EVENTS_COUNT = 6;

const eventLogs = reactive<[string, string, string][]>([]);

const eventHandlers: vNG.EventHandlers = {
  "node:pointermove": useDebounceFn((event) => {
    // Should save all positions since event will only contin the last change
    console.log(event);
    wsSend({
      code: 100,
      change: event,
      data: store.lab,
    });
  }, 1000),
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

const layout = computed({
  get: () => store.lab.options.layout,
  set: (v) => {
    store.lab.options.layout = v;
  },
});

function getLayoutHandler() {
  if (layout.value === "force") {
    return new ForceLayout();
  } else if (layout.value === "grid") {
    return new vNG.GridLayout({ grid: 15 });
  }
  return new vNG.SimpleLayout();
}

watch(layout, () => {
  configs.view.layoutHandler = getLayoutHandler();
});

const configs = reactive(
  vNG.defineConfigs({
    view: {
      layoutHandler: getLayoutHandler(),
      scalingObjects: true,
      minZoomLevel: 0.1,
      maxZoomLevel: 16,
    },
    node: {
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
    },
  })
);
</script>
