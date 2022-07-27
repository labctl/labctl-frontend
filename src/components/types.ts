//import { Component, VNodeChild } from "vue";

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
