# Vewave Frontend

Vewave is a React 19 + Vite frontend for watch-together rooms, studio tooling, and reusable UI
component work.

The detailed project documentation now lives inside the app:

- `/docs` - setup, architecture, backend integration, validation workflow
- `/docs/ui` - UI architecture, component ownership, styling and showcase conventions
- `/docs/ui/components` - UI-kit style component API documentation
- `/ui/showcase` - live component playgrounds

The docs route uses Fumadocs UI page primitives and styles while preserving this repo's existing
Vite + TanStack Router architecture.

## Quick Start

```bash
npm install
cp .env.example .env
npm run api:gen
npm run dev
```

Local backend defaults:

```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

## API Clients

REST clients are generated from the backend OpenAPI document with Orval.

```bash
npm run api:gen
```

Generated files live under `src/core/api/generated/**` and should not be edited manually. App HTTP
transport lives under `src/core/api/http/**`.

## Validation

Before shipping substantial work, run:

```bash
npm run check
npm run build
```

## Architecture Pointers

- `src/components/**` - complex reusable UI components
- `src/shared/ui/**` - low-level UI primitives
- `src/modules/**` - feature and page-level compositions
- `src/core/**` - layouts, API transport, generated clients, errors
- `src/routes/**` - thin TanStack Router route definitions

Keep route files small and put business logic in modules.
