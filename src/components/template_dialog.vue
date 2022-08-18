<template>
  <n-modal v-if="visible" v-model:show="visible">
    <n-card
      title="Render template"
      style="width: 95%"
      closable
      @close="visible = false"
    >
      <template #header-extra>
        <n-switch v-model:value="showVars" small>
          <template #checked> vars </template>
          <template #unchecked> vars </template>
        </n-switch>
        <n-switch v-model:value="showMd" small>
          <template #checked> md </template>
          <template #unchecked> md </template>
        </n-switch>
      </template>

      <n-grid :cols="showVars ? 3 : 2" :x-gap="6">
        <n-grid-item v-if="showVars">
          Input variables
          <json-viewer
            :value="props.vars"
            copyable
            boxed
            color
            theme="dark"
            expanded
            :expand-depth="2"
          />
        </n-grid-item>

        <n-grid-item>
          <n-space justify="space-between">
            <span>Template</span>
            <j-switch @update:value="example">
              ?
              <template #tooltip>Add an example template</template>
            </j-switch>
            <n-select
              v-model:value="tempN"
              filterable
              tag
              style="width: 200px"
              :options="tempOptions"
              :consistent-menu-width="false"
            />
          </n-space>

          <n-input
            v-model:value="tempV"
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 10 }"
            autofocus
          />
        </n-grid-item>
        <n-grid-item>
          Result
          <div class="jv-container jv-light boxed">
            <div-markdown v-if="showMd" :value="template_result" />
            <pre
              v-else
              class="jv-code"
              style="white-space: pre-line"
              v-html="template_result"
            />
          </div>
          <div
            v-if="template_resulty && Object.keys(template_resulty).length > 0"
          >
            The result contains the following variables:
            <json-viewer
              v-if="template_resulty"
              :value="template_resulty"
              copyable
              boxed
              color
              theme="dark"
              expanded
              :expand-depth="2"
            />
          </div>
        </n-grid-item>
      </n-grid>
    </n-card>
  </n-modal>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  defineProps,
  defineEmits,
  withDefaults,
} from "vue";
// eslint-diasble-next-line
import DivMarkdown from "@/components/div_markdown.vue";
import { Dictionary } from "@/utils/types";
import { WsMessage, WsMsgCodes } from "@/utils/websocket";
import {
  //useMessage,
  NCard,
  NGrid,
  NGridItem,
  NModal,
  NInput,
  NSpace,
  NSelect,
  NSwitch,
  SelectOption,
  SelectGroupOption,
} from "naive-ui";
import { useMainStore } from "@/stores/mainStore";
import { watchDebounced } from "@vueuse/core";
import { wsTemplateBus, wsSend } from "@/utils/websocket";
import JSwitch from "@/components/j_switch.vue";
import { MsgInfo } from "@/utils/message";

const store = useMainStore();
const template_result = ref("");
const template_resulty = ref({});

interface PropDef {
  /** input variables */
  vars: Dictionary;
  /** the template name */
  template: string;
  visible: boolean;

  fixedTemplate?: boolean;
  /** link is used to filter any node related templates */
  link?: boolean;
}
const props = withDefaults(defineProps<PropDef>(), {
  fixedTemplate: false,
  link: false,
});

const emit = defineEmits(["update:template", "update:visible"]);

const showVars = ref(true);
const showMd = ref(false);

const tempN = ref("");

const tempV = computed({
  get: () => {
    // console.log(tempN.value, store.templateFiles[tempN.value]);
    if (tempN.value in store.templateFiles) {
      return store.templateFiles[tempN.value].value;
    }
    return tempN.value in store.optTemplates
      ? store.optTemplates[tempN.value]
      : "";
  },
  set: (v) => {
    if (tempN.value in store.templateFiles) {
      store.templateFiles[tempN.value].value = v;
      return;
    }
    if (!(tempN.value in store.optTemplates)) {
      tempN.value = (props.link ? "link." : "node.") + tempN.value;
    }
    store.optTemplates[tempN.value] = v;
  },
});

watchDebounced(
  tempV,
  () => {
    // send socket
    template_result.value = "...";
    template_resulty.value = {};
    const opt = {
      code: WsMsgCodes.template,
      template: {
        template: tempV.value,
        name: tempN.value,
        vars: props.vars,
      },
    } as WsMessage;
    wsSend(opt);
  },
  { debounce: 1000 }
);

wsTemplateBus.on((t) => {
  template_result.value = t.result || "";
  template_resulty.value = t.resulty || {};
});

const visible = computed({
  get: () => props.visible,
  set: (vis) => {
    if (!vis) {
      emit("update:visible", false);
    }
  },
});

watch(visible, (value) => {
  if (!value) return;
  tempN.value = props.template;
});

const tempOptions = computed(() => {
  const res = [] as Array<SelectGroupOption | SelectOption>;
  const g = {} as Record<string, SelectGroupOption>;

  function grp(name: string): SelectOption[] {
    if (name in g) return g[name].children as any;
    const r = {
      type: "group",
      label: name,
      key: name,
      children: [] as SelectOption[],
    } as SelectGroupOption;
    g[name] = r;
    res.push(r);
    return r.children as any;
  }

  Object.keys(store.optTemplates).forEach((v) => {
    grp("Graph labels").push({
      label: v,
      value: v,
      disabled: (props.link ? v.indexOf("link") : v.indexOf("node")) < 0,
    } as SelectOption);
  });
  if (props.link) {
    return res;
  }
  const role = props.vars["clab_role"];
  Object.values(store.templateFiles).forEach((t) => {
    grp(`/${t.p}/`).push({
      label: t.name,
      value: t.name,
      disabled: role ? t.name.indexOf("__" + String(role)) < 0 : false,
    } as SelectOption);
  });
  return res;
});

function example() {
  const v = props.link
    ? `

source_above: {{ .source_endpoint }}
source_below: ".{{ .source_vars.clab_link_ip | ip | split "." | index -1 }}"
target_above: {{ .target_endpoint }}
target_below: ".{{ .target_vars.clab_link_ip | ip | split "." | index -1 }}"
center_above:
center_below: {{ .source_vars.clab_link_ip | split "." | slice 0 3 | join "." }}/{{ .source_vars.clab_link_ip | split "/" | index -1  }}
`
    : `

label: {{ .clab_role }}
label_below: {{ .clab_node }}`;
  if (!tempV.value.includes(v)) {
    tempV.value += v;
  } else {
    MsgInfo("example already added to the bottom");
  }
}
</script>

<style>
.vertical-center {
  margin: 0;
  position: absolute;
  top: 50%;
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
}
</style>
