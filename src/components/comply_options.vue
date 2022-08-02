<template>
  <n-card
    title="options"
    style="width: 400px"
    closable
    @close="visible = false"
  >
  </n-card>
</template>

<script setup lang="ts">
// import { computed, defineProps, defineEmits, Component } from "vue";
import { ref, defineProps } from "vue";
import { NCard } from "naive-ui";
import { useMainStore } from "@/stores/mainStore";

export interface PropDef {
  node: string;
}
const props = defineProps<PropDef>();
const store = useMainStore();

const visible = ref(true);
</script>

<style></style>
