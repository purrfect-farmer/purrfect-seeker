import { MAX_LENGTH } from "../validation/server-rules.js";

/** Public server fields; the key is never part of a response */
export const serverSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    address: { type: ["string", "null"] },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
};

export const serverListSchema = {
  type: "array",
  items: serverSchema,
};

export const serverIdParamsSchema = {
  type: "object",
  required: ["id"],
  properties: {
    id: { type: "string", format: "uuid" },
  },
};

export const updateServerBodySchema = {
  type: "object",
  required: ["key", "name", "address"],
  properties: {
    key: { type: "string", minLength: 1, maxLength: MAX_LENGTH },
    name: { type: "string", minLength: 1, maxLength: MAX_LENGTH },
    address: { type: "string", minLength: 1, maxLength: MAX_LENGTH },
  },
};
