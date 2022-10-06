import { useEventBus } from "@vueuse/core"

export interface ActionEvent {
  action: "config" | "clab" | "path" | "center"
  command: string
}

export const actionBus = useEventBus<ActionEvent>("action")

interface Log {
  msg: string
  ev: any
}

export const logBus = useEventBus<Log>("log")
