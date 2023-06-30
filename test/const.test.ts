import { expect, test } from "vitest"
import { api_uri, base_uri, localhost, ws_uri } from "../src/utils/const"

test("const", async () => {
  expect(base_uri === "/labctl/")
  expect(localhost === "")
  expect(ws_uri === "")
  expect(api_uri === "")
})
