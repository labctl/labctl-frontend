import { createApp } from "vue";
import { createPinia } from "pinia";

import { setupRouter } from "@/plugins/router";
import { setupGlobalMethods } from "@/plugins/globalMethods.ts";

import VNetworkGraph from "v-network-graph";
import "v-network-graph/lib/style.css";

import App from "@/App.vue";

import "vfonts/Lato.css"; // General Font
import "vfonts/FiraCode.css"; // Monospace Font

setupGlobalMethods();

const app = createApp(App);

app.use(createPinia());
setupRouter(app);
app.use(VNetworkGraph);
app.mount("#app");
