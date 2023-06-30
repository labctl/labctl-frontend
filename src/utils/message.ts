import { h, VNodeChild } from "vue"
import {
  MessageApi,
  MessageOptions,
  MessageRenderMessage,
  NAlert,
} from "naive-ui"

declare type ContentType = string | (() => VNodeChild)

interface Msg {
  type: "info" | "error" | "warning"
  msg: ContentType
  opt: MessageOptions
}

function show(m: Msg) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any
  if (typeof w.$message !== "undefined") {
    w.$message[m.type](m.msg, m.opt)
  }
  if (typeof w.$backlog === "undefined") {
    w.$backlog = []
  }
  w.$backlog.push(m)
}

export function MsgInit(m: MessageApi) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any
  w.$message = m
  if (typeof w.$backlog !== "undefined") {
    w.$backlog.forEach((m: Msg) => w.$message[m.type](m.msg, m.opt))
    delete w.$backlog
  }
}

export function MsgInfo(msg: ContentType, options?: MessageOptions) {
  show({
    type: "info",
    msg,
    opt: {
      duration: 3000,
      closable: true,
      render: renderMessage,
      ...options,
    },
  })
}

export function MsgWarning(msg: ContentType, options?: MessageOptions) {
  show({
    type: "warning",
    msg,
    opt: {
      duration: 4000,
      closable: true,
      render: renderMessage,
      ...options,
    },
  })
}

export function MsgError(msg: ContentType, options?: MessageOptions) {
  show({
    type: "error",
    msg,
    opt: {
      duration: 0,
      closable: true,
      render: renderMessage,
      ...options,
    },
  })
}

const renderMessage: MessageRenderMessage = (props) => {
  const { type } = props
  return h(
    NAlert,
    {
      closable: props.closable,
      onClose: props.onClose,
      type: type === "loading" ? "default" : type,
      style: {
        boxShadow: "var(--n-box-shadow)",
        maxWidth: "calc(100vw - 32px)",
        width: "480px",
      },
    },
    {
      default: () =>
        h("div", { style: { "white-space": "pre-wrap" } }, props.content),
    }
  )
}
