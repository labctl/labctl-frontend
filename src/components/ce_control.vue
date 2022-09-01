<template>
  <n-card
    title="Config Engine"
    closable
    style="min-height: 500px"
    @close="close"
  >
    <template #header-extra>
      <n-tabs
        v-model:value="selected_tab"
        type="bar"
        size="large"
        :style="{ 'margin-right': '20px' }"
      >
        <n-tab :name="tab.home">
          <n-icon :component="HomeOutlined" />
        </n-tab>
        <n-tab :name="tab.run">
          <n-badge type="warning" processing :value="results_all.length">
            <n-icon
              :component="PlayArrowTwotone"
              color="var(--n-tab-text-color)"
            />
          </n-badge>
        </n-tab>
        <n-tab :name="tab.vars">
          <n-badge
            type="info"
            processing
            :value="props.selected.length + props.selectedLinks.length"
          >
            <n-icon
              :component="SettingsEthernetOutlined"
              color="var(--n-tab-text-color)"
            />
          </n-badge>
        </n-tab>
        <n-tab :name="tab.templates">
          <n-icon :component="DescriptionOutlined" />
        </n-tab>
      </n-tabs>
      <n-button
        quaternary
        tiny
        :focusable="false"
        @click="$emit('update:visible', visible > 1 ? 1 : 2)"
      >
        <n-icon
          :component="
            visible > 1 ? ArrowMinimize20Regular : FullScreenMaximize20Filled
          "
      /></n-button>
    </template>

    <div v-if="selected_tab === tab.home">
      <p>Recommended commands for this lab</p>
      <n-table striped size="small">
        <thead>
          <tr>
            <th>Command</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(cmd, idx) in optCommands" :key="`cmd:labf:${idx}`">
            <td>
              <pre>{{ cmd }}</pre>
            </td>
            <td>
              <n-button x-small @click="newCmd(cmd)">use</n-button>
            </td>
          </tr>
        </tbody>
      </n-table>
    </div>

    <div v-else-if="selected_tab === tab.run">
      <p>
        <n-input-group>
          <n-input-group-label>Run a command</n-input-group-label>
          <n-input
            v-model:value="cmd_active"
            autofocus
            placeholder="compare / commit / send"
            :style="{ width: '100%' }"
            @keyup.ctrl.enter="run_config"
          >
          </n-input>
          <n-button :loading="loading_config" @click="run_config">
            <template #icon>
              <n-icon><play-arrow-twotone /> </n-icon>
            </template>
          </n-button>
        </n-input-group>
      </p>

      <p v-if="results_all.length > 0">
        <n-space justify="space-between">
          Nodes with results
          <n-space>
            <j-switch
              v-for="name in results_all"
              :key="`ce:nres:${name}`"
              :value="props.selected.includes(name)"
              @update:value="toggleSelected(name)"
            >
              {{ name }}
            </j-switch>
          </n-space>
        </n-space>
      </p>

      <p v-if="cmd_lastrun != ''">
        The current results were obtained by running "{{ cmd_lastrun }}".
      </p>

      <n-grid :cols="2">
        <n-grid-item
          v-for="name in results_selected"
          :key="`ce:tabs:${name}`"
          :tab="name"
          :name="name"
        >
          <config-results :node="name"></config-results>
        </n-grid-item>
      </n-grid>
    </div>

    <div v-else-if="selected_tab === tab.vars">
      <template
        v-if="props.selected.length > 0 || props.selectedLinks.length > 0"
      >
        <h3>Available variables</h3>
        <n-grid :cols="2">
          <n-grid-item v-for="nid in props.selected" :key="`gnode:${nid}`">
            <vars-view :id="nid" @close="toggleSelected(nid, false)" />
          </n-grid-item>

          <n-grid-item v-for="lid in props.selectedLinks" :key="`glink:${lid}`">
            <vars-view :id="lid" link @close="popLink(lid)" />
          </n-grid-item>
        </n-grid>
      </template>
      <template v-else>
        <p>Select a node/link to show available variables.</p>

        <h3>Available nodes</h3>
        <n-table striped size="small">
          <thead>
            <tr>
              <th>Node</th>
              <th>Role</th>
              <th>Kind</th>
              <th>system_ip</th>
              <th>Image</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(node, name) in store.topo.nodes" :key="`a:nde:${name}`">
              <td>
                <n-button
                  quaternary
                  x-small
                  @click="toggleSelected(name, true)"
                >
                  {{ name }}
                </n-button>
              </td>
              <td>{{ store.topo.vars[name].clab_role }}</td>
              <td>{{ node.kind }}</td>
              <td>{{ store.topo.vars[name].clab_system_ip }}</td>
              <td>{{ node.image }}</td>
            </tr>
          </tbody>
        </n-table>
      </template>
    </div>

    <div v-else-if="selected_tab === tab.templates">
      <h3>Available templates</h3>
      <n-table striped size="small">
        <thead>
          <tr>
            <th>Template</th>
            <th v-for="r in roles" :key="`ce:th:${r}`" class="cen">
              {{ r }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(rols, name) in templates" :key="`ce:t:${name}`">
            <td>{{ name }}</td>
            <td v-for="(r, i) in roles" :key="`td:${name}_${i}`" class="cen">
              <n-popover v-if="rols[r]" trigger="hover">
                <template #trigger>
                  <n-button
                    quaternary
                    small
                    @click="templateView = getT(name, r).name"
                  >
                    <n-icon
                      :component="
                        getT(name, r).shadow.length
                          ? LibraryAddCheckOutlined
                          : CheckBoxOutlined
                      "
                      size="18px"
                    />
                  </n-button>
                </template>

                <p>
                  Template file:
                  <span class="fn">
                    &hellip;/{{ getT(name, r).p }}/{{ getT(name, r).name }}
                  </span>
                </p>
                <p v-if="getT(name, r).shadow.length">
                  Shadows
                  <span class="fn">
                    &hellip;/{{ getT(name, r).shadow.join(", ") }}/
                  </span>
                </p>
                <n-ellipsis :line-clamp="5" :tooltip="false">
                  <pre><code>{{ getT(name, r).value }}</code></pre>
                </n-ellipsis>
              </n-popover>
            </td>
          </tr>
        </tbody>
      </n-table>
    </div>

    <div v-else>unknown tab ?? {{ selected_tab }}</div>
  </n-card>
  <template-preview-dialog
    v-if="templateView !== ''"
    visible
    :template="templateView"
    @close="templateView = ''"
  ></template-preview-dialog>
</template>

<script setup lang="ts">
import { ref, defineEmits, computed } from "vue";
import {
  NBadge,
  NButton,
  NCard,
  NEllipsis,
  NGrid,
  NGridItem,
  NIcon,
  NInput,
  NInputGroup,
  NInputGroupLabel,
  NPopover,
  NSpace,
  NTab,
  NTable,
  NTabs,
} from "naive-ui";
import { useMainStore } from "@/stores/mainStore";
import JSwitch from "@/components/j_switch.vue";
import VarsView from "@/components/vars_view.vue";
import {
  CheckBoxOutlined,
  DescriptionOutlined,
  HomeOutlined,
  LibraryAddCheckOutlined,
  PlayArrowTwotone,
  SettingsEthernetOutlined,
} from "@vicons/material";
import {
  FullScreenMaximize20Filled,
  ArrowMinimize20Regular,
} from "@vicons/fluent";
import ConfigResults from "@/components/config_results.vue";

import { parseTemplateFN } from "@/utils/helpers";
import { wsSend, WsMsgCodes, wsRxBus } from "@/utils/websocket";
import { storeToRefs } from "pinia";
import { MsgWarning } from "@/utils/message";
import TemplatePreviewDialog from "@/components/template_preview_dialog.vue";

export interface PropDef {
  visible: number;
  selected: Array<string>;
  selectedLinks: Array<string>;
}
const props = defineProps<PropDef>();
const store = useMainStore();
const loading_config = ref(false);

const { optCommands } = storeToRefs(store);

enum tab {
  home = "home",
  run = "run",
  templates = "templates",
  vars = "vars",
}

const emit = defineEmits([
  "update:visible",
  "update:selected",
  "update:selectedLinks",
]);
const cmd_active = ref("");
const selected_tab = ref(optCommands.value.length > 0 ? tab.home : tab.run);

/** Dict of all templates, values includes all roles */
const templates = computed(() => {
  const temps = {} as Record<string, Record<string, boolean>>;
  Object.keys(store.templateFiles)
    .sort()
    .forEach((fn) => {
      const tn = parseTemplateFN(fn);
      if (!(tn.name in temps)) {
        temps[tn.name] = {} as Record<string, boolean>;
      }
      temps[tn.name][tn.role] = true;
    });
  return temps;
});

/** List available roles/kinds from the templateFiles */
const roles = computed(() => {
  const ra = Object.keys(store.templateFiles).map(
    (fn) => parseTemplateFN(fn).role
  );
  const rs = new Set<string>(ra);
  return [...rs].sort();
});

/** Get the templateFile from the store using name & role */
function getT(name: string, role: string) {
  const n = `${name}__${role}.tmpl`;
  return n in store.templateFiles
    ? store.templateFiles[n]
    : {
        name: n,
        p: "",
        value: "",
        shadow: [],
      };
}

const cmd_lastrun = ref("");
/** Run the config command */
function run_config() {
  if (loading_config.value) {
    MsgWarning("Busy executing config");
    return;
  }
  cmd_lastrun.value = cmd_active.value;
  Object.keys(store.results).forEach((key) => delete store.results[key]);
  loading_config.value = true;

  wsSend({
    code: WsMsgCodes.config,
    config: {
      cmd: cmd_active.value,
    },
  });
}

const results_all = computed(() => Object.keys(store.results).sort());
const results_selected = computed(() =>
  Object.keys(store.results)
    .sort()
    .filter((v) => props.selected.includes(v))
);

wsRxBus.on((msg) => {
  if (msg.code === WsMsgCodes.config && msg.config && msg.config.results) {
    // add this node to selected
    const n = msg.config.results[0].node;
    toggleSelected(n, true);
  }

  if (msg.code === WsMsgCodes.config && msg.config?.cmd) {
    // wait for 1second before allowing more commands
    setTimeout(() => {
      loading_config.value = false;
    }, 100);
  }
});

/** Toggle the selected nodes, or set it to a specific value (setTo) */
function toggleSelected(n: string, setTo?: boolean) {
  const current = props.selected.includes(n);
  if (typeof setTo === "undefined") {
    setTo = !current; // toggle
  }
  if (setTo == current) {
    return; // no changes
  }
  const newp = [...props.selected];
  if (setTo) {
    newp.push(n);
  } else {
    newp.splice(newp.indexOf(n), 1);
  }
  emit("update:selected", newp);
}

/** Remove a link from the selectedLinks */
function popLink(linkId: string) {
  const newL = [...props.selectedLinks];
  newL.splice(newL.indexOf(linkId), 1);
  emit("update:selectedLinks", newL);
}

function newCmd(cmd: string) {
  console.log("old command", cmd_active.value);
  cmd_active.value = cmd;
  selected_tab.value = tab.run;
}

function close() {
  emit("update:visible", 0);
}

const templateView = ref("");
</script>

<style>
span.fn {
  /*border: 1px solid black;*/
  background-color: aliceblue;
  padding: 5px;
  margin-left: 3px;
  margin-right: 3px;
}
td.cen,
th.cen {
  text-align: center;
}
</style>
