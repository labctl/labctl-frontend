import { defineStore } from "pinia";
import { json_fetch } from "@/utils/utils";
import { MessageApi } from "naive-ui";

import { useLocalStorage } from "@vueuse/core";
import {
  UiData,
  NodeVars,
  Links,
  Nodes,
  vngLayout,
  WsMessage,
  Options,
  WsMsgCodes,
} from "@/utils/types";
import { fFarEndNode } from "@/utils/helpers";
import { wsSend } from "@/utils/eventbus";
import { toRaw } from "vue";

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
        code: WsMsgCodes.save,
        data: {
          options: { layout: state.layout, zoom: state.zoom } as Options,
          layouts: state.layouts,
          templates: state.templates,
        } as UiData,
      } as WsMessage;
    },

    linkVars: (state) => (linkid: string) => {
      const l = state.topo.links[linkid];
      if (!l) {
        return {};
      }

      // get variables on the source node (filtered on far end node)
      let sV = state.topo.vars[l.source].clab_links.filter(
        fFarEndNode(l.target)
      );
      if (sV.length > 1) {
        sV = sV.filter((v) => {
          const p1 = l.vars.port;
          if (p1 && p1.length === 2 && v.port) {
            return p1[0] === v.port;
          }
          return true;
        });
      }

      // get variables on the target node (filtered on far end node)
      let tV = state.topo.vars[l.target].clab_links.filter(
        fFarEndNode(l.source)
      );
      if (tV.length > 1) {
        console.debug(tV);
        tV = tV.filter((v) => {
          const p1 = l.vars.port;
          if (p1 && p1.length === 2 && v.port) {
            return p1[1] === v.port;
          }
          return true;
        });
      }

      if (sV.length !== 1 || tV.length !== 1) {
        console.error(`error picking a single vars for link # ${linkid}`, [
          sV,
          tV,
        ]);
      }
      return {
        ...l,
        source_vars: sV.length == 0 ? {} : toRaw(sV[0]),
        target_vars: tV.length == 0 ? {} : toRaw(tV[0]),
        vars: toRaw(l.vars),
      };
    },
  },
  actions: {
    init() {
      // message();
      if (this.topo.name === "") {
        json_fetch("/labctl/topo").then((resp) => {
          Object.assign(this.topo, resp.data);
        });
        json_fetch("/labctl/vars").then((resp) => {
          Object.assign(this.topo.vars, resp.data);
        });
      }
    },

    load(data?: UiData) {
      if (!data) {
        console.log("no data to load");
        return;
      }
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
