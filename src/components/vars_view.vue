<template>
  <n-card :title="title" style="width: 400px" closable @close="visible = false">
    <div v-if="store.split_vars && !link">
      <p>
        Variables used to render templates. For more info see
        <n-button
          text
          style="font-size: 12px"
          @click="store.split_vars = false"
        >
          <n-icon><splitscreen-twotone /></n-icon>
        </n-button>
      </p>
      <JsonViewer :value="vars" copyable boxed color theme="dark" />
    </div>
    <div v-else-if="!link">
      <p>
        Variables from the topology file and magic variables added by
        containerlab. For a combined view of variables used to render templates,
        see
        <n-button text style="font-size: 18px" @click="store.split_vars = true">
          <n-icon><fit-screen-twotone /></n-icon>
        </n-button>
      </p>
      <JsonViewer
        :value="topovars"
        copyable
        boxed
        expanded
        :expand-depth="4"
        theme="dark"
      />
      <JsonViewer
        :value="newvars"
        copyable
        boxed
        theme="dark"
        expanded
        :expand-depth="2"
      />
    </div>
    <div v-else>
      <p>Variables in the topo file</p>
      <JsonViewer
        :value="link.vars"
        copyable
        boxed
        color
        theme="dark"
        expanded
        :expand-depth="3"
      />
      <p>Variables available when you render {{ link.source }}</p>
      <JsonViewer
        :value="linkSourceVars"
        copyable
        boxed
        color
        theme="dark"
        expanded
        :expand-depth="3"
      />
      <p>Variables available when you render {{ link.target }}</p>
      <JsonViewer
        :value="linkTargetVars"
        copyable
        boxed
        color
        theme="dark"
        expanded
        :expand-depth="3"
      />
    </div>
  </n-card>
</template>

<script setup lang="ts">
import { ref, defineProps, computed, withDefaults } from "vue";
import { NCard, NButton, NIcon } from "naive-ui";
import { useMainStore } from "@/stores/mainStore";
// tslint:disable-next-line
import { JsonViewer } from "vue3-json-viewer";
import { FitScreenTwotone, SplitscreenTwotone } from "@vicons/material";
import { Dictionary } from "./types";
// import { Node } from "v-network-graph";

export interface PropDef {
  id: string;
  link?: boolean;
}
const props = withDefaults(defineProps<PropDef>(), { link: false });
const store = useMainStore();

const visible = ref(true);

const topovars = computed(() => store.topo.nodes[props.id].vars);

const vars = computed(() => {
  const v = store.topo.vars[props.id];
  return sortDictionary(v, {});
});

const newvars = computed(() => {
  const v = store.topo.vars[props.id];
  return sortDictionary(v, topovars.value);
});

const title = computed(() => {
  if (!props.link) {
    return props.id;
  }
  // const l = store.topo.links[props.id];
  return `Link ${props.id}: ${link.value.source}:${link.value.source_endpoint} to ${link.value.target}:${link.value.target_endpoint}`;
});

const link = computed(() => store.topo.links[props.id]);

function farEndNode(far: string) {
  return (l: Dictionary) => {
    if (!("clab_far" in l)) {
      console.log(`clab_far not in dictionary. Filtering on ${far}: ${l}`);
      return true;
    }
    const f = l.clab_far as Dictionary;
    if (!("clab_node" in f)) {
      console.log(
        `clab_far.clab_node not in dictionary. Filtering on ${far}: ${l}`
      );
      return true;
    }
    return f.clab_node === far;
  };
}

const linkSourceVars = computed(() => {
  const sN = store.topo.vars[link.value.source];
  return sN.clab_links
    .filter(farEndNode(link.value.target))
    .map((d) => sortDictionary(d));
});
const linkTargetVars = computed(() => {
  const tN = store.topo.vars[link.value.target];
  return tN.clab_links
    .filter(farEndNode(link.value.source))
    .map((d) => sortDictionary(d));
});

/** A compare function to move large clab vars to the end */
function compareKeys(a: string, b: string) {
  if (a === "clab_nodes") return 1;
  if (b === "clab_nodes") return -1;
  if (a === "clab_links") return 1;
  if (b === "clab_links") return -1;
  if (a === "clab_far") return 1;
  if (b === "clab_far") return -1;
  return a.localeCompare(b);
}

/** Sort a dictionary */
function sortDictionary(obj: Dictionary, filterObj?: Dictionary) {
  const f = typeof filterObj === "undefined" ? {} : filterObj;
  const sortedKeys = Object.keys(obj).sort(compareKeys);
  // build a new dictionary "accumulator" in the correct order
  return sortedKeys.reduce((accumulator: Dictionary, k: string) => {
    const same = k in f && JSON.stringify(f[k]) === JSON.stringify(obj[k]);
    if (!same) {
      accumulator[k] = obj[k];
    }
    return accumulator;
  }, {});
}
</script>

<style></style>
