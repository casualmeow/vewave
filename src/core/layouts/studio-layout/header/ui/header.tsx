import { HeaderLeft } from './header-left'
import type { ComponentProps } from 'react'

import { Separator } from '@/shared/ui'
import { cn } from '@/shared/lib/utils'

export interface HeaderProps extends ComponentProps<'header'> {
  onSidebarVisibilityChange?: () => void
  sidebarVisible?: boolean
}

export const Header = ({
  className,
  onSidebarVisibilityChange,
  sidebarVisible = true,
  ...props
}: HeaderProps) => {
  return (
    <>
      <header
        className={cn(
          'flex h-18 items-center border-b-[1px] border-border p-6 font-medium',
          className,
        )}
        {...props}
      >
        <HeaderLeft
          onSidebarVisibilityChange={onSidebarVisibilityChange}
          sidebarVisible={sidebarVisible}
        />
      </header>
      <Separator orientation="horizontal" />
    </>
  )
}
