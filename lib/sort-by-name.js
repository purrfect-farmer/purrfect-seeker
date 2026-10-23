const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });

/**
 * Sort items in place by their name, with numbers in number order
 * (e.g. "Item 2" before "Item 10")
 * @template {{ name: string }} T
 * @param {T[]} items
 * @returns {T[]}
 */
export default function sortByName(items) {
  return items.sort((a, b) => collator.compare(a.name, b.name));
}
