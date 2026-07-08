// Pre-commit: fast, file-scoped formatting + lint only.
// Tests (`vitest run`) and typecheck (`tsc --noEmit`) run in CI / on demand,
// not on every commit. Add them back here only if a specific need appears.
export default {
  '*.{js,jsx,ts,tsx}': ['eslint --fix', 'prettier --write'],
  '*.{json,md,css,html}': ['prettier --write'],
}
