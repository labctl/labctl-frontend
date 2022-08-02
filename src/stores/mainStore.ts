import { defineStore } from "pinia";
import { json_fetch } from "@/components/utils";
import { MessageApi } from "naive-ui";

//eslint-disable-next-line
//import { IMe, Dictionary, Page, Standard } from "@/components/types";
import { useLocalStorage } from "@vueuse/core";
import {
  Options,
  UiData,
  NodeVars,
  Links,
  Nodes,
  vngLayout,
} from "@/components/types";
import { wsSend } from "./socketStore";

// main is the name of the store. It is unique across your application
// and will appear in devtools
export function message(): MessageApi {
  return (window as any).$message;
}

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
    layouts: {
      nodes: {},
    } as vngLayout,
    //** fire an event from App.vue for the websocket messages */
    event: 0, // a
    /** used while loading (?) */
    loading: 0,
    /** split vars or show the merge value! */
    split_vars: useLocalStorage("split_vars", true),
    /** dark theme */
    dark: useLocalStorage("dark_mode", false),
  }),
  // optional getters
  getters: {
    // getters receive the state as first parameter
    // doubleCount: (state) => state.counter * 2,
    // // use getters in other getters
    // doubleCountPlusOne(): number {
    //   return this.doubleCount + 1
    // },
  },
  // optional actions
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
      this.zoom = 0.5;
    },

    save() {
      const opt = {
        layout: this.layout,
        zoom: this.zoom,
      } as Options;
      console.log("save layouts+", opt);
      wsSend({
        code: 100,
        data: {
          options: opt,
          layouts: this.layouts,
        } as UiData,
      });
    },
  },
  debounce: {
    save: 1500, // debounce save by 300ms
  },
});
