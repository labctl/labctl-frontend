import { useEventBus } from "@vueuse/core";
import { WebSocketTemplate, WsMessage } from "@/components/types";

// export const templateKey: EventBusKey<WebSocketTemplate> =
//   Symbol("ws-template-key");
export const templateBus = useEventBus<WebSocketTemplate>("ws-template-bus");

export const wsBus = useEventBus<WsMessage>("ws-bus");

export function wsSend(obj: Record<string, any>) {
  // app.config.globalProperties.$socket.sendObj(obj);
  (window as any).$wssend(JSON.stringify(obj));
}
