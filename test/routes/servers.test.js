import assert from "node:assert";
import { build } from "../helper.js";
import { test } from "node:test";

const KEY = "abcdefghij123456";
const UNKNOWN_ID = "00000000-0000-4000-8000-000000000000";

/** Build the app with one stored server */
async function setup(t) {
  const app = await build(t);
  const server = await app.db.Server.create({
    name: "Alpha",
    address: "http://1.1.1.1",
    key: KEY,
  });

  return { app, server };
}

/** Post an update with the stored server's key */
const update = (app, body) =>
  app.inject({
    method: "POST",
    url: "/api/servers/update",
    payload: { key: KEY, name: "Alpha", ...body },
  });

test("lists servers without their keys", async (t) => {
  const { app, server } = await setup(t);
  const res = await app.inject({ url: "/api/servers" });
  const [item] = res.json();

  assert.equal(res.statusCode, 200);
  assert.equal(item.id, server.id);
  assert.equal(item.address, "http://1.1.1.1");
  assert.equal("key" in item, false);
});

test("lists servers with numbers in number order", async (t) => {
  const app = await build(t);

  for (const name of ["Priest (10)", "Priest (2)", "Priest (1)"]) {
    await app.db.Server.create({ name, address: "http://1.1.1.1" });
  }

  const res = await app.inject({ url: "/api/servers" });

  assert.deepEqual(
    res.json().map((item) => item.name),
    ["Priest (1)", "Priest (2)", "Priest (10)"]
  );
});

test("gets a server by id", async (t) => {
  const { app, server } = await setup(t);
  const res = await app.inject({ url: `/api/servers/${server.id}` });

  assert.equal(res.statusCode, 200);
  assert.equal(res.json().name, "Alpha");
  assert.equal("key" in res.json(), false);
});

test("returns 404 for an unknown id", async (t) => {
  const { app } = await setup(t);
  const res = await app.inject({ url: `/api/servers/${UNKNOWN_ID}` });

  assert.equal(res.statusCode, 404);
});

test("returns 400 for an invalid id", async (t) => {
  const { app } = await setup(t);
  const res = await app.inject({ url: "/api/servers/not-a-uuid" });

  assert.equal(res.statusCode, 400);
});

test("stores a bare IP update as an http URL", async (t) => {
  const { app, server } = await setup(t);
  const res = await update(app, { address: "102.89.1.2" });

  await server.reload();

  assert.equal(res.statusCode, 200);
  assert.deepStrictEqual(res.json(), {
    message: "Server updated successfully",
  });
  assert.equal(server.address, "http://102.89.1.2");
});

test("stores a full URL update unchanged", async (t) => {
  const { app, server } = await setup(t);
  const res = await update(app, { address: "https://seeker.test:8443/api" });

  await server.reload();

  assert.equal(res.statusCode, 200);
  assert.equal(server.address, "https://seeker.test:8443/api");
});

test("returns 404 for an unknown key", async (t) => {
  const { app } = await setup(t);
  const res = await update(app, { key: "unknown", address: "1.2.3.4" });

  assert.equal(res.statusCode, 404);
  assert.deepStrictEqual(res.json(), { error: "Invalid or unknown key" });
});

test("rejects an invalid address", async (t) => {
  const { app, server } = await setup(t);
  const res = await update(app, { address: "ftp://files.test" });

  await server.reload();

  assert.equal(res.statusCode, 400);
  assert.equal(server.address, "http://1.1.1.1");
});

test("rejects a blank or oversized name", async (t) => {
  const { app } = await setup(t);
  const blank = await update(app, { name: "   ", address: "1.2.3.4" });
  const long = await update(app, { name: "a".repeat(256), address: "1.2.3.4" });

  assert.equal(blank.statusCode, 400);
  assert.equal(long.statusCode, 400);
});

test("allows any origin", async (t) => {
  const { app } = await setup(t);
  const res = await app.inject({
    url: "/api/servers",
    headers: { origin: "https://farmer.test" },
  });

  assert.equal(res.headers["access-control-allow-origin"], "*");
});
