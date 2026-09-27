import { HeaderLeft } from './header-left'
import type { ComponentProps } from 'react'

import { GlassSurface } from '@/shared/ui'
import { cn } from '@/shared/lib/utils'

export interface HeaderProps extends ComponentProps<'header'> {}

export const Header = ({ className, ...props }: HeaderProps) => {
  return (
    <GlassSurface asChild role="header" thickness="thin" elevation="embedded">
      <header
        className={cn('flex h-18 shrink-0 items-center border-b p-6 font-medium', className)}
        {...props}
      >
        <HeaderLeft />
      </header>
    </GlassSurface>
  )
}
