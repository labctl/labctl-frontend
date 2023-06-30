<template>
  <n-collapse
    :default-expanded-names="Object.keys(results)"
    display-directive="show"
  >
    <n-collapse-item
      v-for="(resGrp, name) in results"
      :key="`${id}${name}`"
      :title="name"
      :name="name"
    >
      <div v-for="(res, i) in resGrp" :key="`${id}${name}${i}`">
        <n-space v-if="res.prompt || res.command" justify="space-between">
          <n-tag :bordered="false" style="font-family: v-mono">
            {{ res.prompt }} <b>{{ res.command }}</b>
          </n-tag>
          <n-tag :bordered="false" round size="small">{{ res.node }}</n-tag>
        </n-space>
        <div-ansi :value="res.response" open />
      </div>
    </n-collapse-item>
  </n-collapse>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { useMainStore } from "@/stores/mainStore"
import DivAnsi from "@/components/div_ansi.vue"
import { NCollapse, NCollapseItem, NSpace, NTag } from "naive-ui"
import { WsTxResponse } from "@/utils/websocket"

export interface PropDef {
  node: string
}
const props = defineProps<PropDef>()
const store = useMainStore()
const id = `cr:${Math.random()}:${props.node}:`

const results = computed(() => {
  if (typeof store.results[props.node] === "undefined") {
    return {}
  }
  const res: Record<string, WsTxResponse[]> = {}
  let grp: string
  store.results[props.node].forEach((r) => {
    if (r.source != grp) {
      grp = r.source
      res[grp] = []
    }
    res[grp].push(r)
  })
  return res
})

//const emit = defineEmits(["update:close", "update:selected"]
</script>
