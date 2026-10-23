import path from "node:path";
import { Environment } from "../enums/environment.js";
import { build as buildApplication } from "fastify-cli/helper.js";

/** Use the in-memory test database */
process.env.NODE_ENV = Environment.TEST;

const appPath = path.join(import.meta.dirname, "..", "app.js");

/**
 * Build the app with a fresh, migrated database and close it after the test
 * @param {import("node:test").TestContext} t
 */
export async function build(t) {
  const app = await buildApplication([appPath], { skipOverride: true });

  t.after(() => app.close());

  await app.db.sequelize.sync();

  return app;
}
