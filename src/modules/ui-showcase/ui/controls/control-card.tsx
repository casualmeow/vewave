import type { ReactNode } from 'react'

export function ControlCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <legend className="px-1 text-sm font-semibold">{title}</legend>
      <div className="mt-3 grid gap-4">{children}</div>
    </fieldset>
  )
}
