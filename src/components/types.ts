//import { Component, VNodeChild } from "vue";
//import { Point } from "v-network-graph/lib/common/types";
// import { Nodes, Edges } from "v-network-graph/lib/common/types";
import * as vNG from "v-network-graph";

export type Nodes = vNG.Nodes;

export type Dictionary = Record<string, unknown>;

export type StringArr = string[];

export interface DictionaryT<T> {
  [key: string]: T;
}

export type Comments = DictionaryT<Dictionary>;

export interface Callable<T1, T2> {
  (key: T1): T2; // eslint-disable-line no-unused-vars
}

export type IDictionary = Record<string, unknown>;

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

// interface coord {
//   x: number;
//   y: number;
// }

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
}

export interface WsMessage {
  code: number;
  data: UiData;
}

export interface NodeVar {
  clab_links: Dictionary[];
  clab_nodes: Record<string, Dictionary>;
  [x: string]: any;
}

export type NodeVars = Record<string, NodeVar>;

export interface LinkVar {
  source_endpoint: string;
  target_endpoint: string;
  clab_far: Dictionary;
  [x: string]: any;
}

export interface Link extends vNG.Edge {
  vars: LinkVar;
}

export type Links = Record<string, Link>;
