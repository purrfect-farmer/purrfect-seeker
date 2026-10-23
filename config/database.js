import "./env.js";
import path from "node:path";
import { Environment } from "../enums/environment.js";

const storage = path.join(import.meta.dirname, "..", "db", "database.sqlite");
const logging = process.env.DB_LOGGING === "true" ? console.log : false;

export default {
  [Environment.DEVELOPMENT]: { dialect: "sqlite", storage, logging },
  [Environment.TEST]: { dialect: "sqlite", storage: ":memory:", logging },
  [Environment.PRODUCTION]: { dialect: "sqlite", storage, logging },
};
