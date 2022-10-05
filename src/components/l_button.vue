<template>
  <n-popover v-if="hasSlot('tooltip')" trigger="hover">
    <template #trigger>
      <n-button
        size="small"
        :type="props.disabled ? 'tertiary' : 'default'"
        secondary
        round
        :style="{
          cursor: props.disabled ? 'not-allowed' : undefined,
        }"
        @click="click"
      >
        <slot />
      </n-button>
    </template>
    <slot v-if="props.disabled" name="tooltip-disabled"></slot>
    <slot v-else name="tooltip"></slot>
  </n-popover>

  <n-button v-else size="small" secondary round @click="click">
    <slot />
  </n-button>
</template>

<script setup lang="ts">
import { useSlots } from "vue"
import { NButton, NPopover } from "naive-ui"

export interface PropDef {
  disabled?: boolean
}
const props = withDefaults(defineProps<PropDef>(), { disabled: false })

const emit = defineEmits(["click"])

const slots = useSlots()
const hasSlot = (name: string) => {
  return !!slots[name]
}

function click() {
  if (!props.disabled) {
    emit("click")
  }
}
</script>
