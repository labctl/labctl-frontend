<template>
  <n-card closable @close="close">
    <template #header>
      <template v-if="props.link">
        Link {{ props.id }}:
        <span class="fn">{{ lnk.source }}:{{ lnk.source_endpoint }}</span> to
        <span class="fn">{{ lnk.target }}:{{ lnk.target_endpoint }}</span>
      </template>
      <template v-else> Node {{ props.id }} </template>
    </template>

    <template #header-extra>
      <n-popover v-if="!lnk" trigger="hover">
        <template #trigger>
          <n-button
            text
            style="font-size: 24px"
            @click="store.split_vars = !store.split_vars"
          >
            <n-icon
              ><splitscreen-twotone v-if="store.split_vars" />
              <fit-screen-twotone v-else />
            </n-icon>
          </n-button>
        </template>
        Toggle split vars
      </n-popover>
      <n-popover trigger="hover">
        <template #trigger>
          <n-button text style="font-size: 24px" @click="showTemplate">
            <n-icon><description-outlined /></n-icon>
          </n-button>
        </template>
        Test on a template
      </n-popover>
    </template>
    <div v-if="store.split_vars && !lnk">
      <p>
        Variables used to render templates.
        <JsonViewer :value="vars" copyable boxed color theme="dark" />
      </p>
    </div>

    <div v-else-if="!lnk">
      <p>
        Variables from the topology file and magic variables added by
        containerlab.
      </p>
      <p>Variables from the topology file:</p>
      <json-viewer
        :value="topovars"
        copyable
        boxed
        expanded
        :expand-depth="4"
        theme="dark"
      />
      <p>Variables added by containerlab</p>
      <json-viewer
        :value="newvars"
        copyable
        boxed
        theme="dark"
        expanded
        :expand-depth="2"
      />
    </div>
    <div v-else>
      <p>Variables in the topo file</p>
      <json-viewer
        :value="lnk.vars"
        copyable
        boxed
        color
        theme="dark"
        expanded
        :expand-depth="3"
      />
      <p>
        Variables available in <code>clab_links[]</code> when you render
        {{ lnk.source }}
      </p>
      <json-viewer
        :value="vars.source_vars"
        copyable
        boxed
        color
        theme="dark"
        expanded
        :expand-depth="3"
      />
      <p>
        Variables available in <code>clab_links[]</code> when you render
        {{ lnk.target }}
      </p>
      <json-viewer
        :value="vars.target_vars"
        copyable
        boxed
        color
        theme="dark"
        expanded
        :expand-depth="3"
      />
    </div>
    <vars-template-dialog
      v-if="templateVisible"
      v-model:visible="templateVisible"
      :vars="vars"
      :template="lnk ? 'link' : 'node'"
      :is-link="props.link"
      :is-node="!props.link"
    ></vars-template-dialog>
  </n-card>
</template>

<script setup lang="ts">
import { ref, computed } from "vue"
import { NCard, NButton, NIcon, NPopover } from "naive-ui"
import { useMainStore } from "@/stores/mainStore"
import { JsonViewer } from "vue3-json-viewer"
import {
  FitScreenTwotone,
  SplitscreenTwotone,
  DescriptionOutlined,
} from "@vicons/material"
import VarsTemplateDialog from "@/components/vars_template_dialog.vue"
import { sortDictionary } from "@/utils/utils"

export interface PropDef {
  id: string
  link?: boolean
}
const props = withDefaults(defineProps<PropDef>(), { link: false })

const emit = defineEmits(["update:close"])

const store = useMainStore()

const visible = ref(true)
function close() {
  emit("update:close", false)
  visible.value = false
}

const topovars = computed(() => store.topo.nodes[props.id].vars)

const vars = computed(() => {
  const v = props.link ? store.linkVars(props.id) : store.topo.vars[props.id]
  return sortDictionary(v, compareKeys, {})
})

const newvars = computed(() => {
  const v = store.topo.vars[props.id]
  return sortDictionary(v, compareKeys, topovars.value)
})

// const title = computed(() => {
//   if (!props.link) {
//     return props.id;
//   }
//   // const l = store.topo.links[props.id];
//   return `Link ${props.id}: ${link.value.source}:${link.value.source_endpoint} to ${link.value.target}:${link.value.target_endpoint}`;
// });

const lnk = computed(() => store.topo.links[props.id])

/** A compare function to move large clab vars to the end */
function compareKeys(a: string, b: string) {
  if (a === "clab_nodes") return 1
  if (b === "clab_nodes") return -1
  if (a === "clab_links") return 1
  if (b === "clab_links") return -1
  if (a === "clab_far") return 1
  if (b === "clab_far") return -1
  return a.localeCompare(b)
}

const templateVisible = ref(false)
// const templateVars = computed(() => {
//   if (!link.value) {
//     return vars.value;
//   }
//   const res: Dictionary = {};
//   res[`source`] = linkVars.value;
//   res[`target`] = linkVars.value[1];
//   return res;
// });

function showTemplate() {
  templateVisible.value = true
}
</script>

<style></style>
