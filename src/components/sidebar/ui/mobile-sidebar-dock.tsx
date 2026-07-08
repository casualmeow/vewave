import { motion, useReducedMotion } from 'motion/react'
import { useId, useState } from 'react'
import { SIDEBAR_FLUID_TRANSITION } from '../constants'
import { useFinePointer, useMobileDockPhysics, useResolvedFluidConfig } from '../hooks'
import { toMotionDragMode } from '../helpers'
import { MobileSidebarDockButton } from './mobile-sidebar-dock-item'
import { MobileDockLiquidEffects } from './mobile-dock-liquid-effects'
import type { CSSProperties, ReactNode } from 'react'
import type { LinkProps } from '@tanstack/react-router'

import type {
  SidebarDragMode,
  SidebarFluidPreset,
  SidebarFluidInteractionProps,
  SidebarMobileDockPlacement,
} from '../types'
import { cn } from '@/shared/lib/utils'

export type MobileSidebarDockItem = {
  id?: string
  label: string
  shortLabel?: string
  to: NonNullable<LinkProps['to']>
  params?: LinkProps['params']
  search?: LinkProps['search']
  icon: ReactNode
  badge?: ReactNode
  disabled?: boolean
}

export interface MobileSidebarDockProps extends SidebarFluidInteractionProps {
  items: Array<MobileSidebarDockItem>
  pathname: string
  ariaLabel?: string
  className?: string
  fluidPreset?: SidebarFluidPreset
  dockDragMode?: SidebarDragMode
  maxItems?: number
  placement?: SidebarMobileDockPlacement
}

function getMobileDockItemKey(item: MobileSidebarDockItem) {
  return item.id ?? `${String(item.to)}:${JSON.stringify(item.params ?? {})}`
}

function getMobileDockItemPath(item: MobileSidebarDockItem) {
  if (item.to === '/room/$code') {
    const params = item.params as { code?: string } | undefined

    return params?.code ? `/room/${params.code}` : String(item.to)
  }

  return String(item.to)
}

function isActivePath(pathname: string, item: MobileSidebarDockItem) {
  const itemPath = getMobileDockItemPath(item)

  return pathname === itemPath || pathname.startsWith(`${itemPath}/`)
}

export function MobileSidebarDock({
  items,
  pathname,
  ariaLabel = 'Mobile navigation',
  className,
  fluidPreset = 'subtle',
  hoverScale,
  activeHoverScale,
  dragScale,
  hoverSize,
  magneticStrength,
  magneticVerticalStrength,
  tiltStrength,
  focusBlur,
  focusBlurAmount,
  focusDimOpacity,
  liquidIntensity,
  dragMode = 'none',
  dockDragMode = 'none',
  maxItems = 5,
  placement = 'container',
}: MobileSidebarDockProps) {
  const prefersReducedMotion = useReducedMotion()
  const finePointer = useFinePointer()
  const canAnimate = !prefersReducedMotion
  const expressiveDock = fluidPreset === 'expressive' || fluidPreset === 'extreme'
  const showLiquidEffects = expressiveDock && canAnimate
  const canTrackPointer = showLiquidEffects && finePointer
  const scopeId = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const gooFilterId = `${scopeId}-mobile-dock-goo`
  const refractionId = `${scopeId}-mobile-dock-refraction`

  const [focusedItemKey, setFocusedItemKey] = useState<string | null>(null)
  const visibleItems = items.slice(0, maxItems)
  const effectiveFocusedItemKey = focusedItemKey

  const config = useResolvedFluidConfig({
    fluidPreset,
    minHoverSize: 12,
    hoverScale,
    activeHoverScale,
    dragScale,
    hoverSize,
    magneticStrength,
    magneticVerticalStrength,
    tiltStrength,
    focusBlur,
    focusBlurAmount,
    focusDimOpacity,
    liquidIntensity,
    dragMode,
  })

  const { fluidTransformStyle, handlePointerMove, handlePointerLeave } = useMobileDockPhysics({
    canTrackPointer: Boolean(canTrackPointer),
    showLiquidEffects,
    onPointerLeave: () => setFocusedItemKey(null),
  })

  return (
    <motion.div
      aria-label={ariaLabel}
      data-slot="mobile-sidebar-dock"
      className={cn(
        placement === 'viewport'
          ? 'pointer-events-none fixed inset-x-0 bottom-3 z-50 px-3 pb-[env(safe-area-inset-bottom)] md:hidden'
          : placement === 'inline'
            ? 'pointer-events-none sticky bottom-0 z-40 w-full px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] md:hidden'
            : 'pointer-events-none absolute inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+1rem)] z-40 md:hidden',
        className,
      )}
      initial={canAnimate ? { opacity: 0, y: 26, scale: 0.96 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={SIDEBAR_FLUID_TRANSITION}
    >
      <motion.div
        className="pointer-events-auto relative mx-auto max-w-[27rem] overflow-visible rounded-[1.85rem] border border-[color:var(--glass-border)] bg-[var(--glass-background)] p-2 shadow-[0_16px_42px_color-mix(in_srgb,var(--foreground)_18%,transparent),inset_0_1px_0_var(--glass-highlight)] backdrop-blur-xl [--mobile-dock-glow-opacity:0.24] [--mobile-dock-pointer-x:50%] [--mobile-dock-pointer-y:50%] [--mobile-dock-sheen-x:22%] [--mobile-dock-sheen-y:12%]"
        style={{ ...fluidTransformStyle }}
        drag={showLiquidEffects ? toMotionDragMode(dockDragMode) : false}
        dragConstraints={{ left: -18, right: 18, top: -10, bottom: 10 }}
        dragElastic={0.32}
        dragMomentum={false}
        dragSnapToOrigin
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        {showLiquidEffects ? (
          <MobileDockLiquidEffects gooFilterId={gooFilterId} refractionId={refractionId} />
        ) : null}

        <div
          className="relative z-10 grid grid-cols-[repeat(var(--mobile-dock-count),minmax(0,1fr))] gap-1.5"
          style={{ '--mobile-dock-count': visibleItems.length } as CSSProperties}
        >
          {visibleItems.map((item) => {
            const itemKey = getMobileDockItemKey(item)

            return (
              <MobileSidebarDockButton
                key={itemKey}
                item={item}
                itemKey={itemKey}
                active={isActivePath(pathname, item)}
                scopeId={scopeId}
                filterId={gooFilterId}
                refractionId={refractionId}
                config={config}
                canAnimate={canAnimate}
                showLiquidEffects={showLiquidEffects}
                canTrackPointer={Boolean(canTrackPointer)}
                effectiveFocusedItemKey={effectiveFocusedItemKey}
                setFocusedItemKey={setFocusedItemKey}
              />
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}
