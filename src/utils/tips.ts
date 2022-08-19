import { useLocalStorage } from "@vueuse/core";
import { NotificationApiInjection } from "naive-ui/es/notification/src/NotificationProvider";

export const tipN = useLocalStorage("tipN", 1);

export function TipsInit(n: NotificationApiInjection) {
  (window as any).$labctl_notify = n;
}

export function TipsShow() {
  ((window as any).$labctl_notify as NotificationApiInjection).info({
    title: "tip",
    content: "Use SHIFT-click to select multiple nodes",

    duration: 5000,
  });
}
