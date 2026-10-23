import "./config/env.js";
import AutoLoad from "@fastify/autoload";
import path from "node:path";
import { Environment, currentEnvironment } from "./enums/environment.js";

/** Options applied by fastify-cli when started with --options */
export const options = {
  logger: currentEnvironment() !== Environment.PRODUCTION,
};

/** @param {import("fastify").FastifyInstance} fastify */
export default async function (fastify, opts) {
  /** Shared plugins: database, CORS, errors and utilities */
  fastify.register(AutoLoad, {
    dir: path.join(import.meta.dirname, "plugins"),
    options: { ...opts },
  });

  /** Routes, one plugin per folder */
  fastify.register(AutoLoad, {
    dir: path.join(import.meta.dirname, "routes"),
    options: { ...opts },
  });
}
