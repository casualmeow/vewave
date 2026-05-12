import { HeaderLeft } from './header-left'
import type { ComponentProps } from 'react'

import { Separator } from '@/shared/ui'
import { cn } from '@/shared/lib/utils'

export const Header = ({ className, ...props }: ComponentProps<'header'>) => {
  return (
    <>
      <header
        className={cn(
          'border-b-[1px] border-border p-6 h-18 flex items-center font-medium',
          className,
        )}
        {...props}
      >
        <HeaderLeft />
      </header>
      <Separator orientation="horizontal" />
    </>
  )
}
