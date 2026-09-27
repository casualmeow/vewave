# Testing and troubleshooting

Choose checks that cover the behavior you changed. Unit tests, type checks, and browser evidence answer different questions.

## Client checks

Run commands from `client/`:

```bash
npx vitest run src/__tests__/unit/components/fluid-glass/lens-fallback-material.test.tsx
npm run typecheck:tsc
```

Use the smallest relevant test file while iterating. `npm run typecheck:tsc` checks types without route generation. After adding a route, run `npm run routes:gen` before the typecheck.

For an explicitly broad test audit, use `npm test -- --maxWorkers=4`. The current Vitest configuration imports Vite plugins, so it can regenerate the route tree. Review generated changes rather than treating every changed file as handwritten work.

`npm run build` builds the client and checks TypeScript. `npm run check` is broader: route generation, formatting, linting, types, and unit tests. It is not a synonym for typecheck.

## Pre-commit checks

Husky runs `npm run lint-staged`, which lints and formats staged files serially. This keeps Windows argument-length chunks from launching many type-aware ESLint processes together. Failed tasks trigger rollback; subsequent `SIGKILL` messages can indicate cancellation after the first reported error.

Application TypeScript uses ESLint's project service. The browser init script `scripts/lens-spike-instrument.js` has an exact `allowDefaultProject` exception in the shared parser configuration because it runs directly in Playwright pages and is outside the TypeScript project. Keep this exception narrow and consistent across mixed JS/TS batches; do not disable application type-aware rules to accommodate scripts.

Keep temporary diagnostics under the ignored `.tmp/` directory. Commit fixtures and maintained measurement tooling with their feature, generated comment cleanup separately, and documentation with its owning change.

## Browser evidence

```bash
npx playwright test --list
```

Collection verifies that browser tests can be discovered; it does not run a browser or prove optical quality. Run a specific browser suite only when browser verification is requested and the required application and fixtures are available.

Do not launch development servers or visual browser checks automatically for a small style change.

## Server checks

Run commands from `server/`:

```bash
bun test tests/unit/playback.test.ts
bun run typecheck
```

API integration tests inject in-memory services. Run the affected test files for backend changes. Reserve the full `bun test` suite for broad audits or changes that justify it.

A deliberately logged database-unavailable error can be part of a passing error-handling test. Read the test result and scenario before diagnosing infrastructure.

## Diagnose glass failures

- A geometry assertion belongs on the carrier, which owns translation and dimensions.
- A material assertion belongs on the nested material body, which owns filters and fill.
- Solid mode and reduced transparency are valid outcomes, not rendering failures.
- Unsupported CSS declarations may be discarded by jsdom. Use server-rendered markup for declaration contracts.
- A string-based design-contract test can become stale after a semantic component refactor. Preserve its behavior requirement when updating the expected source.
- Shader parity tests compare authored GLSL with the runtime template. Update both together.

## Keep tests isolated

Reset stores, root appearance attributes, mocks, observers, and media-query stubs. Await asynchronous React effects inside `act`; avoid timers that remain alive after unmount.

Use clear test names instead of explanatory code comments. Do not fix a failing test by skipping it, weakening accessibility assertions, or suppressing TypeScript errors.

## Report the actual boundary

State which checks ran and which did not. A passing unit suite does not establish browser appearance or GPU behavior. Report unrelated failures separately and keep fixes within the requested scope.
