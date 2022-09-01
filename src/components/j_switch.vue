<template>
  <n-popover v-if="hasSlot('tooltip')" trigger="hover">
    <template #trigger>
      <n-button
        size="small"
        color="#4466cc"
        :strong="!!props.value"
        :tertiary="!props.value"
        round
        @click="toggle"
      >
        <slot />
      </n-button>
    </template>
    <slot name="tooltip"></slot>
  </n-popover>

  <n-button
    v-else
    size="small"
    color="#4466cc"
    :strong="!!props.value"
    :tertiary="!props.value"
    round
    @click="toggle"
  >
    <slot />
  </n-button>
</template>

<script setup lang="ts">
import { defineProps, withDefaults, defineEmits, useSlots } from "vue";
import { NButton, NPopover } from "naive-ui";

export interface PropDef {
  value?: boolean;
}
const props = withDefaults(defineProps<PropDef>(), {});

const emit = defineEmits(["update:value"]);

function toggle() {
  emit("update:value", !props.value);
}

const slots = useSlots();
const hasSlot = (name: string) => {
  return !!slots[name];
};
</script>
