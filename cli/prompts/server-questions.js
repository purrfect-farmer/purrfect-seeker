import {
  validateAddress,
  validateId,
  validateKey,
  validateName,
} from "../../validation/server-rules.js";

/** Accept blank input, otherwise apply the rule */
const optional = (rule) => (value) => value.trim() === "" || rule(value);

/** @param {string} [current] */
export const nameQuestion = (current) => ({
  name: "name",
  message: "Name:",
  default: current,
  validate: validateName,
});

/** @param {string | null} [current] */
export const addressQuestion = (current) => ({
  name: "address",
  message: "Address (Optional):",
  default: current ?? undefined,
  validate: optional(validateAddress),
});

export const idQuestion = {
  name: "id",
  message: "ID (Optional):",
  validate: optional(validateId),
};

/** @param {string} message */
export const keyQuestion = (message) => ({
  name: "key",
  message,
  validate: optional(validateKey),
});
