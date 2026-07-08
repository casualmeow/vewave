# Client Conventions

Adds to root `AGENTS.md`. Stack, formatting, imports, and the `routes → modules → components → shared/ui → core` layering are defined there and apply here. This file covers what is specific to the client.

## Architecture Boundaries (client-specific detail)

- `src/components/**`: reusable complex UI components. May include local `hooks`, `helpers`, `constants`, `types`, `ui` folders when that pattern already exists nearby. Do not put route-specific showcase orchestration here unless it is truly part of the reusable component.
- `src/shared/ui/**`: low-level generic primitives only. Do not move richer reusable components here just because they are reused once.
- `src/modules/**`: feature modules and page/component compositions. Compose from `components/**` and `shared/ui/**`; do not push page/showcase composition down into `components/**` unless it is reusable as part of the component package.
- `src/core/layouts/**`: app shell and layout composition. Landing, studio, and app shells stay separate.
- `src/routes/**`: thin TanStack Router route definitions. Preserve folder-based convention; do not switch to dot-based naming unless the repo already uses it for that area. Route groups in parentheses (e.g. `(landings)`) are organizational, not URL segments.

## UI Showcase (`/ui/showcase`)

- Prefer live, state-driven demos over static screenshot-like examples.
- Expose meaningful controls/presets when the component is customizable.
- One live configurable preview beats repeated iframe galleries or disconnected static cards.
- Keep reusable component code separate from showcase orchestration.

## Reusable Component Docs

When a reusable component under `src/components/**` gains a new public prop, behavior mode, or structural variant: update its UI-kit docs page under `/docs/ui/components/**`. Document the real API, distinguish visual from structural variants, include basic + advanced usage, and note interaction/accessibility behavior.

## React 19 Conventions

- New function components use React 19 style; prefer `ref` as a normal prop — do not introduce `forwardRef` unless a real compatibility reason requires it.
- Prefer named runtime imports from `react` and `import type` for types. Do not add `import * as React` unless the local file pattern justifies it.
- Use `index.ts` reexports at each layer to expose components consistently; consume the reexported components in showcase code.
- Preserve accessibility semantics and keyboard behavior when refactoring interactive components.

## Motion And Animation

- Preserve the intended interaction quality, not only the TypeScript shape.
- Verify portals, scroll containers, and preview hosts do not break the intended motion.
- Keep reduced-motion support intact when it exists.

## Validation Expectations

Verification should match the size of the change, not run on autopilot.

- For small changes (a class, a prop, copy, a single component edit): confirm the edit in the diff and stop. Do not run the full build, the full test suite, or launch a browser to visually verify.
- Run only the single test file that covers the touched surface — for sidebar/navigation work that is `src/__tests__/unit/core/layouts/navigation-design-contract.test.ts`. Not the whole suite.
- Run `npm run check` (typecheck) only when you changed types, imports, or signatures. Not a default step for markup or CSS edits.
- Use barrel imports; remove stale imports and dead files you created. Do not delete code you did not write.
- Never repair pre-existing test or typecheck failures unrelated to the change. Report them in one line and continue. See root `AGENTS.md` "Effort And Scope Discipline".
- If you did not run a command, do not claim you did. Report failures honestly and stop.

## Visual Design Rules

- `DESIGN.md` is the source of truth for visual hierarchy, brand voice, icon style, screenshot sourcing, and interaction tone.
- Do not ship new marketing or shell UI based only on generated placeholder blocks; use real product screenshots or reference-driven mocks tied to existing routes.
- Persistent navigation prioritizes current-state clarity over decorative motion.
- Avoid starter assets in product UI (sample avatars, placeholder logos, default demo copy, generic dashboard filler).
- Rounded surfaces express hierarchy — do not apply the same radius and contrast treatment to every layer.
- Top-level product/navigation icons use Vewave-specific assets when the surface is identity-bearing; Lucide for low-risk utility actions.
