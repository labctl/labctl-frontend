import { test, expect } from "vitest";
import { labelDirection } from "../src/utils/helpers";
import { Point, Links, Link } from "../src/utils/types";

test("label position", async () => {
  const nodes = {
    a: { x: 0, y: 0 },
    b: { x: -1, y: 2 },
    c: { x: 1, y: 1 },
    d: { x: 1, y: 3 },
  } as Record<string, Point>;

  const links: Links = {};

  const larr = [
    {
      source: "a",
      target: "b",
    },
    {
      source: "b",
      target: "c",
    },
    {
      source: "c",
      target: "a",
    },
    {
      source: "c",
      target: "d",
    },
  ] as Link[];
  larr.forEach((l, i) => (links[i] = l));

  const r = labelDirection(nodes, links, true);

  console.log(r);
  expect(r.a).eq("north");
  expect(r.b).eq("south");
  expect(r.c).eq("east");
  expect(r.d).eq("south");
});
