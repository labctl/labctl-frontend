<template>
  <n-card
    :title="props.title"
    closable
    style="min-height: 500px"
    @close="visible = -visible"
  >
    <template #header-extra>
      <slot name="header-extra"></slot>
      <n-button
        v-if="visible > minV"
        text
        class="n-base-close"
        :focusable="false"
        style="
          margin-right: 5px;
          margin-left: 12px;
          --n-text-color-hover: black;
        "
        @click="visible -= 1"
      >
        <n-icon>
          <ArrowMinimize20Regular />
        </n-icon>
      </n-button>
      <n-button
        v-if="visible < maxV"
        text
        class="n-base-close"
        :focusable="false"
        style="
          margin-right: 5px;
          margin-left: 12px;
          --n-text-color-hover: black;
        "
        @click="visible += 1"
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

const visible = computed({
  get: () => props.visible,
  set: (v) => emit("update:visible", v),
})
</script>

<style></style>
