<template>
  <n-grid :cols="5" :x-gap="4" :y-gap="4">
    <n-grid-item> . </n-grid-item>
    <n-grid-item :span="2"> . </n-grid-item>
    <n-grid-item>
      <n-checkbox v-model:checked="d3ForceEnabled"> Checkbox </n-checkbox>
    </n-grid-item>
    <n-grid-item>
      <n-select
        v-model:checked="layoutHandler"
        :options="['force', 'grid', 'free']"
      />
    </n-grid-item>
  </n-grid>

  <n-divider>{{ store.options.nodes }}</n-divider>
  {{ store.layouts }}

  <v-network-graph
    :nodes="store.options.nodes"
    :edges="store.options.links"
    :configs="configs"
    :layouts="store.layouts"
  >
  </v-network-graph>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { usemainStore } from "@/stores/mainStore";
import { NDivider, NCheckbox, NSelect } from "naive-ui";
import * as vNG from "v-network-graph";
import { ForceLayout, GridLayout } from "v-network-graph/lib/force-layout";

const store = usemainStore();

// const route = useRoute();

const layoutHandler = computed({
  get: () => {
    if (configs.value.view.layoutHandler instanceof ForceLayout) {
      return "force";
    }
    if (configs.value.view.layoutHandler instanceof GridLayout) {
      return "grid";
    }
    return "free";
  },
  set: (value: string) => {
    if (value === "force") {
      configs.value.view.layoutHandler = new ForceLayout();
    } else if (value === "grid") {
      configs.value.view.layoutHandler = new vNG.GridLayout({ grid: 15 });
    } else {
      configs.value.view.layoutHandler = new vNG.SimpleLayout();
    }
  },
});

const d3ForceEnabled = computed({
  get: () => configs.value.view.layoutHandler instanceof ForceLayout,
  set: (value: boolean) => {
    if (value) {
      configs.value.view.layoutHandler = new ForceLayout();
    } else {
      configs.value.view.layoutHandler = new vNG.SimpleLayout();
    }
  },
});

const configs = ref(
  vNG.defineConfigs({
    view: {
      layoutHandler: new ForceLayout(),
      scalingObjects: true,
      minZoomLevel: 0.1,
      maxZoomLevel: 16,
    },
    node: {
      label: {
        visible: false,
      },
    },
  })
);
</script>
