import assert from "node:assert";
import normalizeAddress from "../../lib/normalize-address.js";
import { test } from "node:test";

test("prefixes bare hosts and IPs with http", () => {
  assert.equal(normalizeAddress("1.2.3.4"), "http://1.2.3.4");
  assert.equal(normalizeAddress(" 1.2.3.4:8080 "), "http://1.2.3.4:8080");
  assert.equal(normalizeAddress("localhost:3000"), "http://localhost:3000");
});

test("keeps http(s) URLs unchanged", () => {
  assert.equal(normalizeAddress("http://1.2.3.4"), "http://1.2.3.4");
  assert.equal(normalizeAddress("https://a.test/x"), "https://a.test/x");
});

test("rejects invalid addresses", () => {
  for (const value of [
    "",
    "  ",
    "ftp://a.test",
    "a b",
    "javascript:alert(1)",
  ]) {
    assert.equal(normalizeAddress(value), null, value);
  }

  assert.equal(normalizeAddress(null), null);
});
