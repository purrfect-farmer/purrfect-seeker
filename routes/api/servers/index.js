import {
  serverIdParamsSchema,
  serverListSchema,
  serverSchema,
  updateServerBodySchema,
} from "../../../schemas/server.js";
import sortByName from "../../../lib/sort-by-name.js";

/** @param {import("fastify").FastifyInstance} fastify */
export default async function (fastify) {
  const { Server } = fastify.db;

  /** Get all servers */
  fastify.get(
    "/",
    { schema: { response: { 200: serverListSchema } } },
    async function () {
      return sortByName(await Server.findAll());
    }
  );

  /** Get a particular server */
  fastify.get(
    "/:id",
    {
      schema: {
        params: serverIdParamsSchema,
        response: { 200: serverSchema },
      },
    },
    async function (request, reply) {
      const server = await Server.findByPk(request.params.id);

      return server ?? reply.notFound("Server not found");
    }
  );

  /** Update a server's name and address by its key */
  fastify.post(
    "/update",
    { schema: { body: updateServerBodySchema } },
    async function (request, reply) {
      const { key, name, address } = request.body;
      const server = await Server.findOne({ where: { key } });

      if (!server) {
        return reply.status(404).send({ error: "Invalid or unknown key" });
      }

      await server.update({ name, address });

      return { message: "Server updated successfully" };
    }
  );
}
