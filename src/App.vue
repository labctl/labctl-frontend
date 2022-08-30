<template>
  <n-config-provider
    :theme-overrides="{ common: { fontWeightStrong: '600' } }"
    :theme="store.dark ? darkTheme : lightTheme"
  >
    <n-message-provider>
      <n-notification-provider placement="bottom-right">
        <n-layout position="absolute">
          <n-layout-header
            bordered
            position="absolute"
            style="padding: 24px; padding-top: 15px; height: 64px"
          >
            <n-space justify="space-between" size="large" :wrap="false">
              <n-space justify="space-around" :wrap="false">
                <a
                  href="https://labctl.net/guide/config-engine-ui"
                  target="_blank"
                >
                  <n-image
                    :src="logoUrl"
                    :height="32"
                    preview-disabled
                  ></n-image
                ></a>
                <span style="font-size: 24px">{{ store.topo.name }}</span>
              </n-space>

              <n-space justify="end">
                <div id="mtoolbar"></div>
                <n-button
                  v-if="false"
                  :type="v_comply ? 'primary' : undefined"
                  @click="router.push({ path: '/comply' })"
                >
                  <template #icon>
                    <n-icon :size="18"><fact-check-twotone /></n-icon>
                  </template>
                  {{ v_comply ? "S" : "" }}
                </n-button>

                <n-button
                  v-if="false"
                  :type="false ? 'primary' : undefined"
                  @click="router.push({ path: '/' })"
                >
                  <template #icon>
                    <n-icon><CheckCircleTwotone /></n-icon>
                  </template>
                  {{ v_comply ? "Search" : "" }}
                </n-button>
                <n-button
                  v-if="false"
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
                <div class="nav-end">
                  <n-avatar round color="white">
                    <n-icon
                      :component="wsstatus.icon"
                      :color="wsstatus.color"
                    />
                  </n-avatar>
                </div>
              </n-space>
            </n-space>
          </n-layout-header>

          <n-layout-content
            native-scrollbar
            position="absolute"
            style="top: 64px"
          >
            <router-view />
          </n-layout-content>
        </n-layout>
      </n-notification-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { onBeforeMount, computed, watch } from "vue";
import {
  ViewListFilled,
  CheckCircleTwotone,
  FactCheckTwotone,
  ContactlessTwotone,
  ChangeCircleTwotone,
  CancelTwotone,
} from "@vicons/material";
import {
  NLayout,
  NImage,
  NNotificationProvider,
  NLayoutHeader,
  NLayoutContent,
  NButton,
  NSpace,
  NIcon,
  NConfigProvider,
  NMessageProvider,
  darkTheme,
  lightTheme,
  NAvatar,
} from "naive-ui";

import { useMainStore } from "@/stores/mainStore";
import { useRoute, useRouter } from "vue-router";
import { useWebSocket } from "@vueuse/core";
import { ws_uri } from "@/utils/utils";
import {
  wsTemplateBus,
  wsTxBus,
  WsMessage,
  WsMsgCodes,
} from "@/utils/websocket";
import logoUrl from "@/assets/labctl1.svg";

const store = useMainStore();

/** websocket to eventbus handlers */
const { status, data, send, open } = useWebSocket<string>(ws_uri, {
  heartbeat: {
    message: '{"code":"."}',
    interval: 3000,
  },
  autoReconnect: true,
  immediate: false,
});

wsTxBus.on((tx) => {
  console.debug("WS Tx", tx);
  send(JSON.stringify(tx));
});

// on any data change, transmit the message on the template bus or send to store
watch(data, (msg) => {
  if (!msg) return;
  const m: WsMessage = JSON.parse(msg);
  if (m.code === WsMsgCodes.template) {
    wsTemplateBus.emit(m.template);
  } else {
    store.websock_handler(m);
  }
});

const wsstatus = computed(() => {
  switch (status.value) {
    case "OPEN":
      return { color: "green", icon: ContactlessTwotone };
    case "CONNECTING":
      return { color: "orange", icon: ChangeCircleTwotone };

    case "CLOSED":
  }
  return { color: "red", icon: CancelTwotone };
});

onBeforeMount(() => {
  store.init();
  open();
});

const route = useRoute();
const router = useRouter();

const v_comply = computed(() => route.path.startsWith("/comply"));
</script>

<style>
/*


*/
</style>
