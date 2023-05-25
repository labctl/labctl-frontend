import { reMarks, splitTerms, updateReMarks } from "../src/utils/marks"
import { describe, expect, test } from "vitest"

describe("helpers.ts", () => {
  test("words", () => {
    expect(splitTerms("a b")).toEqual(["a", "b"])
    expect(splitTerms("a b ")).toEqual(["a", "b"])
    expect(splitTerms("bgp a")).toEqual(["bgp", "a"])
    expect(splitTerms(`"bgp a" b`)).toEqual(["bgp a", "b"])
  })

  test("words", () => {
    let w
    w = ["a", "b"]
    expect(reMarks).undefined
    updateReMarks(w)
    expect(reMarks.source).toEqual("(a|b)")

    updateReMarks(["a", "a"])
    expect(reMarks.source).toEqual("(a|a)")
  })
})
