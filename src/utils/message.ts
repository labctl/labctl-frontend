import { h, VNodeChild } from "vue";
import {
  MessageApi,
  MessageOptions,
  MessageRenderMessage,
  NAlert,
} from "naive-ui";

declare type ContentType = string | (() => VNodeChild);

interface Msg {
  type: "info" | "error" | "warning";
  msg: ContentType;
  opt: MessageOptions;
}

function show(m: Msg) {
  if (typeof (window as any).$message !== "undefined") {
    (window as any).$message[m.type](m.msg, m.opt);
  }
  if (typeof (window as any).$backlog === "undefined") {
    (window as any).$backlog = [];
  }
  (window as any).$backlog.push(m);
}

export function MsgInit(m: MessageApi) {
  (window as any).$message = m;
  if (typeof (window as any).$backlog !== "undefined") {
    (window as any).$backlog.forEach((m: Msg) =>
      (window as any).$message[m.type](m.msg, m.opt)
    );
    delete (window as any).$backlog;
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
  });
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
  });
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
  });
}

const renderMessage: MessageRenderMessage = (props) => {
  const { type } = props;
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
  );
};
