<template>
  <n-modal v-if="visible" v-model:show="visible" :mask-closable="!dirty">
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
            <div
              v-if="showMd"
              class="markdown-body jv-code"
              v-html="md_2_html(template_result)"
            />
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

      <!-- <template #action>
        <n-space justify="center">
          <n-button v-if="dirty" type="primary" @click="save()">
            Save
          </n-button>
          <n-button v-if="dirty" type="error" @click="visible = false">
            Discard
          </n-button>
        </n-space>
      </template> -->
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
import { md_2_html } from "@/utils/markdown";
import { Dictionary, WsMessage, WsMsgCodes } from "@/utils/types";
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
import { wsTemplateBus, wsSend } from "@/utils/eventbus";

const store = useMainStore();
// const message = useMessage();

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

const dirty = ref(false);

const showVars = ref(true);
const showMd = ref(false);

const tempN = ref("");

const tempV = computed({
  get: () => {
    console.log(tempN.value, store.templateFiles[tempN.value]);
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
      code: WsMsgCodes.render,
      template: {
        template: tempV.value,
        name: tempN.value,
        vars: props.vars,
      },
    } as WsMessage;
    wsSend(opt);
    console.log("send", opt);
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
  console.log(role);
  Object.values(store.templateFiles).forEach((t) => {
    grp(`/${t.p}/`).push({
      label: t.name,
      value: t.name,
      disabled: role ? t.name.indexOf("__" + String(role)) < 0 : false,
    } as SelectOption);
  });
  return res;
});
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
