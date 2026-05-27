import { HeaderLeft } from './header-left'
import type { ComponentProps } from 'react'

import { Separator } from '@/shared/ui'
import { cn } from '@/shared/lib/utils'

export interface HeaderProps extends ComponentProps<'header'> {
  sidebarVisible: boolean
  onSidebarVisibilityChange: (visible: boolean) => void
}

export const Header = ({
  className,
  sidebarVisible,
  onSidebarVisibilityChange,
  ...props
}: HeaderProps) => {
  return (
    <>
      <header
        className={cn(
          'border-b-[1px] border-border p-6 h-18 flex items-center font-medium',
          className,
        )}
        {...props}
      >
        <HeaderLeft
          sidebarVisible={sidebarVisible}
          onSidebarVisibilityChange={onSidebarVisibilityChange}
        />
      </header>
      <Separator orientation="horizontal" />
    </>
  )
}
