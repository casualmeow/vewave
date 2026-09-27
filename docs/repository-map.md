# Repository map

Paths below are relative to the workspace root. Use this map to decide where a change belongs before adding a new abstraction.

## Workspace ownership

| Path                | Responsibility                                                      |
| ------------------- | ------------------------------------------------------------------- |
| `client/`           | React application, npm lockfile, independent Git repository         |
| `server/`           | Bun API, database schema and migrations, independent Git repository |
| `AGENTS.md`         | Shared contribution and contract rules                              |
| Root `package.json` | Development-server convenience command                              |

## Client layers

| Path                             | Put this here                                                      |
| -------------------------------- | ------------------------------------------------------------------ |
| `client/src/routes/`             | Thin TanStack route definitions, URL validation, route guards      |
| `client/src/modules/`            | Feature pages, forms, queries, schemas, and state                  |
| `client/src/components/`         | Complex reusable components with their own lifecycle               |
| `client/src/shared/ui/`          | Small generic UI primitives                                        |
| `client/src/shared/lib/`         | Cross-feature utility and material behavior                        |
| `client/src/shared/theme/`       | Appearance contract, presets, resolution, and persistence          |
| `client/src/shared/config/`      | Runtime environment configuration                                  |
| `client/src/core/layouts/`       | Separate app, landing, and studio shells                           |
| `client/src/core/api/http/`      | HTTP transport, authorization, and refresh behavior                |
| `client/src/core/api/generated/` | Orval output; regenerate instead of editing                        |
| `client/src/__tests__/`          | Unit and browser test suites                                       |
| `client/docs/`                   | Markdown developer handbook                                        |
| `client/src/modules/docs/`       | Documentation navigation, renderer, search, and component examples |
| `client/scripts/`                | Generation and development tooling                                 |

## Feature entrypoints

| Work area                      | Start here                               |
| ------------------------------ | ---------------------------------------- |
| Sign-in and registration       | `client/src/modules/auth/`               |
| Settings sections              | `client/src/modules/settings/`           |
| Settings dialog structure      | `client/src/components/settings-dialog/` |
| Theme editor and account saves | `client/src/modules/appearance/`         |
| Glass selection lenses         | `client/src/components/fluid-glass/`     |
| Shared optical scene           | `client/src/components/glass-scene/`     |
| Canvas object utilities        | `client/src/components/canvas-ui/`       |
| Procedural backgrounds         | `client/src/components/app-backdrop/`    |
| Room creation and playback     | `client/src/modules/watch-together/`     |
| Community server pages         | `client/src/modules/servers/`            |

Other folders under `modules/` own their named features. Keep their page composition and business behavior there rather than moving them into shared UI.

## Server layers

| Path                       | Responsibility                                         |
| -------------------------- | ------------------------------------------------------ |
| `server/src/index.ts`      | Runtime startup                                        |
| `server/src/app.ts`        | HTTP/WebSocket application composition                 |
| `server/src/services.ts`   | Production dependency wiring                           |
| `server/src/config/env.ts` | Environment loading and defaults                       |
| `server/src/modules/`      | Feature routes, schemas, services, repositories, types |
| `server/src/db/schema/`    | Drizzle tables and inferred record types               |
| `server/drizzle/`          | Database migration history                             |
| `server/src/shared/`       | Errors, HTTP helpers, IDs, and logging                 |
| `server/src/testing/`      | In-memory services and test environment                |
| `server/tests/`            | Bun unit and integration tests                         |
| `server/src/openapi/`      | API document support and tags                          |

## Files that are outputs

Do not hand-edit `client/src/routeTree.gen.ts` or generated REST clients. Run their generators. Build output, dependency folders, environment files, uploaded media, and local database artifacts do not belong in commits.

See [Application architecture](architecture.md) for how these folders work together.
