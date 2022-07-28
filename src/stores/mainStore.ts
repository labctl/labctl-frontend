import { defineStore } from "pinia";
import { json_fetch } from "@/components/utils";
import { MessageApi } from "naive-ui";

//eslint-disable-next-line
//import { IMe, Dictionary, Page, Standard } from "@/components/types";
import { useLocalStorage } from "@vueuse/core";

// main is the name of the store. It is unique across your application
// and will appear in devtools
function message(): MessageApi {
  return (window as any).$message;
}

export const useMainStore = defineStore("main", {
  // a function that returns a fresh state
  state: () => ({
    this_app: "",
    options: {
      name: "my-lab",
      nodes: {},
      links: {},
      vars: {},
    },
    layouts: {
      nodes: { CE1: { x: 1, y: 1 } },
    },
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
    created() {
      message();
      json_fetch("/topo").then((topo) => {
        Object.assign(this.options, topo);
      });
      json_fetch("/vars").then((vars) => {
        Object.assign(this.options.vars, vars);
      });
    },

    text_search() {},

    standards_add() {},

    standards_search() {},
  },
});
