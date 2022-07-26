<template>
  <n-config-provider
    :theme-overrides="{ common: { fontWeightStrong: '600' } }"
    :theme="theme"
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
                <div class="nav-end">
                  <n-avatar round color="white" @click="open_if_closed">
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
            :style="{
              top: '64px',
              '--n-font-family': theme.common.fontFamily,
              '--n-font-family-mono': theme.common.fontFamilyMono,
              '--n-font-size-tiny': theme.common.fontSizeTiny,
            }"
          >
            <router-view />
          </n-layout-content>
        </n-layout>
      </n-notification-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { onBeforeMount, computed, watch } from "vue"
import {
  ContactlessTwotone,
  ChangeCircleTwotone,
  CancelTwotone,
} from "@vicons/material"
import {
  NLayout,
  NImage,
  NNotificationProvider,
  NLayoutHeader,
  NLayoutContent,
  NSpace,
  NIcon,
  NConfigProvider,
  NMessageProvider,
  darkTheme,
  lightTheme,
  NAvatar,
} from "naive-ui"

import { useMainStore } from "@/stores/mainStore"
import { useWebSocket } from "@vueuse/core"
import { ws_uri } from "@/utils/const"
import {
  wsTemplateBus,
  wsTxBus,
  WsMessage,
  WsMsgCodes,
} from "@/utils/websocket"
import logoUrl from "@/assets/labctl1.svg"

const store = useMainStore()

const theme = computed(() => (store.dark ? darkTheme : lightTheme))

/** websocket to eventbus handlers */
const { status, data, send, open } = useWebSocket<string>(ws_uri, {
  heartbeat: {
    message: "%",
    interval: 5000,
    pongTimeout: 15000,
  },
  // autoReconnect: true,
  immediate: false,
})

wsTxBus.on((tx) => {
  console.debug("WS Tx", tx)
  send(JSON.stringify(tx))
})

// on any data change, transmit the message on the template bus or send to store
watch(data, (msg) => {
  if (!msg) return
  const m: WsMessage = JSON.parse(msg)
  if (m.code === WsMsgCodes.template) {
    wsTemplateBus.emit(m.template)
  } else {
    store.websock_handler(m)
  }
})

watch(status, (s) => {
  if (s === "CLOSED") {
    setTimeout(open_if_closed, 2000)
  }
})

const wsstatus = computed(() => {
  switch (status.value) {
    case "OPEN":
      return { color: "green", icon: ContactlessTwotone }
    case "CONNECTING":
      return { color: "orange", icon: ChangeCircleTwotone }
    case "CLOSED":
  }
  return { color: "red", icon: CancelTwotone }
})

onBeforeMount(() => {
  store.init()
  open()
})

function open_if_closed() {
  if (status.value !== "OPEN") {
    open()
  }
}
</script>

<style>
div.jv-container,
.jv-container.jv-dark {
  font-family: var(--n-font-family-mono);
  font-size: var(--n-font-size-tiny);
}
.jv-container .jv-code {
  padding: 10px;
}
</style>
