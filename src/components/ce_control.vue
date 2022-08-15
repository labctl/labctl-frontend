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
    <n-input v-model:value="value" type="text" placeholder="Basic Input">
    </n-input>
    <n-button @click="exec"> run </n-button>
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
import { wsSend } from "@/utils/eventbus";
import { WsMsgCodes } from "@/utils/types";

const store = useMainStore();

const emit = defineEmits(["update:close"]);
const value = ref("");
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
  wsSend({
    code: WsMsgCodes.config_cmd,
    msg: value.value,
  });
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
