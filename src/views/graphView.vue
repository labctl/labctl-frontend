<template>
  <n-grid :cols="5" :x-gap="4" :y-gap="4">
    <n-grid-item> . </n-grid-item>
    <n-grid-item :span="2"> . </n-grid-item>
    <n-grid-item>
      <n-checkbox v-model:checked="d3ForceEnabled"> Checkbox </n-checkbox>
    </n-grid-item>
    <n-grid-item>
      <n-select v-model:value="layoutHandler" :options="layoutOptions" />
    </n-grid-item>
  </n-grid>

  <n-divider>{{ store.options.nodes }}</n-divider>

  <v-network-graph
    :nodes="store.options.nodes"
    :edges="store.options.links"
    :configs="configs"
    :layouts="store.layouts"
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

  <p>{{ layouts }}</p>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { useMainStore } from "@/stores/mainStore";
import { NDivider, NCheckbox, NSelect, NGridItem, NGrid } from "naive-ui";
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

//const rawLayouts = ref(store.layouts.nodes);
const layouts = ref({});

const EVENTS_COUNT = 6;

const eventLogs = reactive<[string, string, string][]>([]);

const eventHandlers: vNG.EventHandlers = {
  "node:pointermove": useDebounceFn((event) => {
    // Should save all positions since event will only contin the last change
    console.log(event);
    wsSend({
      code: 100,
      change: event,
      data: { layouts: store.layouts },
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
//const lays = refDebounced(lay);
//const lays = ref({});

// watchDebounced(
//   ref(store.layouts),
//   () => {
//     lays.value = store.layouts.nodes;
//     console.log("changed!");
//   },
//   { debounce: 500, maxWait: 1500 }
// );

const layoutHandler = computed({
  get: () => {
    if (configs.view.layoutHandler instanceof ForceLayout) {
      return "force";
    }
    if (configs.view.layoutHandler instanceof vNG.GridLayout) {
      return "grid";
    }
    return "free";
  },
  set: (value: string) => {
    if (value === "force") {
      configs.view.layoutHandler = new ForceLayout();
    } else if (value === "grid") {
      configs.view.layoutHandler = new vNG.GridLayout({ grid: 15 });
    } else {
      configs.view.layoutHandler = new vNG.SimpleLayout();
    }
  },
});

const d3ForceEnabled = computed({
  get: () => configs.view.layoutHandler instanceof ForceLayout,
  set: (value: boolean) => {
    if (value) {
      configs.view.layoutHandler = new ForceLayout();
    } else {
      configs.view.layoutHandler = new vNG.SimpleLayout();
    }
  },
});

const configs = reactive(
  vNG.defineConfigs({
    view: {
      layoutHandler: new ForceLayout(),
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
