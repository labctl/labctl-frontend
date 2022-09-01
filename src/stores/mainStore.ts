import { defineStore } from "pinia";
import { json_fetch } from "@/utils/utils";

import { useLocalStorage } from "@vueuse/core";
import { NodeVars, Links, Nodes, TemplateFile } from "@/utils/types";

import {
  WsMessage,
  WsMsgCodes,
  Options,
  UiData,
  WsTxResponse,
} from "@/utils/websocket";

import { Layouts } from "v-network-graph";
import { defaultGraphTemplates, fFarEndNode } from "@/utils/helpers";
import { MsgError, MsgInfo, MsgWarning } from "@/utils/message";
import { wsRxBus, wsSend } from "@/utils/websocket";
import { toRaw } from "vue";

// main is the name of the store. It is unique across your application
// and will appear in devtools
export const useMainStore = defineStore("main", {
  // a function that returns a fresh state
  state: () => ({
    /** topo file */
    topo: {
      name: "",
      nodes: {} as Nodes,
      links: {} as Links,
      /** compiled vars per NE */
      vars: {} as NodeVars,
    },
    /** *.tmpl files from the template path */
    templateFiles: {} as Record<string, TemplateFile>,
    // option file
    optLayouts: {
      nodes: {},
    } as Layouts,
    optTemplates: {} as Record<string, string>,
    optLayout: "grid",
    optCommands: ["compare -l ports -f R1,R2"],
    /** height of the graph */
    optHeight: 450,

    results: {} as Record<string, Array<WsTxResponse>>,
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
        code: WsMsgCodes.uidata,
        uidata: {
          options: {
            layout: state.optLayout,
            height: state.optHeight,
            commands: toRaw(state.optCommands),
          } as Options,
          layouts: state.optLayouts,
          templates: state.optTemplates,
        } as UiData,
      } as WsMessage;
    },

    linkVars: (state) => (linkid: string) => {
      const l = state.topo.links[linkid];
      if (!l) {
        return {};
      }
      if (!state.topo.vars[l.target]) {
        MsgWarning(`No variable found for ${l.target}\n\nreload advised`);
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
    },

    async load_uidata(data?: UiData) {
      if (!data) {
        console.warn("no data to load");
        return;
      }
      console.debug("load layouts+", data.options);
      this.optHeight = Math.max(400, Math.min(900, data.options.height || 450));
      this.optLayout = data.options.layout;

      this.optCommands = data.options.commands;
      if (!Array.isArray(this.optCommands)) {
        this.optCommands = [""];
      }

      // Object.keys(data.options).forEach((o) => {
      //   if (Object.hasOwn(this, `opt`))
      // })
      Object.assign(this, data.options);
      this.optLayouts = data.layouts;
      this.optTemplates = data.templates;

      if (!("link" in this.optTemplates)) {
        this.optTemplates["link"] = defaultGraphTemplates(true);
      }
      if (!("node" in this.optTemplates)) {
        this.optTemplates["node"] = defaultGraphTemplates(false);
      }

      console.debug("req topo");
      const resp = await json_fetch("/labctl/topo");
      console.debug("got topo");

      if (this.topo.name !== resp.data.name) {
        Object.assign(this.topo, resp.data);
        json_fetch("/labctl/vars").then((resp) => {
          Object.assign(this.topo.vars, resp.data);
        });
        json_fetch("/labctl/templates").then((resp) => {
          Object.assign(this.templateFiles, resp.data);
        });
      }
    },

    load_config(data?: Array<WsTxResponse>) {
      if (!data) {
        console.warn("no config results to load");
        return;
      }
      data.forEach((e) => {
        this.results[e.node] ??= [];
        this.results[e.node].push(e);
      });
    },

    save() {
      console.log("save layouts+", this.wsState.uidata?.options);
      wsSend(this.wsState);
    },

    /* process a received websock message */
    async websock_handler(msg: WsMessage) {
      try {
        switch (msg.code) {
          case WsMsgCodes.uidata:
            // wait until we finished loading
            // emitting the message n the bus will trigger a center
            await this.load_uidata(msg.uidata);
            break;

          case WsMsgCodes.config:
            if (msg.config?.cmd !== "done") {
              this.load_config(msg.config?.results);
            }
            break;

          case WsMsgCodes.error:
            MsgError(msg.msg ?? JSON.stringify(msg));
            return; // don't emit!

          case WsMsgCodes.warn:
            MsgWarning(msg.msg ?? JSON.stringify(msg));
            return; // don't emit!

          case WsMsgCodes.info:
            MsgInfo(msg.msg ?? JSON.stringify(msg));
            return; // don't emit!

          default:
            console.debug("unknown msg code", msg);
            MsgError(`unknown message code\n\n${msg}`, {
              duration: 0,
              closable: true,
            });
        }
      } catch (err) {
        MsgError(String(err));
      }

      // Pass on the message for updates etc
      wsRxBus.emit(msg);
    },
  },
  debounce: {
    save: 1500, // debounce save by 300ms
  },
});
