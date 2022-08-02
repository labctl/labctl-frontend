import { createApp } from "vue";

import { setupRouter } from "@/plugins/router";
import { setupPinia } from "@/plugins/pinia";
import { setupVNG } from "@/plugins/v-network-graph";
import { setupJsonViewer } from "@/plugins/json-viewer.ts";
import { setupGlobalMethods } from "@/plugins/globalMethods.ts";

import App from "@/App.vue";

import "vfonts/Lato.css"; // General Font
import "vfonts/FiraCode.css"; // Monospace Font

setupGlobalMethods();
export const app = createApp(App);
setupRouter(app);
setupPinia(app);
setupVNG(app);
setupJsonViewer(app);
app.mount("#app");
