import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock.core'
import { docsShiki } from '../lib/shiki'
import type { ReactNode } from 'react'

import type { ComponentApiRow } from '../content/component-docs-content'

export function DocsCodeBlock({
  children,
  lang = 'tsx',
  title = 'Example',
}: {
  children: string
  lang?: string
  title?: string
}) {
  return (
    <div className="min-w-0 max-w-full overflow-hidden">
      <DynamicCodeBlock
        highlighter={() => docsShiki.getOrInit()}
        lang={lang}
        code={children}
        options={{
          theme: 'github-dark',
        }}
        codeblock={{
          title,
          className:
            'not-prose max-w-full overflow-hidden rounded-lg border border-border bg-foreground shadow-[0_16px_50px_color-mix(in_srgb,var(--foreground)_18%,transparent)] [&_pre]:px-4 [&_pre]:py-4 [&_pre]:text-sm [&_pre]:leading-6',
          viewportProps: {
            className:
              'max-h-[34rem] max-w-full overflow-auto bg-foreground text-background [scrollbar-width:thin]',
          },
        }}
      />
    </div>
  )
}

export function DocsPropTable({ rows }: { rows: Array<ComponentApiRow> }) {
  return (
    <div className="not-prose overflow-hidden rounded-lg border border-border bg-card">
      <div className="grid grid-cols-[minmax(8rem,0.7fr)_minmax(10rem,1fr)_minmax(12rem,1.4fr)] border-b border-border bg-muted/45 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        <span>Prop</span>
        <span>Type</span>
        <span>Description</span>
      </div>
      <div className="divide-y divide-border">
        {rows.map((row) => (
          <div
            key={row.name}
            className="grid gap-3 px-4 py-4 text-sm sm:grid-cols-[minmax(8rem,0.7fr)_minmax(10rem,1fr)_minmax(12rem,1.4fr)]"
          >
            <code className="font-semibold text-foreground">{row.name}</code>
            <code className="break-words text-xs leading-5 text-primary">{row.type}</code>
            <p className="leading-6 text-muted-foreground">{row.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function DocsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
      {children}
    </section>
  )
}
