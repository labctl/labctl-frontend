import {
  Edge as vngEdge,
  Node as vngNode,
  Point as vngPoint,
} from "v-network-graph"

export type { Layouts as vngLayouts } from "v-network-graph"

// export interface DictionaryOf<T> {
//   [key: string]: T;
// }
// export type Comments = DictionaryOf<Dictionary>;

export type Dictionary = Record<string, unknown>

export interface Callable<T1, T2> {
  (key: T1): T2 // eslint-disable-line no-unused-vars
}

export interface Callable2<T1, T2, T3> {
  (v1: T1, v2: T2): T3
}

export interface MainMessage {
  txt: string
  obj: Record<string, unknown>
}

export interface Dialog {
  item: Record<string, unknown>
  show: boolean
  close(): void
}

export type Point = vngPoint

interface pLinkVar {
  [x: string]: unknown
  clab_link_ip?: string
  clab_link_name?: string
  port?: string
}

interface LinkVar extends pLinkVar {
  clab_far: Record<string, pLinkVar>
}

interface pNodeVar {
  clab_node: string
  clab_role: string
  clab_system_ip?: string
  clab_links: LinkVar[]
  [x: string]: unknown
}

interface NodeVar extends pNodeVar {
  clab_nodes: Record<string, LinkVar>
}

/** node from the topo file */
export interface Node extends vngNode {
  name: string
  vars: Record<string, unknown>
  /** Docker image */
  image?: string
  kind?: string
  // icon?: string
  // color?: string
  // /** default: 16 */
  // radius?: number
}

interface topoVars extends Dictionary {
  clab_role?: string
  clab_link_ip?: string
  port?: string[]
}

/** link from the topo file */
export interface Link extends vngEdge {
  source_endpoint: string
  target_endpoint: string
  vars: topoVars
}

/** topo file nodes */
export type Nodes = Record<string, Node>
/** prepared variables */
export type NodeVars = Record<string, NodeVar>
/** topo file links */
export type Links = Record<string, Link>

export interface JsonResponse {
  ok: boolean
  msg?: string
  data: Dictionary
}

/** labctl Template struct from the server */
export interface TemplateFile {
  name: string
  p: string
  shadow: string[]
  value: string
}

/** linkLabels */
export interface LinkLabels {
  source_above?: string
  source_below?: string
  target_above?: string
  target_below?: string
  center_above?: string
  center_below?: string
  size: number
}
export interface NodeLabels {
  label_below?: string
  label?: string
  size?: number
}

export interface Context {
  command: string
  topofile: string
  topoerror: string
  template_paths: string[]
}

// Node Properties
// https://dash14.github.io/v-network-graph/examples/appearance.html
export interface NodeProps {
  color?: string
  icon?: string
  size?: number
  type?: "circle" | "rect"
}
