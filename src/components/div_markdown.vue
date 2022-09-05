<template>
  <div
    :xstyle="{ 'white-space': 'pre-wrap' }"
    class="markdown-body jv-code"
    @click.a="uriHandler"
    v-html="value"
  ></div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { MsgInfo } from "@/utils/message";
import { ActionEvent } from "@/utils/types";

export interface PropDef {
  value: string;
  showMsg?: boolean;
}
const props = withDefaults(defineProps<PropDef>(), {
  showMsg: false,
});

//const emit = defineEmits(["action"]);
const emit = defineEmits<{
  (e: "action", action: ActionEvent): void;
}>();

const value = computed(() => {
  const default_text = "---";
  let result = "";
  // Convert MD to html
  try {
    result = marked(props.value || default_text, { smartLists: true });
  } catch (error) {
    const value = props.value;
    /* eslint-disable-next-line no-console */
    console.error({ msg: "marked issue", value, error });
    return String(error);
  }

  // DOMPurify
  try {
    return DOMPurify.sanitize(result, {
      ALLOWED_URI_REGEXP:
        /^(?:(?:(?:f|ht)tps?|mailto|es|path|run|config|gnmic|containerlab|clab):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
    });
  } catch (error) {
    const value = props.value;
    /* eslint-disable-next-line no-console */
    console.error({ msg: "DOMPurify issue with ansiup", value, error });
    return String(error);
  }
});

/** Custom URI handler */
function uriHandler(e: Event) {
  if (e.target == null) {
    return;
  }
  const target = e.target as HTMLElement;
  if (target.tagName !== "A") {
    return;
  }
  const href = target.getAttribute("href") ?? "";
  const [proto, url] = href.split(":", 2);

  const action = {
    action: proto,
    command: url.replaceAll("/", " ").trim() || target.textContent || "",
  } as ActionEvent;
  switch (proto) {
    case "run":
      action.action = "config";
      break;
    case "containerlab":
      action.action = "clab";
      break;
  }

  e.preventDefault();
  if (props.showMsg) {
    MsgInfo(
      `Clicked on (proto:${proto})\n\n${action.action}\n${action.command}`
    );
  } else {
    emit("action", action);
  }
}
</script>

<style>
@import "@/assets/github-markdown.css";

.markdown-body {
  box-sizing: border-box;
  min-width: 200px;
  max-width: 980px;
  margin: 0 auto;
  padding: 10px;
}

@media (max-width: 767px) {
  .markdown-body {
    padding: 15px;
  }
}
</style>
