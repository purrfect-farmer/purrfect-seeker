import assert from "node:assert";
import sortByName from "../../lib/sort-by-name.js";
import { test } from "node:test";

/** Sort names and return them */
function sortNames(names) {
  const items = names.map((name) => ({ name }));

  return sortByName(items).map((item) => item.name);
}

test("puts numbers in number order", () => {
  assert.deepEqual(sortNames(["Priest (10)", "Priest (2)", "Priest (1)"]), [
    "Priest (1)",
    "Priest (2)",
    "Priest (10)",
  ]);
});

test("ignores case", () => {
  assert.deepEqual(sortNames(["beta", "Alpha", "alpha2"]), [
    "Alpha",
    "alpha2",
    "beta",
  ]);
});

test("sorts the given array in place", () => {
  const items = [{ name: "b" }, { name: "a" }];

  assert.equal(sortByName(items), items);
});
