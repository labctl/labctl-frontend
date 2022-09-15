<template>
  <div v-for="(res, i) in results" :key="`${id}${i}`">
    <n-space justify="space-between">
      <n-text code>
        {{ res.prompt || res.node }} <b>{{ res.command }}</b>
      </n-text>
      <n-tag>{{ res.source }}</n-tag>
    </n-space>
    <div-ansi :value="res.response" open />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useMainStore } from "@/stores/mainStore";
import DivAnsi from "@/components/div_ansi.vue";
import { NSpace, NTag, NText } from "naive-ui";

export interface PropDef {
  node: string;
}
const props = defineProps<PropDef>();
const store = useMainStore();
const id = `cr:${Math.random()}:${props.node}:`;

const results = computed(() => store.results[props.node] ?? []);

//const emit = defineEmits(["update:close", "update:selected"]
</script>
