import { type ReactNode } from 'react'
import { type MotionValue, motion } from 'motion/react'

import { type PremiumHeaderSlotClassNames } from '../types'

import { cn } from '@/shared/lib/utils'

type HeaderContentProps = {
  logo?: ReactNode
  navigation?: ReactNode
  actions?: ReactNode
  children?: ReactNode
  slotClassNames?: PremiumHeaderSlotClassNames
  navigationLabel: string
  hideNavOnCollapse: boolean
  isCollapsed: boolean
  navOpacity: MotionValue<number>
  navScale: MotionValue<number>
}

export function HeaderContent({
  logo,
  navigation,
  actions,
  children,
  slotClassNames,
  navigationLabel,
  hideNavOnCollapse,
  isCollapsed,
  navOpacity,
  navScale,
}: HeaderContentProps) {
  return (
    <div
      data-slot="premium-header-inner"
      className={cn(
        'relative z-10 flex min-w-0 flex-1 items-center justify-between gap-3',
        slotClassNames?.inner,
      )}
    >
      {logo ? (
        <div data-slot="premium-header-logo" className={cn('shrink-0', slotClassNames?.logo)}>
          {logo}
        </div>
      ) : null}

      {navigation ? (
        <motion.nav
          data-slot="premium-header-navigation"
          aria-label={navigationLabel}
          aria-hidden={hideNavOnCollapse && isCollapsed ? true : undefined}
          className={cn(
            'hidden min-w-0 flex-1 items-center justify-center overflow-hidden md:flex',
            slotClassNames?.navigation,
          )}
          style={
            hideNavOnCollapse
              ? {
                  opacity: navOpacity,
                  scale: navScale,
                  pointerEvents: isCollapsed ? 'none' : 'auto',
                }
              : undefined
          }
        >
          {navigation}
        </motion.nav>
      ) : null}

      {actions ? (
        <div
          data-slot="premium-header-actions"
          className={cn('flex shrink-0 items-center gap-2', slotClassNames?.actions)}
        >
          {actions}
        </div>
      ) : null}

      {children ? (
        <div
          data-slot="premium-header-children"
          className={cn('min-w-0', slotClassNames?.children)}
        >
          {children}
        </div>
      ) : null}
    </div>
  )
}
