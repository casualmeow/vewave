export default {
  '*.{js,jsx,ts,tsx}': [() => 'vitest run', 'eslint --fix', 'prettier --write'],
  '*.{json,md,css}': ['prettier --write'],
}
