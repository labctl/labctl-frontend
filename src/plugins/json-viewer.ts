import { App } from "vue";
import JsonViewer from "vue3-json-viewer";
import "vue3-json-viewer/dist/index.css";

export function setupJsonViewer(app: App) {
  app.use(JsonViewer);
}
