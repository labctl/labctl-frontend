<template>
  <n-modal v-model:show="visible">
    <n-card
      title="options"
      style="width: 400px"
      closable
      @close="visible = false"
    >
    </n-card>
  </n-modal>
</template>

<script setup lang="ts">
// import { computed, defineProps, defineEmits, Component } from "vue";
import { ref } from "vue";
import { NCard, NModal } from "naive-ui";

const visible = ref(true);
// import { usemainStore } from "@/stores/mainStore";
// const store = usemainStore();
</script>

<style></style>
