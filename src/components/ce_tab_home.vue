<template>
  <p>
    Recommended commands for this lab
    <l-switch v-model:value="edit">edit</l-switch>
  </p>
  <n-table striped size="small">
    <tbody>
      <tr v-for="(cmd, idx) in optCommands" :key="`cmd:labf:${idx}`">
        <td class="rel">
          <DivMarkdown :value="cmd" @action="$emit('action', $event)" />
          <n-button-group v-if="edit" class="topright">
            <n-button x-small quaternary @click="editItem(idx)">
              <n-icon :component="ModeEditOutlineTwotone" />
            </n-button>
            <n-button
              x-small
              quaternary
              :disabled="idx == 0"
              @click="moveUp(idx)"
            >
              <n-icon :component="ArrowUpwardTwotone" />
            </n-button>

            <n-button x-small quaternary @click="addItem(idx)">
              <n-icon :component="AddTwotone" />
            </n-button>
          </n-button-group>
        </td>
      </tr>
    </tbody>
  </n-table>

  <n-modal :show="editv >= 0" @update:show="editv = -1">
    <n-card
      style="width: 90%; max-width: 980px"
      closable
      role="dialog"
      aria-modal="true"
      @close="editv = -1"
    >
      <template #header-extra>
        <n-button quaternary @click="insertLink('[{}](path:)')">
          <n-icon :component="RouteFilled" />
        </n-button>
        <n-button quaternary @click="insertLink('[{}](config:)')">
          <n-icon :component="PlayArrowTwotone" />
        </n-button>
      </template>
      <n-grid v-if="editv >= 0" cols="2" :x-gap="10">
        <n-grid-item>
          <n-input
            ref="text1"
            :value="editv >= 0 ? optCommands[editv] : ''"
            type="textarea"
            :autosize="{
              minRows: 3,
            }"
            @update:value="(v) => (optCommands[editv] = v)"
          ></n-input>
        </n-grid-item>

        <n-grid-item>
          <DivMarkdown :value="optCommands[editv]" show-msg />
        </n-grid-item>
      </n-grid>
    </n-card>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, watch, reactive, nextTick } from "vue"
import {
  InputInst,
  NButton,
  NButtonGroup,
  NCard,
  NGrid,
  NGridItem,
  NIcon,
  NInput,
  NModal,
  NTable,
} from "naive-ui"
import DivMarkdown from "@/components/div_markdown.vue"
import LSwitch from "@/components/l_switch.vue"
import {
  ModeEditOutlineTwotone,
  RouteFilled,
  PlayArrowTwotone,
  ArrowUpwardTwotone,
  AddTwotone,
} from "@vicons/material"
import { ActionEvent } from "@/utils/types"

import { useMainStore } from "@/stores/mainStore"
const store = useMainStore()
const optCommands = reactive(store.optCommands)

defineEmits<{
  (e: "action", action: ActionEvent): void
}>()

const text1 = ref<InputInst | null>(null)

let dirty = false
watch(optCommands, () => (dirty = true))

const editv = ref(-1)
watch(editv, () => {
  if (editv.value < 0 && dirty) {
    dirty = false
    // drop empties
    for (let i = optCommands.length; i--; i > 0) {
      if (optCommands[i] === "") {
        optCommands.splice(i, 1)
        console.log("remove", i)
      }
    }
    store.save()
  }
})

const edit = ref(false)

/** Insert a markdown link */
function insertLink(text: string) {
  if (!text1.value?.textareaElRef) {
    console.log("no reference to text1")
    return
  }
  const target = text1.value.textareaElRef
  const p0 = target.selectionStart
  const p1 = target.selectionEnd
  const value = optCommands[editv.value]

  // get the action & default if no selection
  let action = value.slice(p0, p1)
  if (action == "") {
    if (text.includes("config")) {
      action = "send -l show"
    }
    if (text.includes("path")) {
      action = Object.keys(store.topo.links).join(",")
    }
  }

  // set the new value. {} = action
  optCommands[editv.value] =
    value.slice(0, p0) + text.replaceAll("{}", action) + value.slice(p1)

  // set the selection
  nextTick(() => {
    target.selectionStart = p0
    target.selectionEnd = p0 + text.length
  })
}

function addItem(idx: number) {
  optCommands.splice(idx + 1, 0, "")
  editv.value = idx + 1
}

function editItem(idx: number) {
  if (idx < 0) {
    optCommands.push("")
    idx = optCommands.length - 1
  }
  editv.value = idx
  nextTick(() => text1.value?.focus())
}

function moveUp(idx: number) {
  const save = optCommands[idx]
  optCommands[idx] = optCommands[idx - 1]
  optCommands[idx - 1] = save
  editv.value--
}
</script>

<style scoped>
td.rel {
  position: relative;
}
.topright {
  /*float: right;
  margin: 25px 25px 0 0;*/
  position: absolute;
  top: 5px;
  right: 5px;
}
</style>
