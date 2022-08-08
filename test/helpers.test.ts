import { test } from "vitest";
import { labelPosition } from "../src/utils/helpers";
import { Point, Links, Link } from "../src/utils/types";

test("label position", async () => {
  const nodes = {
    a: { x: 0, y: -1 },
    b: { x: -1, y: 1 },
    c: { x: 1, y: 1 },
  } as Record<string, Point>;

  const links = {
    "1": {
      source: "a",
      target: "b",
    } as Link,
    "2": {
      source: "b",
      target: "c",
    } as Link,
    "3": {
      source: "c",
      target: "a",
    } as Link,
  } as Links;

  const r = labelPosition(nodes, links);
  console.log(r);
  console.log(r["a"]);
});
