## Project Stack

- React 19
- TypeScript
- Tailwind CSS
- TanStack Router with folder-based route structure
- zustand for state management
- zod for schema validation
- React Query for data fetching
- Motion for animation where already used
- CVA / variant-driven styling where already used by reusable components

## General Working Rules

- Inspect the existing implementation and local conventions before creating new abstractions.
- Prefer extending current project patterns over inventing new folder structures or competing APIs.
- Do not move code across architectural layers without a clear reason.
- Do not duplicate existing reusable components or recreate abstractions that already exist.
- Keep changes scoped to the task, but update adjacent documentation when component APIs change.
- Remove dead code, unused imports, and obsolete helper files when replacing an implementation.
- Use module architecture.
- Prefer CVA for component variants.
- Shared UI primitives live in src/shared/ui.
- Do not put business logic inside route components.

## Architecture Boundaries

### `src/components/**`

Use this area for reusable component-level building blocks that may contain internal logic,
animation, and local UI substructure.

Current examples include:

- Header
- ResizableCard

Rules:

- Reusable complex UI components belong here.
- Component packages may include local `hooks`, `helpers`, `constants`, `types`, and `ui`
  folders when that pattern already exists.
- If a public component API changes, update its local README or usage documentation.
- Do not put route-specific showcase orchestration here unless it is truly part of the reusable
  component itself.

### `src/shared/ui/**`

Use this area for low-level shared UI primitives and small base components.

Rules:

- Keep this layer generic and lightweight.
- Do not move richer reusable components with significant behavior or animation into `shared/ui`
  only because they are reusable.
- Do not place showcase orchestration, route logic, or feature-specific compositions here.

### `src/modules/**`

Use this area for feature modules and page-level/component-level compositions.

Rules:

- Route-specific interactive compositions belong here when they are not reusable primitives.
- Modules may compose reusable components from `src/components/**` and shared primitives from
  `src/shared/ui/**`.
- Do not push page/showcase composition down into `src/components/**` unless it is reusable as
  part of the actual component package.

### `src/core/layouts/**`

Use this area for application shell and layout composition.

Rules:

- Layouts compose page shells, persistent navigation, and `<Outlet />`.
- Page-specific content does not belong in layouts.
- Landing, studio, and app shells must remain separate when the repository already separates them.

### `src/routes/**`

Use this area for TanStack Router route definitions.

Rules:

- Route files should stay thin and primarily wire URLs to layouts, modules, or page components.
- Prefer importing feature/page compositions from modules instead of placing large UI
  implementations directly in route files.
- Preserve the current folder-based route convention.
- Do not switch to dot-based route naming unless the repository itself already uses it for that
  exact area.
- Route groups in parentheses, such as `(landings)`, are organizational and must not accidentally
  become URL segments.
- Follow existing repository patterns for `route.tsx`, pathless layouts, and nested folders instead
  of inventing routing conventions.

## UI Showcase Rules

The `/ui/showcase` area is an interactive catalog of reusable UI components.

Rules:

- Prefer live, state-driven demos over static screenshot-like examples.
- A showcase should expose meaningful controls or presets when the component is customizable.
- If a preview requires isolation, justify the approach and avoid brittle cross-document
  implementations.
- Do not create repeated iframe galleries or disconnected static preview cards when one live
  configurable preview is the intended UX.
- Keep reusable component code separate from showcase orchestration.
- Showcase composition should follow the current module/page composition conventions and should not
  be placed in `src/shared/ui/**`.

## React 19 Conventions

- Write new function components in React 19 style.
- Prefer `ref` as a normal prop for new internal components instead of introducing `forwardRef`,
  unless a real compatibility reason is explicitly required.
- Prefer named runtime imports from `react` and `import type` for types when editing files.
- Do not add `import * as React` by default in new code unless the local file pattern or a concrete
  need justifies it.
- Preserve accessibility semantics and keyboard behavior when refactoring interactive components.
- use reexports like `index.ts` at every layer to expose components consistently, then use the
  reexported components in showcase code.

## Reusable Component Documentation

When a reusable component under `src/components/**` gains a new public prop, behavior mode, or
structural variant:

- update its README or local usage documentation;
- document the real API only;
- distinguish visual variants from structural or presentation variants;
- include basic usage and advanced usage when relevant;
- mention important interaction and accessibility behavior.

## Motion And Animation

When editing animated components:

- preserve the intended interaction quality, not only the TypeScript shape;
- verify that portals, scroll containers, and preview hosts do not break the intended motion
  behavior;
- keep reduced-motion support intact when it already exists.

## Validation Expectations

Before finishing substantial UI work:

- run the project build command;
- make sure that you are using barrel imports
- run `npm run test` then `npm run check ` and find out if there some errors;
- remove stale imports and dead files;
- report any command failures honestly.
