# Vewave

Web client for watching videos together, with shared rooms, synchronized playback, and chat.

## Local setup

Requires Node.js and npm. The backend uses Bun and PostgreSQL; see [full setup instructions](docs/getting-started.md).

Run from the client directory:

```sh
npm install
```

Copy `.env.example` to `.env.local` and adjust the API and WebSocket URLs if needed. Start the backend, then run:

```sh
npm run dev
```

Open [localhost:3000](http://localhost:3000).

## Commands

- `npm run build` — production build.
- `npm test` — tests.
- `npm run typecheck:tsc` — TypeScript checks.

Architecture and contribution notes are in the [developer handbook](docs/index.md).
