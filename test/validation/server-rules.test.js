import assert from "node:assert";
import { test } from "node:test";
import {
  KEY_MIN_LENGTH,
  MAX_LENGTH,
  validateAddress,
  validateId,
  validateKey,
  validateName,
} from "../../validation/server-rules.js";

test("name is required and limited in length", () => {
  assert.equal(validateName("Alpha"), true);
  assert.equal(typeof validateName("   "), "string");
  assert.equal(typeof validateName("a".repeat(MAX_LENGTH + 1)), "string");
});

test("address must normalize to an http(s) URL", () => {
  assert.equal(validateAddress("1.2.3.4"), true);
  assert.equal(typeof validateAddress("ftp://a.test"), "string");
});

test("key length is bounded", () => {
  assert.equal(validateKey("a".repeat(KEY_MIN_LENGTH)), true);
  assert.equal(typeof validateKey("a".repeat(KEY_MIN_LENGTH - 1)), "string");
  assert.equal(typeof validateKey("a".repeat(MAX_LENGTH + 1)), "string");
});

test("id must be a UUID", () => {
  assert.equal(validateId("11111111-1111-4111-8111-111111111111"), true);
  assert.equal(typeof validateId("server-1"), "string");
});
