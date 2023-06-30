import { App } from "vue"
import jsonviewer from "vue3-json-viewer"
import "vue3-json-viewer/dist/index.css"

export function setupJsonViewer(app: App) {
  app.use(jsonviewer as any) // eslint-disable-line @typescript-eslint/no-explicit-any
}
