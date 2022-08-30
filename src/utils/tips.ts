import { useLocalStorage } from "@vueuse/core";
import { NotificationApiInjection } from "naive-ui/es/notification/src/NotificationProvider";

export const tipN = useLocalStorage("tipN", 1);

export function TipsInit(n: NotificationApiInjection) {
  (window as any).$labctl_notify = n;
}

interface Tip {
  title: string;
  content: string;
  shown: number;
}

const tips = [
  {
    title: "Select multiple nodes/links",
    content:
      "SHIFT + Click allows you to select more than one node or link.\n\nHold CTRL to select a rectangle with nodes.",
    shown: 0,
  },
  {
    title: "Edit templates",
    content:
      "You can edit templates from the variables view. Ensure VARIABLES are visible and select a node.",
    shown: 0,
  },
] as Array<Tip>;

export function TipsShow(tip: string) {
  const t = tips.filter(
    (t) =>
      t.shown < 1 && (t.title.search(tip) >= 0 || t.content.search(tip) >= 0)
  );

  if (t.length == 0) {
    return;
  }
  t[0].shown += 1;

  const z = { duration: 6000 };
  Object.assign(z, t[0]);

  ((window as any).$labctl_notify as NotificationApiInjection).info(z);
}
