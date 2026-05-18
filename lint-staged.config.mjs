export default {
  '*.{js,jsx,ts,tsx}': [
    () => 'vitest run',
    () => 'tsc -p tsconfig.json --noEmit',
    'eslint --fix',
    'prettier --write',
  ],
}
