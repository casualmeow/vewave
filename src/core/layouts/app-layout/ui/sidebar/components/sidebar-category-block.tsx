import { ChevronDown, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { SidebarItem } from '@/components/sidebar'
import { cn } from '@/shared/lib/utils'

export const sidebarCategoryPreviewLimit = 3

export function SidebarCategoryBlock({
  active,
  collapsed,
  emptyHint,
  expanded,
  icon: Icon,
  label,
  onOpen,
  onToggleExpanded,
  rows,
}: {
  active: boolean
  collapsed: boolean
  emptyHint: string
  expanded: boolean
  icon: LucideIcon
  label: string
  onOpen: () => void
  onToggleExpanded: () => void
  rows: Array<ReactNode>
}) {
  const count = rows.length

  if (collapsed) {
    return (
      <SidebarItem
        type="button"
        icon={<Icon />}
        value={label.toLowerCase()}
        active={active}
        disabled={count === 0}
        title={count === 0 ? `${label} — ${emptyHint}` : label}
        onClick={onOpen}
      >
        {label}
      </SidebarItem>
    )
  }

  const headerClassName = 'flex w-full items-center justify-between gap-2 px-2 py-1'

  return (
    <div className="mt-1 grid gap-0.5 border-t border-sidebar-border/60 pt-2.5">
      <div className={headerClassName}>
        <button
          type="button"
          className={cn(
            'flex-1 text-left text-[0.68rem] font-semibold uppercase tracking-[0.16em] rounded outline-none transition-colors focus-visible:ring-2 focus-visible:ring-sidebar-ring/50',
            active
              ? 'text-sidebar-foreground'
              : 'text-sidebar-foreground/60 hover:text-sidebar-foreground',
          )}
          onClick={onOpen}
        >
          {label}
        </button>

        <button
          type="button"
          className="rounded p-0.5 text-sidebar-foreground/45 outline-none transition-colors hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring/50"
          aria-label={`Toggle ${label} list`}
          aria-expanded={expanded}
          onClick={onToggleExpanded}
        >
          <ChevronDown
            className={cn('size-3.5 transition-transform duration-200', expanded && 'rotate-180')}
            aria-hidden
          />
        </button>
      </div>

      {expanded ? (
        count === 0 ? (
          <p className="px-2 text-xs leading-5 text-sidebar-foreground/50">{emptyHint}</p>
        ) : (
          <>
            {rows.slice(0, sidebarCategoryPreviewLimit)}
            {count > sidebarCategoryPreviewLimit ? (
              <button
                type="button"
                className="flex w-full items-center rounded-md px-2 py-1 text-left text-xs font-medium text-sidebar-foreground/55 outline-none transition-colors hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring/50"
                onClick={onOpen}
              >
                Show {count - sidebarCategoryPreviewLimit} more
              </button>
            ) : null}
          </>
        )
      ) : null}
    </div>
  )
}
