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
          'not-prose overflow-hidden rounded-lg border border-zinc-900 bg-zinc-950 shadow-[0_16px_50px_rgba(15,23,42,0.18)] [&_pre]:px-4 [&_pre]:py-4 [&_pre]:text-sm [&_pre]:leading-6',
        viewportProps: {
          className: 'max-h-[34rem] overflow-auto bg-zinc-950 text-zinc-100 [scrollbar-width:thin]',
        },
      }}
    />
  )
}

export function DocsPropTable({ rows }: { rows: Array<ComponentApiRow> }) {
  return (
    <div className="not-prose overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <div className="grid grid-cols-[minmax(8rem,0.7fr)_minmax(10rem,1fr)_minmax(12rem,1.4fr)] border-b border-zinc-200 bg-zinc-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
        <span>Prop</span>
        <span>Type</span>
        <span>Description</span>
      </div>
      <div className="divide-y divide-zinc-200">
        {rows.map((row) => (
          <div
            key={row.name}
            className="grid gap-3 px-4 py-4 text-sm sm:grid-cols-[minmax(8rem,0.7fr)_minmax(10rem,1fr)_minmax(12rem,1.4fr)]"
          >
            <code className="font-semibold text-zinc-950">{row.name}</code>
            <code className="break-words text-xs leading-5 text-teal-700">{row.type}</code>
            <p className="leading-6 text-zinc-600">{row.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function DocsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">{title}</h2>
      {children}
    </section>
  )
}
