import { App } from "vue"
import vng from "v-network-graph"
import "v-network-graph/lib/style.css"

export function setupVNG(app: App) {
  app.use(vng)
}
