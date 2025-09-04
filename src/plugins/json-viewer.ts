import { App } from "vue"
import jsonviewer from "vue3-json-viewer"
import "vue3-json-viewer/dist/vue3-json-viewer.css"

export function setupJsonViewer(app: App) {
  app.use(jsonviewer as any)
}
