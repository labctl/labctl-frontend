import { base_uri } from "../src/utils/const"
import { test, expect } from "vitest"

test("const", async () => {
  expect(base_uri === "/labctl/")
})
