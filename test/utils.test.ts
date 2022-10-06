import { test, expect } from "vitest"
import { sortDictionary, isObject } from "../src/utils/utils"

function comp(a: any, b: any) {
  return a.localeCompare(b)
}

test("sortDictionary", () => {
  const tests = [
    [
      { b: 1, a: 2 },
      { a: 1, b: 2 },
    ],
  ] as Array<Array<Record<string, any>>>

  tests.map((t) => {
    let res = sortDictionary(t[1], comp)
    expect(res === t[1])

    res = sortDictionary(t[0], comp)
    expect(res === t[1])
  })
})

test("isObject", () => {
  expect(isObject(1) === false)
  expect(isObject({}) === true)
  expect(isObject("a") === true)
  expect(isObject(false) === false)
})
