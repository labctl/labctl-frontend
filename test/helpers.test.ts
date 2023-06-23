import { test, expect } from "vitest"
import {
  parseTemplateFN,
  labelDirection,
  TTemplateFN,
} from "../src/utils/helpers"
import { Point, Links, Link } from "../src/utils/types"

test("label position", async () => {
  const nodes = {
    a: { x: 0, y: 0 },
    b: { x: -1, y: 2 },
    c: { x: 1, y: 1 },
    d: { x: 1, y: 3 },
  } as Record<string, Point>

  const links: Links = {}

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
  ] as Link[]
  larr.forEach((l, i) => (links[i] = l))

  const r = labelDirection(nodes, links, true)

  console.log(r)
  expect(r.a).eq("north")
  expect(r.b).eq("south")
  expect(r.c).eq("east")
  expect(r.d).eq("south")
})

test("name role", async () => {
  expect(parseTemplateFN("c7__vr-sros.tmpl")).to.deep.equal({
    name: "c7",
    role: "vr-sros",
    ext: "tmpl",
  } as TTemplateFN)

  expect(parseTemplateFN("c7_vr-sros.tmpl")).to.deep.equal({
    name: "c7_vr-sros",
    role: "",
    ext: "tmpl",
  } as TTemplateFN)

  expect(parseTemplateFN("c7__vr-sros__tmpl")).to.deep.equal({
    name: "c7__vr-sros",
    role: "tmpl",
    ext: "",
  } as TTemplateFN)
})
