import { sidebarSectionVariants } from '../constants'
import { useSidebarContext } from '../hooks'
import type { SidebarSectionProps } from '../types'
import { cn } from '@/shared/lib/utils'

export function SidebarSection({ ref, title, className, children, ...props }: SidebarSectionProps) {
  const { size, density, collapsed } = useSidebarContext()

  return (
    <section
      ref={ref}
      className={cn(sidebarSectionVariants({ size, density }), className)}
      {...props}
    >
      {title ? (
        <div
          className={cn(
            'px-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground',
            collapsed && 'sr-only',
          )}
        >
          {title}
        </div>
      ) : null}
      <div className={cn(density === 'compact' ? 'space-y-1' : 'space-y-1.5')}>{children}</div>
    </section>
  )
}
