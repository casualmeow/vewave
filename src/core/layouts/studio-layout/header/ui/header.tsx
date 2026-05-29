import { HeaderLeft } from './header-left'
import type { ComponentProps } from 'react'

import { Separator } from '@/shared/ui'
import { cn } from '@/shared/lib/utils'

export interface HeaderProps extends ComponentProps<'header'> {}

export const Header = ({ className, ...props }: HeaderProps) => {
  return (
    <>
      <header
        className={cn(
          'flex h-18 items-center border-b-[1px] border-border p-6 font-medium',
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
