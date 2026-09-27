import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { FluidGlassGroup, FluidGlassTarget } from '@/components/fluid-glass'
import { cn } from '@/shared/lib/utils'

export function SettingsGroup({
  children,
  title,
  searchId,
}: {
  children: ReactNode
  title: string
  searchId?: string
}) {
  return (
    <section data-settings-anchor={searchId} className="grid gap-3">
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      {children}
    </section>
  )
}

export function SettingRow({
  control,
  description,
  title,
  searchId,
}: {
  control?: ReactNode
  description?: ReactNode
  title: ReactNode
  searchId?: string
}) {
  return (
    <div
      data-settings-anchor={searchId}
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0">
        <div className="text-sm font-medium text-foreground">{title}</div>
        {description ? (
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
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
    <FluidGlassGroup
      environment={{ type: 'auto-dom' }}
      className="fluid-glass-selection-track glass-control-track w-fit rounded-lg p-1"
    >
      <div role="group" aria-label={ariaLabel} className="flex flex-wrap gap-1">
        {options.map((option) => {
          const active = option.value === value

          return (
            <FluidGlassTarget
              key={option.value}
              id={option.value}
              active={active}
              behaviors={['selection']}
              radius="inherit"
              asChild
            >
              <button
                type="button"
                aria-pressed={active}
                onClick={() => onChange(option.value)}
                className={cn(
                  'glass-control inline-flex min-h-9 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring/50 [@media(pointer:coarse)]:min-h-11',
                  active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {option.icon ? <option.icon aria-hidden="true" className="size-4" /> : null}
                {option.label}
              </button>
            </FluidGlassTarget>
          )
        })}
      </div>
    </FluidGlassGroup>
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
    <li className="flex items-center justify-between gap-3 py-3">
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-foreground">{title}</div>
        {meta ? <div className="mt-0.5 truncate text-xs text-muted-foreground">{meta}</div> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-1">{actions}</div> : null}
    </li>
  )
}

export function SettingsEmptyHint({ children }: { children: ReactNode }) {
  return <p className="py-3 text-sm leading-6 text-muted-foreground">{children}</p>
}
