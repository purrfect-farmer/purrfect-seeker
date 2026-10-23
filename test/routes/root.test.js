import assert from "node:assert";
import { build } from "../helper.js";
import { test } from "node:test";

test("default root route", async (t) => {
  const app = await build(t);
  const res = await app.inject({ url: "/" });

  assert.deepStrictEqual(res.json(), { root: true });
});
