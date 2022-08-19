import { useLocalStorage } from "@vueuse/core";
import { NotificationApiInjection } from "naive-ui/es/notification/src/NotificationProvider";

export const tipN = useLocalStorage("tipN", 1);

export function TipsInit(n: NotificationApiInjection) {
  (window as any).$labctl_notify = n;
}

export function TipsShow() {
  ((window as any).$labctl_notify as NotificationApiInjection).info({
    title: "Select multiple nodes/links",
    content:
      "SHIFT + Click allows you to select more than one node or link.\n\nHold CTRL to select a rectangle with nodes.",
    duration: 5000,
  });
}
