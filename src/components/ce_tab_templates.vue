<template>
  <h3>Available templates</h3>
  <n-table striped size="small">
    <thead>
      <tr>
        <th>Folder(s)</th>
        <th>Template</th>
        <th v-for="r in roles" :key="`ce:th:${r}`" class="cen">
          {{ r }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(rols, name) in templates" :key="`ce:t:${name}`">
        <td>
          {{
            [
              ...new Set(
                Object.keys(rols).map((r) => ".../" + getT(name, r).p)
              ),
            ].join(",")
          }}
        </td>
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

  <template-preview-dialog
    v-if="templateView !== ''"
    visible
    :template="templateView"
    @close="templateView = ''"
  ></template-preview-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { NButton, NEllipsis, NIcon, NPopover, NTable } from "naive-ui";
import { useMainStore } from "@/stores/mainStore";
import { CheckBoxOutlined, LibraryAddCheckOutlined } from "@vicons/material";

import { parseTemplateFN } from "@/utils/helpers";
import TemplatePreviewDialog from "@/components/template_preview_dialog.vue";

const store = useMainStore();

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
