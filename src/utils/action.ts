import { useEventBus } from "@vueuse/core"

export interface ActionEvent {
  /** action can be one of:
   * - config: Send commands using the config engine
   * - run: execute a script on the server
   * - run+: execute a long-running script on the server
   * - clab: execute clab commands (not yet implemented)
   * - path: highlight a path
   * - ssh: ssh to a node
   * - center: center the graph on a node
   */
  action:
    | "config"
    | "clab"
    | "path"
    | "center"
    | "ssh"
    | "run"
    | "run+"
    | "focus"
  command: string
}

export const actionBus = useEventBus<ActionEvent>("action")

interface Log {
  msg: string
  ev: unknown
}

export const logBus = useEventBus<Log>("log")
