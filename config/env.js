import path from "node:path";
import dotenv from "dotenv";

/** Load the project's .env without overriding variables already set */
dotenv.config({
  path: path.join(import.meta.dirname, "..", ".env"),
  quiet: true,
});
