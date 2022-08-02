import { App } from "vue";
import VNetworkGraph from "v-network-graph";
import "v-network-graph/lib/style.css";

export function setupVNG(app: App) {
  app.use(VNetworkGraph);
}
