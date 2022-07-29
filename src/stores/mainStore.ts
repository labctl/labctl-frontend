import { defineStore } from "pinia";
import { json_fetch } from "@/components/utils";
import { MessageApi } from "naive-ui";

//eslint-disable-next-line
//import { IMe, Dictionary, Page, Standard } from "@/components/types";
import { useLocalStorage } from "@vueuse/core";
import { UiData } from "@/components/types";

// main is the name of the store. It is unique across your application
// and will appear in devtools
function message(): MessageApi {
  return (window as any).$message;
}

export const useMainStore = defineStore("main", {
  // a function that returns a fresh state
  state: () => ({
    this_app: "",
    topo: {
      name: "my-lab",
      nodes: {},
      links: {},
      vars: {},
    },
    lab: {
      options: {
        layout: "grid",
      },
      layouts: {
        nodes: {},
      },
    } as UiData,
    loading: 0,
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
      message();
      json_fetch("/topo").then((topo) => {
        Object.assign(this.topo, topo);
      });
      json_fetch("/vars").then((vars) => {
        Object.assign(this.topo.vars, vars);
      });
    },

    text_search() {},

    standards_add() {},

    standards_search() {},
  },
});
