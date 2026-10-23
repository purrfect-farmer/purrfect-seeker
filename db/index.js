import databaseConfig from "../config/database.js";
import Server from "./models/server.js";
import { Sequelize } from "sequelize";
import { currentEnvironment } from "../enums/environment.js";

/**
 * Create a database connection for the current environment
 * and initialize its models
 */
export function createDatabase() {
  const sequelize = new Sequelize(databaseConfig[currentEnvironment()]);

  Server.initModel(sequelize);

  return { sequelize, Server };
}

/** @typedef {ReturnType<typeof createDatabase>} Database */
