import { sidebarFooterVariants } from '../constants'
import { useSidebarContext } from '../hooks'
import type { SidebarFooterProps } from '../types'
import { cn } from '@/shared/lib/utils'

export function SidebarFooter({ ref, className, children, ...props }: SidebarFooterProps) {
  const { design, size } = useSidebarContext()

  return (
    <div ref={ref} className={cn(sidebarFooterVariants({ design, size }), className)} {...props}>
      {children}
    </div>
  )
}
