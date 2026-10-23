import fp from "fastify-plugin";
import { ValidationError } from "sequelize";

/** Turns model validation errors into 400 responses */
export default fp(async function (fastify) {
  fastify.setErrorHandler(function (error, request, reply) {
    if (!(error instanceof ValidationError)) throw error;

    const message = error.errors.map((item) => item.message).join(" ");

    return reply.badRequest(message);
  });
});
