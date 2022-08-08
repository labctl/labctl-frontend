import { useEventBus } from "@vueuse/core";
import { WebSocketTemplate, WsMessage } from "@/utils/types";

// export const templateKey: EventBusKey<WebSocketTemplate> =
//   Symbol("ws-template-key");
export const wsTemplateBus = useEventBus<WebSocketTemplate>("ws-template-bus");
export const wsRxBus = useEventBus<WsMessage>("ws-bus");
export const wsTxBus = useEventBus<WsMessage>("ws-tx-bus");

export const wsSend = wsTxBus.emit;
