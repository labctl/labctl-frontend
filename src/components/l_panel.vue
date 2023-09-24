<template>
  <n-card :title="props.title" style="min-height: 500px">
    <template #header-extra>
      <n-space :size="0">
        <slot name="header-extra"></slot>
        <n-button
          v-if="vis > minV"
          quaternary
          size="small"
          :focusable="false"
          @click="vis -= 1"
        >
          <template #icon>
            <n-icon :component="ArrowMinimize20Regular" />
          </template>
        </n-button>
        <n-button
          v-if="vis < maxV"
          quaternary
          :focusable="false"
          size="small"
          @click="vis += 1"
        >
          <template #icon>
            <n-icon :component="ArrowMaximize20Regular" />
          </template>
        </n-button>
        <n-button quaternary :focusable="false" size="small" @click="close">
          <template #icon>
            <n-icon :component="CloseFilled" />
          </template>
        </n-button>
      </n-space>
    </template>

    <slot></slot>
  </n-card>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { NButton, NCard, NIcon, NSpace } from "naive-ui"
import { ArrowMaximize20Regular, ArrowMinimize20Regular } from "@vicons/fluent"
import { CloseFilled } from "@vicons/material"

const props = withDefaults(
  defineProps<{
    visible: number
    title: string
    minV?: number
    maxV?: number
  }>(),
  { minV: 2, maxV: 4 }
)

const emit = defineEmits<{ "update:visible": [v: number] }>()

function bound(v: number): number {
  if (v > 0) {
    return v < props.minV ? props.minV : v > props.maxV ? props.maxV : v
  }
  return v > -props.minV ? -props.minV : v < -props.maxV ? -props.maxV : v
}

const vis = computed({
  get: () => bound(props.visible),
  set: (v) => emit("update:visible", bound(v)),
})

function close() {
  vis.value = bound(-vis.value)
}
</script>

<style></style>
