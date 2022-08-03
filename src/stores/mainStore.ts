import { defineStore } from "pinia";
import { json_fetch } from "@/components/utils";
import { MessageApi } from "naive-ui";

//eslint-disable-next-line
//import { IMe, Dictionary, Page, Standard } from "@/components/types";
import { useLocalStorage } from "@vueuse/core";
import {
  UiData,
  NodeVars,
  Links,
  Nodes,
  vngLayout,
  WsMessage,
  Options,
} from "@/components/types";
import { wsSend } from "@/plugins/eventbus";

export function message(): MessageApi {
  return (window as any).$message;
}

// main is the name of the store. It is unique across your application
// and will appear in devtools
export const useMainStore = defineStore("main", {
  // a function that returns a fresh state
  state: () => ({
    topo: {
      name: "",
      nodes: {} as Nodes,
      links: {} as Links,
      /** compiled vars per NE */
      vars: {} as NodeVars,
    },
    layout: "grid",
    zoom: 1.5,
    templates: {} as Record<string, string>,
    layouts: {
      nodes: {},
    } as vngLayout,
    /** used while loading (?) */
    loading: 0,
    /** split vars or show the merge value! */
    split_vars: useLocalStorage("split_vars", true),
    /** dark theme */
    dark: useLocalStorage("dark_mode", false),
  }),
  // optional getters
  getters: {
    wsState: (state) => {
      return {
        code: 100,
        data: {
          options: { layout: state.layout, zoom: state.zoom } as Options,
          layouts: state.layouts,
          templates: state.templates,
        } as UiData,
      } as WsMessage;
    },
  },
  actions: {
    init() {
      // message();
      if (this.topo.name === "") {
        json_fetch("/topo").then((topo) => {
          Object.assign(this.topo, topo);
        });
        json_fetch("/vars").then((vars) => {
          Object.assign(this.topo.vars, vars);
        });
      }
    },

    load(data: UiData) {
      console.log("load layouts+", data.options);
      Object.assign(this, data.options);
      this.layouts = data.layouts;
      this.templates = data.templates;
    },

    save() {
      console.log("save layouts+", this.wsState.data?.options);
      wsSend(this.wsState);
    },
  },
  debounce: {
    save: 1500, // debounce save by 300ms
  },
});
