import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/utils'

export function SettingsGroup({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="grid gap-3">
      <h3 className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
  )
}

export function SettingRow({
  control,
  description,
  title,
}: {
  control?: ReactNode
  description?: ReactNode
  title: ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="text-sm font-medium text-foreground">{title}</div>
        {description ? (
          <p className="mt-0.5 text-sm leading-5 text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {control ? <div className="flex shrink-0 items-center gap-2">{control}</div> : null}
    </div>
  )
}

export type SegmentedOption<T extends string> = {
  icon?: LucideIcon
  label: string
  value: T
}

export function SegmentedControl<T extends string>({
  ariaLabel,
  onChange,
  options,
  value,
}: {
  ariaLabel: string
  onChange: (value: T) => void
  options: ReadonlyArray<SegmentedOption<T>>
  value: T
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="glass-control-track flex w-fit flex-wrap gap-1 rounded-lg border border-border/70 p-1"
    >
      {options.map((option) => {
        const active = option.value === value

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'glass-control inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
              active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {option.icon ? <option.icon className="size-4" /> : null}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export function SettingsItemRow({
  actions,
  meta,
  title,
}: {
  actions?: ReactNode
  meta?: ReactNode
  title: ReactNode
}) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-card px-3 py-2.5">
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-foreground">{title}</div>
        {meta ? <div className="mt-0.5 truncate text-xs text-muted-foreground">{meta}</div> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-1">{actions}</div> : null}
    </li>
  )
}

export function SettingsEmptyHint({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-border/80 bg-muted/20 px-3 py-4 text-center text-sm text-muted-foreground">
      {children}
    </p>
  )
}
