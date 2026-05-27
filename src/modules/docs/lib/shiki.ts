import { createShikiFactory } from 'fumadocs-core/highlight/shiki'
import { createHighlighter } from 'shiki/bundle/web'

export const docsShiki = createShikiFactory({
  init: () =>
    createHighlighter({
      themes: ['github-dark', 'github-light'],
      langs: ['tsx', 'typescript', 'javascript', 'bash', 'json'],
    }),
})
