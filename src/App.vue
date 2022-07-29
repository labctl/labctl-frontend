<template>
  <n-message-provider>
    <n-config-provider
      :theme-overrides="{ common: { fontWeightStrong: '600' } }"
      :theme="store.dark ? darkTheme : lightTheme"
    >
      <!-- <n-layout class="root-layout" has-sider>
        <n-layout-sider
          bordered
          show-trigger="arrow-circle"
          collapse-mode="width"
          :collapsed-width="120"
          :width="240"
          content-style="padding: 24px;"
          >a</n-layout-sider
        > -->
      <n-layout position="absolute">
        <n-layout-header
          bordered
          position="absolute"
          style="padding: 24px; padding-top: 15px; height: 64px"
        >
          <n-space justify="space-between" size="large" :wrap="false">
            <n-space justify="space-around" :wrap="false">
              <n-icon size="24" style="padding-top: 6px"><RadarRound /></n-icon>
              <span style="font-size: 24px">{{ store.topo.name }}</span>
            </n-space>
            <!-- <n-text tag="div" class="ui-logo" :depth="1"> </n-text> -->
            <!--v-spacer />-->

            <n-space justify="end">
              <div id="mtoolbar"></div>
              <n-button
                :type="v_comply ? 'primary' : undefined"
                @click="router.push({ path: '/comply' })"
              >
                <template #icon>
                  <n-icon :size="18"><fact-check-twotone /></n-icon>
                </template>
                {{ v_comply ? "Standards" : "" }}
              </n-button>

              <n-button
                :type="false ? 'primary' : undefined"
                @click="router.push({ path: '/' })"
              >
                <template #icon>
                  <n-icon><CheckCircleTwotone /></n-icon>
                </template>
                {{ v_comply ? "Search" : "" }}
              </n-button>
              <n-button
                :type="v_comply ? 'primary' : undefined"
                @click="
                  router.push({
                    path: '',
                  })
                "
              >
                <template #icon>
                  <n-icon><view-list-filled /></n-icon>
                </template>
                {{ v_comply ? "RN" : "" }}
              </n-button>
              <!-- <n-input
                v-model:value="store.text"
                :loading="store.loading > 0"
                placeholder="Search"
                @focus="search_field_focus = true"
                @blur="search_field_focus = false"
                @keyup.enter="search"
              >
                <template #prefix>
                  <n-button text @click="search">
                    <template #icon>
                      <n-icon><SearchFilled /></n-icon>
                    </template>
                  </n-button>
                </template>
              </n-input> -->
              <div class="nav-end">
                {{ isConnected }}<span v-if="isConnected">yes</span>
                <span v-else>x</span>
              </div>
            </n-space>
          </n-space>
        </n-layout-header>

        <!-- v-if ensures router views only visible after store initialized (options loaded) -->
        <n-layout-content
          native-scrollbar
          position="absolute"
          style="top: 64px"
        >
          <router-view />
        </n-layout-content>
      </n-layout>
    </n-config-provider>
  </n-message-provider>
</template>

<script setup lang="ts">
import { onBeforeMount, computed, watch, toRaw } from "vue";
import {
  RadarRound,
  ViewListFilled,
  CheckCircleTwotone,
  FactCheckTwotone,
} from "@vicons/material";
import {
  NLayout,
  NLayoutHeader,
  NLayoutContent,
  NButton,
  NSpace,
  NIcon,
  NConfigProvider,
  NMessageProvider,
  darkTheme,
  lightTheme,
} from "naive-ui";

//import { IMe } from "@/componen ts/types";

import { useMainStore } from "@/stores/mainStore";
import { useSocketStore } from "@/stores/socketStore";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { WsMessage } from "@/components/types";

const store = useMainStore();
const socket = useSocketStore();

//const app = getCurrentInstance().appContext.app;
onBeforeMount(() => {
  store.init();
  socket.init();
  //console.log("app.vue", app);
});

const { isConnected, message } = storeToRefs(socket);

watch(message, (message: WsMessage) => {
  const m = toRaw(message);
  console.log("watchm", m);
  if (m.code === 100) {
    console.log(m.code);
    //if (m.data.layouts) {}
    store.lab = m.data;
  }
});

const route = useRoute();
const router = useRouter();

const v_comply = computed(() => route.path.startsWith("/comply"));
</script>

<style>
@import "./assets/github-markdown.css";

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
