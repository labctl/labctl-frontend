<template>
  <n-card title="Clab Config Engine" closable @close="close">
    <template #header-extra>
      <j-switch v-model:value="showTemplates">
        <template #tooltip> Show/hide available templates </template>
        <n-icon :component="DescriptionOutlined" />
      </j-switch>
    </template>
    <div v-if="showTemplates">
      <h4>Available templates</h4>
      <n-table striped size="small">
        <thead>
          <tr>
            <th>Template</th>
            <th v-for="(n, i) in roles" :key="`r${i}`" class="cen">
              {{ n }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(rols, name) in templates" :key="name">
            <td>{{ name }}</td>
            <td v-for="(r, i) in roles" :key="`${name}_${i}`" class="cen">
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
    </div>
    <!-- <li v-for="(rols, name) in templates" :key="name">
        name:{{ name }}: {{ rols }}
      </li> -->

    <p>
      <n-input-group>
        <n-input-group-label>Run a command</n-input-group-label>
        <n-input
          v-model:value="value"
          placeholder="compare / commit / send"
          :style="{ width: '100%' }"
        >
        </n-input>
        <n-button @click="exec"> run </n-button>
      </n-input-group>
    </p>

    <p v-if="results_all.length > 0">
      <n-space justify="space-between">
        Nodes with results
        <n-space>
          <j-switch
            v-for="name in results_all"
            :key="`k_${name}`"
            :value="props.selected.includes(name)"
            @update:value="toggleSN(name)"
          >
            {{ name }}
          </j-switch>
        </n-space>
      </n-space>
    </p>

    <div v-for="name in results_selected" :key="name">
      <h2>{{ name }}</h2>
      <div v-for="(res, i) in store.results[name]" :key="`${name}_${i}`">
        <span>{{ res.source }}</span>
        <br />
        {{ res.prompt }} {{ res.command }}
        <pre>
        {{ res.response }}
        </pre>
      </div>
    </div>
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
} from "naive-ui";
import { useMainStore } from "@/stores/mainStore";
import JSwitch from "@/components/j_switch.vue";
import {
  LibraryAddCheckOutlined,
  CheckBoxOutlined,
  DescriptionOutlined,
} from "@vicons/material";

import { ceTemplateName } from "@/utils/helpers";
import { useLocalStorage } from "@vueuse/core";
import { wsSend, WsMsgCodes } from "@/utils/websocket";

export interface PropDef {
  selected: Array<string>;
}
const props = defineProps<PropDef>();
const store = useMainStore();

const emit = defineEmits(["update:close", "update:selected"]);
const value = ref("compare -l bgp -f R1");
const visible = ref(true);
const showTemplates = useLocalStorage("showTemplates", true);

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

function exec() {
  console.log("run");
  Object.keys(store.results).forEach((key) => delete store.results[key]);

  wsSend({
    code: WsMsgCodes.config,
    config: {
      cmd: value.value,
    },
  });
}

const results_all = computed(() => Object.keys(store.results).sort());
const results_selected = computed(() =>
  results_all.value.filter((v) => props.selected.includes(v))
);

function toggleSN(n: string) {
  const newp = [...props.selected];
  if (props.selected.includes(n)) {
    newp.splice(props.selected.indexOf(n), 1);
  } else {
    newp.push(n);
  }
  console.log(props.selected, newp);
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
