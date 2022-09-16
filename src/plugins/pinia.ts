import { App } from "vue"
import { createPinia } from "pinia"
import { PiniaDebounce } from "@pinia/plugin-debounce"
import { useDebounceFn } from "@vueuse/core"

export function setupPinia(app: App) {
  // Pinia stores
  const pinia = createPinia()
  // Pass the plugin to your application's pinia plugin
  pinia.use(PiniaDebounce(useDebounceFn))
  app.use(pinia)
}
