import { defineStore } from "pinia"
import { $set_array, $set_object, json_fetch } from "@/utils/utils"

import { useLocalStorage } from "@vueuse/core"
import {
  Context,
  Links,
  NodeProps,
  NodeVars,
  Nodes,
  TemplateFile,
  vngLayouts,
} from "@/utils/types"

import {
  Options,
  UiData,
  WsMessage,
  WsMsgCodes,
  WsTxResponse,
  wsRxBus,
  wsSend,
} from "@/utils/websocket"

import { defaultGraphTemplates, fFarEndNode } from "@/utils/helpers"
import { MsgError, MsgInfo, MsgWarning } from "@/utils/message"
import { nextTick, toRaw } from "vue"
import { base_uri } from "@/utils/const"
import { actionBus } from "@/utils/action"

// main is the name of the store. It is unique across your application
// and will appear in devtools
export const useMainStore = defineStore("main", {
  // a function that returns a fresh state
  state: () => ({
    /** topo file */
    topo: {
      name: "",
      prefix: undefined as string | undefined,
      nodes: {} as Nodes,
      links: {} as Links,
      /** compiled vars per NE */
      vars: {} as NodeVars,
    },
    context: { topoerror: "" } as Context,
    /** *.tmpl files from the template path */
    templateFiles: {} as Record<string, TemplateFile>,
    labFiles: {} as Record<string, string>,
    /** Node positions: x, y */
    optNodeLayouts: { nodes: {} } as vngLayouts,
    /** Node properties: color, size, type, icon */
    optNodeProps: {} as Record<string, NodeProps>,
    optTemplates: {} as Record<string, string>,
    /** Layout handler that will be used by the graph */
    optLayoutHandler: "grid",
    /** not used */
    optCommands: [""],
    /** Height of the graph */
    optHeight: 450,

    results: {} as Record<string, Array<WsTxResponse>>,
    /** used while loading (?) */
    loading: 0,
    /** split vars or show the merge value! */
    split_vars: useLocalStorage("split_vars", true),
    /** dark theme */
    dark: useLocalStorage("dark_mode", false),

    /** last save time */
    lastSave: 0,
  }),
  // optional getters
  getters: {
    wsState: (state) => {
      return {
        code: WsMsgCodes.uidata,
        uidata: {
          options: {
            layout: state.optLayoutHandler,
            height: state.optHeight,
            commands: toRaw(state.optCommands),
            props: toRaw(state.optNodeProps),
          } as Options,
          layouts: toRaw(state.optNodeLayouts),
          templates: toRaw(state.optTemplates),
        } as UiData,
      } as WsMessage
    },

    hostName: (state) => (nodeName: string) => {
      // https://containerlab.dev/manual/topo-def-file/#prefix
      const p: string = state.topo.prefix ?? "clab"
      if (p === "") return nodeName
      if (p === "__lab-name") return `${state.topo.name}-${nodeName}`
      return `${p}-${state.topo.name}-${nodeName}`
    },

    linkVars: (state) => (linkid: string) => {
      const l = state.topo.links[linkid]
      if (!l) {
        return {}
      }
      if (!state.topo.vars[l.target]) {
        MsgWarning(`No variable found for ${l.target}\n\nreload advised`)
      }

      // get variables on the source node (filtered on far end node)
      let sV = state.topo.vars[l.source].clab_links.filter(
        fFarEndNode(l.target)
      )
      if (sV.length > 1) {
        sV = sV.filter((v) => {
          const p1 = l.vars.port
          if (p1 && p1.length === 2 && v.port) {
            return p1[0] === v.port
          }
          return true
        })
      }

      // get variables on the target node (filtered on far end node)
      let tV = state.topo.vars[l.target].clab_links.filter(
        fFarEndNode(l.source)
      )
      if (tV.length > 1) {
        console.debug(tV)
        tV = tV.filter((v) => {
          const p1 = l.vars.port
          if (p1 && p1.length === 2 && v.port) {
            return p1[1] === v.port
          }
          return true
        })
      }

      if (sV.length !== 1 || tV.length !== 1) {
        console.error(`error picking a single vars for link # ${linkid}`, [
          sV,
          tV,
        ])
      }
      return {
        ...l,
        source_vars: sV.length == 0 ? {} : toRaw(sV[0]),
        target_vars: tV.length == 0 ? {} : toRaw(tV[0]),
        vars: toRaw(l.vars),
        source_node: state.topo.nodes[l.source],
        target_node: state.topo.nodes[l.target],
      }
    },
  },
  actions: {
    init() {
      // Init store
    },

    async load_uidata(data?: UiData) {
      if (!data) {
        console.warn("no data to load")
        return
      }
      if (Date.now() - this.lastSave < 800) {
        console.debug("ignoring changes from server")
        return
      }
      this.context = data.context as Context
      console.debug("load layouts+", data.options)
      this.optHeight = Math.max(400, Math.min(900, data.options.height || 450))
      this.optLayoutHandler = data.options.layout
      this.optNodeProps = data.options.props || {}

      if (Array.isArray(data.options.commands)) {
        $set_array(this.optCommands, data.options.commands)
      } else {
        this.optCommands = []
      }

      Object.assign(this, data.options)
      this.optNodeLayouts = data.layouts
      this.optTemplates = data.templates

      if (!("link" in this.optTemplates)) {
        this.optTemplates["link"] = defaultGraphTemplates(true)
      }
      if (!("node" in this.optTemplates)) {
        this.optTemplates["node"] = defaultGraphTemplates(false)
      }

      if (this.context.topoerror) {
        MsgWarning("Failed to read the topology file")
      } else {
        await this.fetch_topo()
      }

      this.fetch_templates()
      this.fetch_labfiles()
    },

    async fetch_topo() {
      const resp = await json_fetch(base_uri + "topo")
      console.debug(`got topo ${resp.data.name}`)

      // Reload the UI data
      // Object.assign(this.topo, resp.data)
      this.topo.name = resp.data.name as string
      this.topo.prefix = resp.data.prefix as string
      $set_object(this.topo.nodes, resp.data.nodes as Nodes)
      $set_object(this.topo.links, resp.data.links as Links)

      // copy icons
      Object.keys(this.topo.nodes).forEach((n) => {
        const prop = this.optNodeProps[n]
        if (prop) {
          this.topo.nodes[n].icon = prop.icon
          this.topo.nodes[n].color = prop.color
          this.topo.nodes[n].size = prop.size
        }
      })

      json_fetch(base_uri + "vars").then((resp) => {
        $set_object(this.topo.vars, resp.data as NodeVars)
        //Object.assign(this.topo.vars, resp.data)
      })
      nextTick(() => {
        actionBus.emit({ action: "center", command: "" })
      })
    },

    fetch_templates() {
      json_fetch(base_uri + "templates")
        .then((resp) => {
          Object.assign(this.templateFiles, resp.data)
        })
        .catch((err) =>
          MsgError(
            `Could not load templates\n\n${err}\n\nReload the webpage and/or check the server`
          )
        )
    },

    fetch_labfiles() {
      json_fetch(base_uri + "files")
        .then((resp) => {
          Object.assign(this.labFiles, resp.data)
        })
        .catch(() => {
          MsgError("Could not load lab files")
          this.labFiles = { "readme.md": "could not load lab files" }
        })
    },

    load_config(data?: Array<WsTxResponse>) {
      if (!data) {
        MsgError("No config results")
        return
      }
      data.forEach((e) => {
        this.results[e.node] ??= []
        this.results[e.node].push(e)
      })
    },

    save() {
      console.debug("save layouts+", this.wsState.uidata)
      wsSend(this.wsState)
      this.lastSave = Date.now()
    },

    /* process a received websock message */
    async websock_handler(msg: WsMessage) {
      try {
        switch (msg.code) {
          case WsMsgCodes.uidata:
            // wait until we finished loading
            // emitting the message n the bus will trigger a center
            await this.load_uidata(msg.uidata)
            break

          case WsMsgCodes.config:
            if (msg.config?.cmd !== "done") {
              this.load_config(msg.config?.results)
            }
            break

          case WsMsgCodes.error:
            MsgError(msg.msg ?? JSON.stringify(msg))
            return // don't emit!

          case WsMsgCodes.warn:
            MsgWarning(msg.msg ?? JSON.stringify(msg))
            return // don't emit!

          case WsMsgCodes.info:
            MsgInfo(msg.msg ?? JSON.stringify(msg))
            return // don't emit!

          case WsMsgCodes.fschange:
            this.fschange(msg.msg ?? "")
            return // don't emit!

          default:
            console.debug("unknown msg code", msg)
            MsgError(`unknown message code\n\n${JSON.stringify(msg)}`, {
              duration: 0,
              closable: true,
            })
        }
      } catch (err) {
        MsgError(String(err))
      }

      // Pass on the message for updates etc
      wsRxBus.emit(msg)
    },

    fschange(name: string) {
      if (this.labFiles[name] !== undefined) {
        console.debug("fetch /files", name)
        this.fetch_labfiles()
        return
      }
      const np = name.split("/")
      const basename = np[np.length - 1]
      if (this.templateFiles[basename] !== undefined) {
        console.log("fetch /templates", name)
        this.fetch_templates()
        return
      }
      if (name.startsWith(".")) {
        // Ignore backup files being created by clab load
        return
      }

      MsgWarning(`unhandled file change: ${name}`)
    },
  },
  debounce: {
    save: 1500, // debounce save
  },
})
