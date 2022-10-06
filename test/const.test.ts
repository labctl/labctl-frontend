import { test, expect } from "vitest"
import { base_uri, localhost, ws_uri, api_uri } from "../src/utils/const"

test("const", async () => {
  expect(base_uri === "/labctl/")
  expect(localhost === "")
  expect(ws_uri === "")
  expect(api_uri === "")
})
