import normalizeAddress from "../lib/normalize-address.js";

/**
 * Server field rules. Each returns true when valid, or an error message.
 * They back the CLI prompts and the model validators.
 */

export const MAX_LENGTH = 255;
export const KEY_MIN_LENGTH = 16;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** @param {unknown} value */
export function validateName(value) {
  const name = typeof value === "string" ? value.trim() : "";

  if (name === "") {
    return "Name is required.";
  }

  if (name.length > MAX_LENGTH) {
    return `Name must be at most ${MAX_LENGTH} characters.`;
  }

  return true;
}

/** @param {unknown} value */
export function validateAddress(value) {
  const address = normalizeAddress(value);

  if (address === null) {
    return "Address must be a valid http(s) URL, host or IP.";
  }

  if (address.length > MAX_LENGTH) {
    return `Address must be at most ${MAX_LENGTH} characters.`;
  }

  return true;
}

/** @param {unknown} value */
export function validateKey(value) {
  const length = typeof value === "string" ? value.length : 0;

  if (length < KEY_MIN_LENGTH || length > MAX_LENGTH) {
    return `Key must be ${KEY_MIN_LENGTH} to ${MAX_LENGTH} characters.`;
  }

  return true;
}

/** @param {unknown} value */
export function validateId(value) {
  return (
    (typeof value === "string" && UUID_PATTERN.test(value)) ||
    "ID must be a UUID."
  );
}
