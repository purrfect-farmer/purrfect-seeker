import cors from "@fastify/cors";
import fp from "fastify-plugin";

/** Allows browser apps on any origin to read the API */
export default fp(async function (fastify) {
  await fastify.register(cors, { origin: "*" });
});
