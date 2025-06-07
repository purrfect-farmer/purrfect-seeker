"use strict";

const db = require("../../../db/models");

/**
 * @param {import("fastify").FastifyInstance} fastify
 * @param {object} opts
 */
module.exports = async function (fastify, opts) {
  /** Get all servers */
  fastify.get("/", async function (request, reply) {
    return await db.Server.findAll();
  });

  /** Get a particular server */
  fastify.get(
    "/:id",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
          },
          required: ["id"],
        },
      },
    },
    async function (request, reply) {
      return await db.Server.findByPk(request.params.id);
    }
  );

  /** Update a server */
  fastify.post(
    "/update",
    {
      schema: {
        body: {
          type: "object",
          required: ["key", "name", "address"],
          properties: {
            key: { type: "string" },
            name: { type: "string" },
            address: { type: "string", format: "uri" },
          },
        },
      },
    },
    async function (request, reply) {
      try {
        const [count] = await db.Server.update(
          {
            name: request.body.name,
            address: request.body.address,
          },
          {
            where: { key: request.body.key },
          }
        );

        if (count === 0) {
          return reply.status(404).send({ error: "Invalid or unknown key" });
        }

        return { message: "Server updated successfully" };
      } catch (err) {
        request.log.error(err);
        return reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  );
};
