import { createApp } from "vue";
import { createPinia } from "pinia";

import { setupRouter } from "@/plugins/router";
import { setupGlobalMethods } from "@/plugins/globalMethods.ts";

// v-network-graph
import VNetworkGraph from "v-network-graph";
import "v-network-graph/lib/style.css";

// Vue native sock
import VueNativeSock from "vue-native-websocket-vue3";
import { useSocketStore } from "@/stores/socketStore.ts";

import App from "@/App.vue";

import "vfonts/Lato.css"; // General Font
import "vfonts/FiraCode.css"; // Monospace Font

setupGlobalMethods();

export const app = createApp(App);

setupRouter(app);
app.use(VNetworkGraph);

// Pinia stores
const pinia = createPinia();
app.use(pinia);

app.mount("#app");

const ss = () => useSocketStore(pinia);
app.use(VueNativeSock, "ws://tes4:8080/ws", {
  store: ss(),
  format: "json",
  //   reconnection: true,
  //   reconnectionAttempts: 5,
  //   reconnectionDelay: 3000,
});
