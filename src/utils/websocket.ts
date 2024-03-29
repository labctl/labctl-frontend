import { useEventBus } from "@vueuse/core"
import { Context, Dictionary, NodeProps, vngLayouts } from "@/utils/types"

export interface Options {
  layout: string
  height: number
  commands: string[]
  props: Record<string, NodeProps>
  // [x: string]: any;
}

export interface UiData {
  options: Options
  layouts: vngLayouts
  templates: Record<string, string>
  context?: Context
}

export interface WsTemplate {
  id: string
  /** the template name */
  name: string
  /** the template value (optional) */
  template: string
  vars: Dictionary
  result: string
  resulty?: Record<string, unknown>
}

export enum WsMsgCodes {
  template = "template",
  uidata = "uidata",
  echo = "echo",
  config = "config",
  error = "error",
  warn = "warn",
  info = "info",
  fschange = "fschange",
}

export interface WsTxResponse {
  node: string
  source: string
  prompt: string
  command: string
  response: string
  level: number
}
export interface WsConfig {
  cmd?: string
  results?: Array<WsTxResponse>
}

export interface WsMessage {
  code: WsMsgCodes
  msg?: string
  uidata?: UiData
  config?: WsConfig
  template?: WsTemplate
}

export const wsTemplateBus = useEventBus<WsTemplate>("ws-template-bus")
export const wsRxBus = useEventBus<WsMessage>("ws-bus")
export const wsTxBus = useEventBus<WsMessage>("ws-tx-bus")

export const wsSend = wsTxBus.emit
