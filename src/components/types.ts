import * as vNG from "v-network-graph";

// export interface DictionaryOf<T> {
//   [key: string]: T;
// }
// export type Comments = DictionaryOf<Dictionary>;

export type Dictionary = Record<string, unknown>;

export interface Callable<T1, T2> {
  (key: T1): T2; // eslint-disable-line no-unused-vars
}

export interface MainMessage {
  txt: string;
  obj: Record<string, unknown>;
}

export interface Dialog {
  item: Record<string, unknown>;
  show: boolean;
  close(): void;
}

export interface LabelValue {
  label: string;
  value: string;
}

export interface vngLayout {
  nodes: Record<string, vNG.Point>;
}

export interface Options {
  layout: string;
  zoom: number;
  [x: string]: any;
}

export interface UiData {
  options: Options;
  layouts: vngLayout;
  templates: Record<string, string>;
}

export interface WebSocketTemplate {
  name: string;
  template: string;
  vars: Dictionary;
  result: string;
  resulty?: Record<string, unknown>;
}

export enum WsMsgCodes {
  render = 300,
  save = 100,
  echo = 1,
}

export interface WsMessage {
  code: WsMsgCodes;
  data?: UiData;
  msg?: string;
  template?: WebSocketTemplate;
}

interface pLinkVar {
  [x: string]: any;
  clab_link_ip?: string;
  clab_link_name?: string;
  port?: string;
}

interface LinkVar extends pLinkVar {
  clab_far: Record<string, pLinkVar>;
}

interface pNodeVar {
  clab_node: string;
  clab_role: string;
  clab_system_ip?: string;
  clab_links: LinkVar[];
  [x: string]: unknown;
}

interface NodeVar extends pNodeVar {
  clab_nodes: Record<string, LinkVar>;
}

/** node from the topo file */
export interface Node extends vNG.Node {
  image?: string;
  kind?: string;
  name: string;
  vars: Record<string, any>;
}

interface topoVars extends Dictionary {
  clab_role?: string;
  clab_link_ip?: string;
  port?: string[];
}

/** link from the topo file */
export interface Link extends vNG.Edge {
  source_endpoint: string;
  target_endpoint: string;
  vars: topoVars;
}

/** topo file nodes */
export type Nodes = Record<string, Node>;
/** prepared variables */
export type NodeVars = Record<string, NodeVar>;
/** topo file links */
export type Links = Record<string, Link>;
