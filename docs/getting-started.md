# Local setup

Start the API and database before working with authenticated routes or regenerating REST clients. The frontend uses npm; the backend uses Bun.

## Prerequisites

Install Node.js with npm, Bun, and PostgreSQL. Use the versions compatible with each project's package manifest and lockfile. Both projects have their own dependencies and Git history.

## Start the API

Run these commands from `server/` in PowerShell:

```powershell
bun install
Copy-Item .env.example .env.local
```

Review the local environment file. Point `DATABASE_URL` at your development database, keep `COOKIE_SECURE=false` for local HTTP, and allow the exact client origin `http://localhost:3000`.

The included Docker Compose PostgreSQL service publishes host port 5433. An independently installed PostgreSQL server may use a different port; use its actual address.

```bash
docker compose up -d postgres
bun run db:migrate
bun run dev
```

Run the Docker command only when using the included database. Migrations require the database to exist and be reachable. The API defaults to port 3001; its schema is available at `http://localhost:3001/openapi/json`.

The server loads `.env`, then `.env.local`, then process environment overrides. Keep local environment files out of Git.

## Start the client

In another terminal, from `client/`:

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

The client development server uses port 3000. Configure `VITE_API_URL=http://localhost:3001` and `VITE_WS_URL=ws://localhost:3001`.

Run `npm run api:gen` from the client when the backend contract changes. It requires a running API serving the updated schema; it is not necessary on every startup.

The root `dev:all` convenience script starts both development servers once dependencies and the database are ready. Package installation, tests, builds, and generation belong in the individual project directories.

## Open developer documentation

Sign in with a local administrator account and open `/admin/docs`. To create a local administrator, stop and inspect `server/src/db/seed-admin.ts` and the seed instructions in `server/README.md`, then run `bun run admin:seed` against your development database.

Use `ADMIN_SEED_EMAIL` and `ADMIN_SEED_PASSWORD` for shared development environments. Never publish local credentials in documentation.

## Diagnose startup problems

- A refresh failure can originate from an unavailable database. Check the API and database before changing client auth code.
- Credentialed requests need an exact allowed origin. Do not replace it with a wildcard.
- Local HTTP cookies must not require HTTPS. Production refresh cookies must.
- Generated-client errors after an API change usually require regeneration from the current schema.
- See [Testing and troubleshooting](testing.md) for narrowly scoped checks.
