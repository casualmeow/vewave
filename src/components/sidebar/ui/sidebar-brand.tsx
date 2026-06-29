import { sidebarBrandVariants } from '../constants'
import { useSidebarContext } from '../hooks'
import type { SidebarBrandProps } from '../types'
import { cn } from '@/shared/lib/utils'

export function SidebarBrand({
  ref,
  className,
  visual,
  title,
  subtitle,
  meta,
  ...props
}: SidebarBrandProps) {
  const { design, size, collapsed } = useSidebarContext()

  return (
    <div
      ref={ref}
      className={cn(sidebarBrandVariants({ design, size, collapsed }), className)}
      {...props}
    >
      {visual ? <div className="grid shrink-0 place-items-center">{visual}</div> : null}

      <div className={cn('min-w-0 flex-1', collapsed && 'sr-only')}>
        <div className="truncate text-sm font-semibold tracking-tight text-sidebar-foreground">
          {title}
        </div>
        {subtitle ? (
          <div className="truncate text-xs text-sidebar-foreground/80">{subtitle}</div>
        ) : null}
      </div>

      {meta && !collapsed ? <div className="shrink-0">{meta}</div> : null}
    </div>
  )
}
