import { createApp } from "vue";
import { createPinia } from "pinia";

import { setupRouter } from "@/plugins/router";
import { setupGlobalMethods } from "@/plugins/globalMethods.ts";

// v-network-graph
import VNetworkGraph from "v-network-graph";
import "v-network-graph/lib/style.css";

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

console.log(app);

app.mount("#app");
