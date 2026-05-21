import type { ReactNode } from 'react'

import type { ComponentApiRow } from '../content/component-docs-content'

export function DocsCodeBlock({ children }: { children: string }) {
  return (
    <div className="not-prose overflow-hidden rounded-lg border border-zinc-900 bg-zinc-950 shadow-sm">
      <div className="border-b border-white/10 px-4 py-2 text-xs font-medium text-zinc-400">
        Example
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-6 text-zinc-100">
        <code>{children}</code>
      </pre>
    </div>
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
