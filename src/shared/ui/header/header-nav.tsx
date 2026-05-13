import { type Ref, type HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/utils'

export type HeaderNavProps = HTMLAttributes<HTMLDivElement> & {
  ref?: Ref<HTMLDivElement>
}

export function HeaderNav({ ref, className, ...props }: HeaderNavProps) {
  return (
    <div
      ref={ref}
      data-slot="header-nav"
      className={cn('flex items-center gap-1', className)}
      {...props}
    />
  )
}
