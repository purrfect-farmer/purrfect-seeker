# Purrfect Seeker

A small registry of Purrfect servers and their addresses.

- Servers report their own address with their key (`POST /api/servers/update`).
- Apps list the servers and read an address by id (`GET /api/servers`, `GET /api/servers/:id`).
- Servers are managed from the `seeker` CLI.

Built with [Fastify](https://fastify.dev), [Sequelize](https://sequelize.org) and SQLite, as ES modules.

## Requirements

- Node.js 22.12 or newer
- pnpm

## Setup

```sh
pnpm install
cp .env.example .env
pnpm db:migrate
```

## Environment

| Variable       | Default           | Description                                  |
| -------------- | ----------------- | -------------------------------------------- |
| `NODE_ENV`     | `development`     | `development`, `test` or `production`        |
| `PORT`         | `3000`            | HTTP port (used by pm2)                      |
| `DB_LOGGING`   | `false`           | Print SQL queries when `true`                |
| `PM2_APP_NAME` | `purrfect-seeker` | pm2 process name                             |

The database is `db/database.sqlite`; tests use an in-memory database.

## CLI

```sh
./seeker add-server               # prompts for name, address, optional id and key
./seeker edit-server <serverId>   # change name, address or key
./seeker list-servers             # list servers with their keys
./seeker remove-server <serverId>
```

Rules, enforced by the CLI prompts and again by the model on every write:

- **Name**: required, at most 255 characters.
- **Address**: an http(s) URL, at most 255 characters. A bare host or IP such as
  `1.2.3.4:8080` is stored as `http://1.2.3.4:8080`.
- **ID**: a UUID. Generated when left empty.
- **Key**: 16 to 255 characters. A random 16-character key is generated when left empty.

## API

Responses never include a server's key. All origins are allowed (CORS).

| Method | Path                  | Description                                    |
| ------ | --------------------- | ---------------------------------------------- |
| `GET`  | `/api/servers`        | All servers, ordered by name (numbers in number order) |
| `GET`  | `/api/servers/:id`    | One server, `404` when unknown                 |
| `POST` | `/api/servers/update` | Set `name` and `address` for the server owning `key` |

`POST /api/servers/update` body:

```json
{ "key": "…", "name": "My Server", "address": "1.2.3.4" }
```

It returns `200 { "message": "Server updated successfully" }`, `404` for an unknown key,
or `400` for an invalid body.

## Scripts

```sh
pnpm dev          # start with file watching and pretty logs
pnpm start        # start for production
pnpm test         # run the tests
pnpm db:migrate   # run migrations (see package.json for undo/refresh/seed)
```

## Production (pm2)

```sh
pm2 start ecosystem.config.cjs
```

The pm2 config reads `PM2_APP_NAME`, `PORT` and `NODE_ENV` from `.env`.
