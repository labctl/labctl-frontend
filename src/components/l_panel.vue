<template>
  <n-card
    :title="props.title"
    closable
    style="min-height: 500px"
    @close="close"
  >
    <template #header-extra>
      <slot name="header-extra"></slot>
      <n-button
        v-if="vis > minV"
        text
        class="n-base-close"
        :focusable="false"
        style="
          margin-right: 5px;
          margin-left: 12px;
          --n-text-color-hover: black;
        "
        @click="vis -= 1"
      >
        <n-icon>
          <ArrowMinimize20Regular />
        </n-icon>
      </n-button>
      <n-button
        v-if="vis < maxV"
        text
        class="n-base-close"
        :focusable="false"
        style="
          margin-right: 5px;
          margin-left: 12px;
          --n-text-color-hover: black;
        "
        @click="vis += 1"
      >
        <n-icon>
          <ArrowMaximize20Regular />
        </n-icon>
      </n-button>
    </template>

    <slot></slot>
  </n-card>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { NButton, NCard, NIcon } from "naive-ui"
import { ArrowMaximize20Regular, ArrowMinimize20Regular } from "@vicons/fluent"

export interface PropDef {
  visible: number
  title: string
  minV?: number
  maxV?: number
}
const props = withDefaults(defineProps<PropDef>(), { minV: 2, maxV: 4 })

const emit = defineEmits(["update:visible"])

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
