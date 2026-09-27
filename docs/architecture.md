# Application architecture

The browser owns interface state and media presentation. The server owns accounts, authorization, persistent resources, and canonical room state.

## Browser composition

TanStack Router maps URLs to layouts and module pages. Keep route files small: validate search parameters, enforce access, and compose the page. Use the existing folder-based route convention.

TanStack Query owns remote request state and cache invalidation. Zustand stores hold explicit client state such as authentication. Forms use React Hook Form and zod. Store implementations need explicit initial state and reset behavior so sessions and tests do not leak into one another.

The HTTP layer attaches access tokens and coordinates refresh. Feature code calls generated clients rather than constructing a second transport.

## Component boundaries

A feature module composes reusable components and shared primitives. A complex reusable component may own hooks, geometry, rendering, helpers, and types in its own folder.

Keep public component APIs and examples together through the existing barrel exports and component documentation. Feature-specific content stays in its module, even when two pages use it.

App, landing, and studio layouts remain separate. Do not change their routing or authentication boundaries to share a decorative wrapper.

## API request flow

A request enters a feature route, is checked against its Elysia schema, and reaches the service. The service enforces business rules and calls a repository. The repository reads or writes domain data through Drizzle.

Services throw `AppError` for controlled failures. Shared error handling produces the API error envelope. Add new error codes to the central code list and expose response schemas through OpenAPI.

Production dependencies are assembled in `server/src/services.ts`. Tests can inject in-memory repositories and services without a running PostgreSQL instance.

## Persistent data changes

Change table definitions under `server/src/db/schema/`, generate a migration with `bun run db:generate`, inspect it, and apply it to the intended database with `bun run db:migrate`.

Use transactions for related writes that must succeed together. Do not expose raw database implementation details through service return values.

## Adding a feature

1. Choose the owning module and identify existing reusable controls.
2. Define backend request and response schemas when the API changes.
3. Add service behavior and repository operations.
4. Regenerate the REST client from OpenAPI.
5. Compose the frontend feature and connect its thin route.
6. Add focused behavior or contract checks and update the relevant guide.

Read [API and realtime contracts](contracts.md) before changing anything shared by client and server.

For startup policy, resizing lifecycle, file previews, changelog parsing, and local storage, see [Client maintenance notes](client-maintenance.md).
