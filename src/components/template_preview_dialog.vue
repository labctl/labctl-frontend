<template>
  <n-modal v-if="visible" v-model:show="visible">
    <n-card
      style="width: 90%; max-width: 980px"
      closable
      @close="visible = false"
    >
      <template #header>
        Template
        <span class="fn">{{ tempFN.name }}</span> role
        <span class="fn">{{ tempFN.role }}</span>
      </template>
      <template #header-extra>
        <n-button
          tag="a"
          target="_blank"
          href="https://labctl.net/reference/template-functions"
        >
          Reference
        </n-button>
      </template>
      <p>
        Filename:
        <span class="fn"> &hellip;/{{ template.p }}/{{ template.name }} </span>
      </p>
      <p v-if="template.shadow.length">
        This template shadows/hides other templates with the same name:
        {{ template.shadow.join(", ") }}
      </p>

      <n-grid :cols="1" :x-gap="6">
        <n-grid-item>
          <n-input
            :value="template.value"
            type="textarea"
            :autosize="{ minRows: 5 }"
            autofocus
            readonly
            style="font-family: monospace"
          />
        </n-grid-item>
      </n-grid>
    </n-card>
  </n-modal>
</template>

<script setup lang="ts">
import {
  computed,
  defineProps,
  defineEmits,
  withDefaults,
  onMounted,
} from "vue";
import { NButton, NCard, NGrid, NGridItem, NModal, NInput } from "naive-ui";
import { useMainStore } from "@/stores/mainStore";
import { TemplateFile } from "@/utils/types";
import { TipsShow } from "@/utils/tips";
import { parseTemplateFN } from "@/utils/helpers";

const store = useMainStore();

interface PropDef {
  /** the template name */
  template: string;

  visible: boolean;
}
const props = withDefaults(defineProps<PropDef>(), {});

const emit = defineEmits(["update:visible", "close"]);

/** the value of the active template */
const template = computed(() => {
  const tn = props.template;
  if (tn in store.templateFiles) {
    return store.templateFiles[tn];
  }
  return {
    name: tn,
    p: "",
    shadow: [],
    value: `Template ${tn} not found...`,
  } as TemplateFile;
});

onMounted(() => {
  TipsShow("edit template");
});

/** is this dialog visible */
const visible = computed({
  get: () => props.visible,
  set: (vis) => {
    if (!vis) {
      emit("update:visible", false);
      emit("close");
    }
  },
});

const tempFN = computed(() => parseTemplateFN(props.template));
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
