<template>
  <n-modal
    v-if="!!node"
    ref="dialogRef"
    show
    preset="card"
    :style="{
      maxWidth: '640px',
      position: 'fixed',
      ...dialogPos,
    }"
    :title="`${node} properties`"
    closable
    @close="close"
    @update:show="close"
  >
    <template #header-extra>
      <n-space justify="end">
        <n-button size="small" type="default" @click="setDefaults">
          Default
        </n-button>

        <n-button
          v-if="selectedNodes.length > 1"
          size="small"
          type="primary"
          @click="applyToAll"
        >
          Apply to {{ selectedNodes.length }} selected
        </n-button>
      </n-space>
    </template>
    <n-grid :cols="2">
      <n-grid-item v-if="false"></n-grid-item>

      <n-form-item-gi label="Type" path="radioGroupValue">
        <n-radio-group v-model:value="nodeP.type" name="radiogroup2">
          <n-radio-button value="circle"> Circle </n-radio-button>
          <n-radio-button value="rect"> Rectangle </n-radio-button>
        </n-radio-group>
      </n-form-item-gi>

      <n-form-item-gi label="Size" path="sliderValue">
        <n-slider v-model:value="nodeP.size" :step="1" :min="5" :max="50" />
        <n-checkbox
          :indeterminate="nodeP.size == defaultP.size"
          :checked="false"
          @update:checked="nodeP.size = defaultP.size"
        ></n-checkbox>
      </n-form-item-gi>

      <n-form-item-gi label="Icon" path="inputValue">
        <n-select
          v-model:value="nodeP.icon"
          filterable
          placeholder="Please select an icon"
          :options="iconOptions"
          clearable
        />
        <n-checkbox v-model:checked="showCP"></n-checkbox>
      </n-form-item-gi>

      <n-form-item-gi v-if="showCP" label="Icon Codepoint" path="inputValue">
        <n-input v-model:value="nodeP.icon" placeholder="Codepoint" />
      </n-form-item-gi>

      <n-form-item-gi label="Color" path="inputValue">
        <n-color-picker
          v-model:value="nodeP.color"
          :swatches="swatches"
          :modes="['hex']"
          :alpha="false"
          show-preview
        />
      </n-form-item-gi>
    </n-grid>
    <template #action> </template>
  </n-modal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue"
import {
  NButton,
  NCheckbox,
  NColorPicker,
  NFormItemGi,
  NGrid,
  NGridItem,
  NInput,
  NModal,
  NRadioButton,
  NRadioGroup,
  NSelect,
  NSlider,
  NSpace,
} from "naive-ui"
import { Dictionary, NodeProps } from "@/utils/types"
import { useMainStore } from "@/stores/mainStore"
import { colors } from "@/utils/colors"
import { $set_object } from "@/utils/utils"
import { codePointAsDict } from "@/utils/icon_codepoints"
import { useElementSize } from "@vueuse/core"

const props = defineProps<{
  node: string
  selectedNodes: Array<string>
  x: number
  y: number
}>()

const emit = defineEmits<{
  "update:node": [v: string]
}>()

const showCP = ref(false)
const store = useMainStore()
const nodeP = ref<NodeProps>({})
const swatches = Object.values(colors)
const dialogRef = ref()
const dialogSize = useElementSize(dialogRef.value, { width: 600, height: 350 })
const defaultP = {
  color: colors.blue,
  icon: "",
  size: 16,
  type: "circle" as const,
}
const iconOptions = Object.keys(codePointAsDict).map((k) => ({
  label: k,
  value: `&#x${codePointAsDict[k]};`,
}))

/** Calculate the dialog position */
const dialogPos = computed(() => {
  const res = {} as Record<string, unknown>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { innerWidth: mx, innerHeight: my } = window as any
  if (mx - props.x > 620) {
    res.left = `${props.x + 10}px`
  } else if (props.x < 620) {
    res.left = "0px"
  } else {
    res.right = `${mx - props.x - 10}px`
  }
  if (my - props.y > dialogSize.height.value + 10) {
    res.top = `${props.y + 10}px`
  } else if (props.y < dialogSize.height.value + 10) {
    res.bottom = "0px"
  } else {
    res.bottom = `${my - props.y - 10}px`
  }
  return res
})

watch(
  () => props.node,
  (v: string) => {
    if (!v) return
    if (!(v in store.optNodeProps)) {
      store.optNodeProps[v] = {}
    }
    store.optNodeProps[v].color = store.optNodeProps[v].color ?? defaultP.color
    store.optNodeProps[v].icon = store.optNodeProps[v].icon ?? defaultP.icon
    store.optNodeProps[v].size = store.optNodeProps[v].size ?? defaultP.size
    store.optNodeProps[v].type = store.optNodeProps[v].type ?? defaultP.type
    nodeP.value = store.optNodeProps[v]
  }
)

/** Apply setting to all selected nodes */
function applyToAll() {
  for (const node of props.selectedNodes) {
    if (props.node === node) continue
    $set_object(store.optNodeProps[node] as Dictionary, nodeP.value)
  }
}

/** Close the dialog and save the changes */
function close() {
  store.save()
  emit("update:node", "")
}

/** Set the node properties to default */
function setDefaults() {
  $set_object(store.optNodeProps[props.node] as Dictionary, defaultP)
  nodeP.value = store.optNodeProps[props.node]
}
</script>
