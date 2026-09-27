import { defineConfig } from 'orval'
import { cleanSourceComments } from './scripts/source-comments.mjs'

export default defineConfig({
  vewave: {
    input: {
      target: 'http://127.0.0.1:3001/openapi/json',
    },
    output: {
      mode: 'tags-split',
      target: './src/core/api/generated',
      schemas: './src/core/api/generated/model',
      client: 'react-query',
      httpClient: 'axios',
      clean: true,
      override: {
        header: false,
        jsDoc: { filter: () => [] },
        mutator: {
          path: './src/core/api/http/orval-mutator.ts',
          name: 'orvalMutator',
        },
      },
    },
    hooks: {
      afterAllFilesWrite: () => {
        cleanSourceComments(['src/core/api/generated'])
      },
    },
  },
})
