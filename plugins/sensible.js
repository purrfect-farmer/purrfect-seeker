import fp from "fastify-plugin";
import sensible from "@fastify/sensible";

/**
 * Adds utilities to handle http errors
 * @see https://github.com/fastify/fastify-sensible
 */
export default fp(async function (fastify) {
  await fastify.register(sensible, { errorHandler: false });
});
