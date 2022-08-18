<template>
  <n-card
    title="Config Engine"
    closable
    :style="{
      'min-height': '500px',
    }"
    @close="close"
  >
    <template #header-extra>
      <n-tabs
        v-model:value="selected_tab"
        type="bar"
        size="large"
        :style="{ 'margin-right': '20px' }"
      >
        <n-tab name="commands">
          <n-icon :component="HomeOutlined" />
        </n-tab>
        <n-tab name="command">
          <n-icon :component="PlayArrowTwotone" />
        </n-tab>
        <n-tab name="templates">
          <n-icon :component="DescriptionOutlined" />
        </n-tab>
      </n-tabs>
    </template>
    <div v-if="selected_tab === 'templates'">
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
                  <n-icon
                    :component="
                      getT(name, r).shadow.length
                        ? LibraryAddCheckOutlined
                        : CheckBoxOutlined
                    "
                    size="18px"
                  />
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
                <n-ellipsis :line-clamp="5">
                  <pre>{{ getT(name, r).value }}</pre>
                </n-ellipsis>
              </n-popover>
            </td>
          </tr>
        </tbody>
      </n-table>

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
            <td>{{ name }}</td>
            <td>{{ store.topo.vars[name].clab_role }}</td>
            <td>{{ node.kind }}</td>
            <td>{{ store.topo.vars[name].clab_system_ip }}</td>
            <td>{{ node.image }}</td>
          </tr>
        </tbody>
      </n-table>
    </div>

    <div v-else-if="selected_tab === 'commands'">
      {{ optCommands }}
    </div>

    <div v-else-if="selected_tab === 'command'">
      <p>
        <n-input-group>
          <n-input-group-label>Run a command</n-input-group-label>
          <n-input
            v-model:value="value"
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
              @update:value="toggleSN(name)"
            >
              {{ name }}
            </j-switch>
          </n-space>
        </n-space>
      </p>

      <n-tabs type="card" tab-style="min-width: 80px;">
        <n-tab-pane tab="Info" name="info">
          <template #prefix>
            <n-icon><play-arrow-twotone /> </n-icon>
          </template>
          The current results were obtained by running "{{ last_run }}".
        </n-tab-pane>

        <n-tab-pane
          v-for="name in results_all"
          :key="`ce:tabs:${name}`"
          :tab="name"
          :name="name"
        >
          <config-results :node="name"></config-results>
        </n-tab-pane>
      </n-tabs>
    </div>

    <div v-else>unknown tab ?? {{ selected_tab }}</div>
    <!-- <div v-for="name in results_selected" :key="name">

    </div> -->
  </n-card>
</template>

<script setup lang="ts">
import { ref, defineEmits, computed } from "vue";
import {
  NCard,
  NIcon,
  NPopover,
  NTable,
  NEllipsis,
  NInput,
  NButton,
  NInputGroup,
  NInputGroupLabel,
  NSpace,
  NTabPane,
  NTabs,
  NTab,
} from "naive-ui";
import { useMainStore } from "@/stores/mainStore";
import JSwitch from "@/components/j_switch.vue";
import {
  LibraryAddCheckOutlined,
  CheckBoxOutlined,
  DescriptionOutlined,
  PlayArrowTwotone,
  HomeOutlined,
} from "@vicons/material";
import ConfigResults from "@/components/config_results.vue";

import { ceTemplateName } from "@/utils/helpers";
import { wsSend, WsMsgCodes, wsRxBus } from "@/utils/websocket";
import { storeToRefs } from "pinia";
import { MsgWarning } from "@/utils/message";

export interface PropDef {
  selected: Array<string>;
}
const props = defineProps<PropDef>();
const store = useMainStore();
const loading_config = ref(false);

const { optCommands } = storeToRefs(store);

const emit = defineEmits(["update:close", "update:selected"]);
const value = ref("compare -l ports -f R1,R2");
const visible = ref(true);
const selected_tab = ref("command");

const templates = computed(() => {
  const roles = {} as Record<string, Record<string, boolean>>;
  Object.keys(store.templateFiles)
    .sort()
    .forEach((fn) => {
      const tn = ceTemplateName(fn);
      if (!(tn.name in roles)) {
        roles[tn.name] = {} as Record<string, boolean>;
      }
      roles[tn.name][tn.role] = true;
    });
  return roles;
});

const roles = computed(() => {
  const r = new Set<string>();
  Object.keys(store.templateFiles).forEach((fn) => {
    const tn = ceTemplateName(fn);
    r.add(tn.role);
  });
  return [...r].sort();
});

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

const last_run = ref("");
/** Run the config command */
function run_config() {
  if (loading_config.value) {
    MsgWarning("Busy executing config");
    return;
  }
  last_run.value = value.value;
  optCommands.value[0] = value.value;
  Object.keys(store.results).forEach((key) => delete store.results[key]);
  loading_config.value = true;

  wsSend({
    code: WsMsgCodes.config,
    config: {
      cmd: value.value,
    },
  });
}

const results_all = computed(() => Object.keys(store.results).sort());
// const results_selected = computed(() =>
//   results_all.value.filter((v) => props.selected.includes(v))
// );

wsRxBus.on((msg) => {
  if (msg.code === WsMsgCodes.config && msg.config && msg.config.results) {
    // add this node to selected
    const n = msg.config.results[0].node;
    if (!(n in props.selected)) {
      toggleSN(n);
    }
  }

  if (msg.code === WsMsgCodes.config && msg.config?.cmd) {
    // wait for 1second before allowing more commands
    setTimeout(() => {
      loading_config.value = false;
    }, 100);
  }
});

function toggleSN(n: string) {
  const newp = [...props.selected];
  if (props.selected.includes(n)) {
    newp.splice(props.selected.indexOf(n), 1);
  } else {
    newp.push(n);
  }
  emit("update:selected", newp);
}

function close() {
  emit("update:close", false);
  visible.value = false;
}
</script>

<style>
span.fn {
  /*border: 1px solid black;*/
  background-color: aliceblue;
  padding: 4px;
}
td.cen,
th.cen {
  text-align: center;
}
</style>
