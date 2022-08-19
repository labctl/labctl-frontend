import { h, VNodeChild } from "vue";
import {
  MessageApi,
  MessageOptions,
  MessageRenderMessage,
  NAlert,
} from "naive-ui";

declare type ContentType = string | (() => VNodeChild);

export function message(): MessageApi {
  return (window as any).$message;
}

export function MsgInit(m: MessageApi) {
  (window as any).$message = m;
}

export function MsgInfo(msg: ContentType, options?: MessageOptions) {
  ((window as any).$message as MessageApi).info(msg, {
    duration: 3000,
    closable: true,
    render: renderMessage,
    ...options,
  });
}

export function MsgWarning(msg: ContentType, options?: MessageOptions) {
  ((window as any).$message as MessageApi).warning(msg, {
    duration: 4000,
    closable: true,
    render: renderMessage,
    ...options,
  });
}

export function MsgError(msg: ContentType, options?: MessageOptions) {
  ((window as any).$message as MessageApi).error(msg, {
    duration: 0,
    closable: true,
    render: renderMessage,
    ...options,
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
