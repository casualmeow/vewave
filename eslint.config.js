//  @ts-check

import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import { tanstackConfig } from '@tanstack/eslint-config'

const __dirname = dirname(fileURLToPath(import.meta.url))

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: [
      'dist/**',
      'src/core/api/generated/**',
      'src/routeTree.gen.ts',
      'eslint.config.js',
      'prettier.config.js',
      'vite.config.ts',
    ],
  },
  ...tanstackConfig,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: null,
        projectService: true,
      },
    },
    rules: {
      'sort-imports': 'off',
      'import/consistent-type-specifier-style': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
    },
  },
]
