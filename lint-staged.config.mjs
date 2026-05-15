export default {
  '*.{js,jsx,ts,tsx}': [() => 'vitest run', 'tsc --noemit', 'eslint --fix', 'prettier --write'],
  '*.{json,md,css}': ['prettier --write'],
}
