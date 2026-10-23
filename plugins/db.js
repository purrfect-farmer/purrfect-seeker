import fp from "fastify-plugin";
import { createDatabase } from "../db/index.js";

/** Decorates the app with the database and closes it with the app */
export default fp(
  async function (fastify) {
    const db = createDatabase();

    fastify.decorate("db", db);
    fastify.addHook("onClose", () => db.sequelize.close());
  },
  { name: "db" }
);
