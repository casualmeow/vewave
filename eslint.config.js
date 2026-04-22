//  @ts-check

import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import { tanstackConfig } from '@tanstack/eslint-config'

const __dirname = dirname(fileURLToPath(import.meta.url))

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...tanstackConfig,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      'sort-imports': 'off',
      'import/consistent-type-specifier-style': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
    },
    ignores: ['vite.config.js'],
  },
]
