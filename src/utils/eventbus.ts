import { useEventBus } from "@vueuse/core";
import { WsTemplate, WsMessage } from "@/utils/types";

export const wsTemplateBus = useEventBus<WsTemplate>("ws-template-bus");
export const wsRxBus = useEventBus<WsMessage>("ws-bus");
export const wsTxBus = useEventBus<WsMessage>("ws-tx-bus");

export const wsSend = wsTxBus.emit;
