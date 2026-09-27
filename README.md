# Vewave Frontend

Vewave is a React 19 + Vite frontend for watch-together rooms, studio tooling, and reusable UI
component work.

The detailed project documentation now lives inside the app:

- `/admin/docs` - Markdown developer handbook: setup, architecture, contracts, and validation
- `docs/` - the same handbook, readable directly in Git without an admin account
- `/admin/docs/ui` - UI architecture, component ownership, styling and showcase conventions
- `/admin/docs/ui/components` - UI-kit style component API documentation
- `/ui/showcase` - live component playgrounds

The in-app docs require an administrator account. Markdown handbook pages share navigation and
search with the existing component references, using Vite and TanStack Router.

## Quick Start

```powershell
npm install
Copy-Item .env.example .env.local
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

Start with the affected unit test and `npm run typecheck:tsc`. Regenerate the route tree when
routes change. For broad validation when the change warrants it:

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
