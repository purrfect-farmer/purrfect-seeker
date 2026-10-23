const SCHEME_PATTERN = /^[a-z][a-z\d+.-]*:\/\//i;
const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

/**
 * Normalize an address into an http(s) URL.
 * A bare host or IP (e.g. "1.2.3.4:8080") gets an "http://" prefix.
 * Returns null when the address isn't a valid http(s) URL.
 * @param {unknown} value
 * @returns {string | null}
 */
export default function normalizeAddress(value) {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (trimmed === "") return null;

  const address = SCHEME_PATTERN.test(trimmed) ? trimmed : `http://${trimmed}`;
  const url = URL.parse(address);

  if (!url || !ALLOWED_PROTOCOLS.has(url.protocol) || !url.hostname) {
    return null;
  }

  return address;
}
