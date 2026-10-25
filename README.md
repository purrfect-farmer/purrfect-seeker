# Purrfect Seeker

A small registry of Purrfect servers and their addresses.

- Servers report their own address with their key (`POST /api/servers/update`).
- Apps list the servers and read an address by id (`GET /api/servers`, `GET /api/servers/:id`).
- Servers are managed from the `seeker` CLI.

Built with [Fastify](https://fastify.dev), [Sequelize](https://sequelize.org) and SQLite, as ES modules.

## Requirements

- Node.js 22.12 or newer
- pnpm

## Install on a VPS

```sh
curl -o- https://raw.githubusercontent.com/purrfect-farmer/purrfect-seeker/main/install.sh | bash
```

All flags are optional:

| Flag | Default | Role |
| ---- | ------- | ---- |
| `--port` | existing site's, else `3000` | Public port Seeker is served on through Nginx. Node runs on this port + 10000 (`13000` by default). |
| `--fly-name` | none | Name of the Fly servers to register, as `<fly-name> (n)`. Leave it out to only install Seeker. |
| `--fly-count` | `10` | How many Fly servers to register, `1` to `--fly-count`. Re-run with a higher count to register more; existing names are skipped. |
| `--fly-base-port` | `4001` | Public port of the first Fly server; server `n` is registered at `http://<ip>:<fly-base-port + n - 1>`. |

It installs Nginx, Node.js (NVM), pnpm and pm2, clones `~/purrfect-seeker`, runs the migrations
and starts it with pm2.

### With Purrfect Fly instances

Pass `--fly-name` to also register Fly servers named `<fly-name> (n)` at `http://<ip>:<fly-base-port + n - 1>`.
Names already registered are skipped, so it can be run again safely. The example below sets up Seeker
on `3000` and 10 Fly instances on `4001` to `4010`.

First install Seeker. Edit the flags (see the table above), then run:

```sh
curl -o- https://raw.githubusercontent.com/purrfect-farmer/purrfect-seeker/main/install.sh | bash -s -- --port 3000 --fly-name Example --fly-count 10 --fly-base-port 4001
```

Then install the Fly instances with Purrfect Fly's
[`install-many.sh`](https://github.com/purrfect-farmer/purrfect-farmer/tree/main/apps/purrfect-fly#multiple-instances-on-one-server);
give it the same name, count and base port, then run:

```sh
curl -o- https://raw.githubusercontent.com/purrfect-farmer/purrfect-farmer/main/apps/purrfect-fly/install-many.sh | bash -s -- --slug example --name Example --count 10 --base-port 4001
```

| Flag | Default | Role |
| ---- | ------- | ---- |
| `--slug` | `example` | Folder and PM2 name prefix: instance `n` lives in `~/<slug>-n` and runs as PM2 app `<slug>-n`. |
| `--name` | `Example` | Display name prefix: instance `n` is named `<name> (n)`. Match `--fly-name`. |
| `--count` | `10` | How many instances to install, `1` to `--count`. Re-run with a higher count to add instances; running ones are left untouched and stopped ones are repaired. Match `--fly-count`. |
| `--base-port` | existing install's, else `4001` | Public port of the first instance; instance `n` is served at `http://<ip>:<base-port + n - 1>`. Match `--fly-base-port`. |

Then run `cd ~/purrfect-seeker && ./seeker list-servers` to see each server's id and key.

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

`add-server` also takes `--name`, `--address`, `--id` and `--key`. Fields given as flags are not asked;
with `--name`, the missing optional fields are left blank and nothing is asked:

```sh
./seeker add-server --name "Example (1)" --address "http://1.2.3.4:4001"
```

Add `--skip-existing` to do nothing when a server with the same name is already registered.

`list-servers --json` prints the same rows as JSON, for scripts.

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
