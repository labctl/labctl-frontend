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
              :options="tempOptions"
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
          <div
            v-if="showMd"
            class="markdown-body"
            v-html="md_2_html(comment)"
          />
          <div v-else v-html="comment" />
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
//import { Callable, IDictionary } from "@/components/types";
import { md_2_html } from "@/components/utils_md";
import { Dictionary, WsMessage } from "@/components/types";
// import { json_fetch } from "@/components/utils";
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
} from "naive-ui";
import { useMainStore } from "@/stores/mainStore";
import { watchDebounced } from "@vueuse/core";
import { templateBus, wsSend } from "@/plugins/eventbus.js";

const store = useMainStore();
// const message = useMessage();

const comment = ref("");

interface PropDef {
  /** input variables */
  vars: Dictionary;
  /** the template name */
  template: string;
  visible: boolean;
  fixedTemplate?: boolean;
}
const props = withDefaults(defineProps<PropDef>(), { fixedTemplate: false });

const emit = defineEmits(["update:template", "update:visible"]);

const dirty = ref(false);

const showVars = ref(true);
const showMd = ref(false);

const tempN = ref("");

const tempV = computed({
  get: () =>
    tempN.value in store.templates ? store.templates[tempN.value] : "",
  set: (v) => {
    store.templates[tempN.value] = v;
  },
});

watchDebounced(
  tempV,
  () => {
    // send socket
    comment.value = "...";
    const opt = {
      code: 300,
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

watch(comment, () => (dirty.value = true));

templateBus.on((t) => {
  //console.log("buss", t);
  comment.value = t.result || "";
  //console.log("res", t.template);
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

const tempOptions = computed(() =>
  Object.keys(store.templates).map((v) => {
    return {
      label: v,
      value: v,
    };
  })
);
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
