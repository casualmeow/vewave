import { Link } from '@tanstack/react-router'
import { motion, useReducedMotion } from 'motion/react'
import { useId, useState } from 'react'
import { SIDEBAR_FLUID_TRANSITION } from '../constants'
import {
  useFinePointer,
  useFluidTransform,
  useRafCssVariables,
  useResolvedFluidConfig,
} from '../hooks'
import { getPointerProgress, toMotionDragMode } from '../helpers'
import type { MotionStyle } from 'motion/react'
import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import type { LinkProps } from '@tanstack/react-router'

import type {
  SidebarDragMode,
  SidebarFluidPreset,
  SidebarFluidInteractionProps,
  SidebarMobileDockPlacement,
  SidebarResolvedFluidConfig,
} from '../types'
import { cn } from '@/shared/lib/utils'

type MobileDockStyle = MotionStyle & Record<`--${string}`, string | number>

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
  const setCssVariables = useRafCssVariables()
  const { fluidTransformStyle, updateFluidTransform, resetFluidTransform } = useFluidTransform({
    enabled: canTrackPointer,
    magneticStrength: 0,
    magneticVerticalStrength: 0,
    tiltStrength: 1.45,
    perspective: 1100,
    tiltSpring: { stiffness: 180, damping: 28, mass: 0.72 },
  })

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!canTrackPointer) return

    const progress = getPointerProgress({
      clientX: event.clientX,
      clientY: event.clientY,
      rect: event.currentTarget.getBoundingClientRect(),
    })

    setCssVariables(event.currentTarget, {
      '--mobile-dock-pointer-x': `${progress.localX}px`,
      '--mobile-dock-pointer-y': `${progress.localY}px`,
      '--mobile-dock-sheen-x': `${progress.percentX}%`,
      '--mobile-dock-sheen-y': `${progress.percentY}%`,
      '--mobile-dock-glow-opacity': '0.86',
    })

    updateFluidTransform(progress.normalizedX, progress.normalizedY)
  }

  const handlePointerLeave = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (showLiquidEffects) {
      setCssVariables(event.currentTarget, {
        '--mobile-dock-pointer-x': '50%',
        '--mobile-dock-pointer-y': '50%',
        '--mobile-dock-sheen-x': '22%',
        '--mobile-dock-sheen-y': '12%',
        '--mobile-dock-glow-opacity': '0.28',
      })
    }

    setFocusedItemKey(null)
    resetFluidTransform()
  }

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
        style={{
          ...fluidTransformStyle,
        }}
        drag={showLiquidEffects ? toMotionDragMode(dockDragMode) : false}
        dragConstraints={{ left: -18, right: 18, top: -10, bottom: 10 }}
        dragElastic={0.32}
        dragMomentum={false}
        dragSnapToOrigin
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        {showLiquidEffects ? (
          <>
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute size-0"
              focusable="false"
            >
              <defs>
                <filter id={`${scopeId}-mobile-dock-goo`}>
                  <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                  <feColorMatrix
                    in="blur"
                    mode="matrix"
                    values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 30 -15"
                    result="goo"
                  />
                  <feComposite in="SourceGraphic" in2="goo" operator="atop" />
                </filter>
                <filter
                  id={`${scopeId}-mobile-dock-refraction`}
                  x="-20%"
                  y="-20%"
                  width="140%"
                  height="140%"
                >
                  <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.014 0.04"
                    numOctaves="2"
                    seed="9"
                    result="noise"
                  />
                  <feDisplacementMap
                    in="SourceGraphic"
                    in2="noise"
                    scale="14"
                    xChannelSelector="R"
                    yChannelSelector="G"
                  />
                </filter>
              </defs>
            </svg>

            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_var(--mobile-dock-pointer-x)_var(--mobile-dock-pointer-y),var(--glass-highlight),transparent_36%),linear-gradient(120deg,transparent,var(--glass-highlight)_var(--mobile-dock-sheen-x),transparent)] opacity-[var(--mobile-dock-glow-opacity)]"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
              style={{ filter: `url(#${scopeId}-mobile-dock-refraction)` }}
            >
              <span className="absolute -left-8 top-1/2 size-24 -translate-y-1/2 rounded-full bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] blur-xl" />
              <span className="absolute -right-8 bottom-0 size-24 rounded-full bg-[color-mix(in_srgb,var(--primary)_18%,transparent)] blur-xl" />
            </span>
          </>
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
                filterId={`${scopeId}-mobile-dock-goo`}
                refractionId={`${scopeId}-mobile-dock-refraction`}
                config={config}
                canAnimate={canAnimate}
                showLiquidEffects={showLiquidEffects}
                canTrackPointer={canTrackPointer}
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

interface MobileSidebarDockButtonProps {
  item: MobileSidebarDockItem
  itemKey: string
  active: boolean
  scopeId: string
  filterId: string
  refractionId: string
  config: SidebarResolvedFluidConfig
  canAnimate: boolean
  showLiquidEffects: boolean
  canTrackPointer: boolean
  effectiveFocusedItemKey: string | null
  setFocusedItemKey: (key: string | null) => void
}

function MobileSidebarDockButton({
  item,
  itemKey,
  active,
  scopeId,
  filterId,
  refractionId,
  config,
  canAnimate,
  showLiquidEffects,
  canTrackPointer,
  effectiveFocusedItemKey,
  setFocusedItemKey,
}: MobileSidebarDockButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const hasFocusedSibling = Boolean(
    showLiquidEffects &&
      config.focusBlur &&
      effectiveFocusedItemKey &&
      effectiveFocusedItemKey !== itemKey &&
      canAnimate,
  )
  const setCssVariables = useRafCssVariables()
  const { fluidTransformStyle, updateFluidTransform, resetFluidTransform } = useFluidTransform({
    enabled: canTrackPointer && !item.disabled,
    magneticStrength: config.magneticStrength,
    magneticVerticalStrength: config.magneticVerticalStrength,
    tiltStrength: config.tiltStrength,
    perspective: 800,
    tiltSpring: { stiffness: 420, damping: 32, mass: 0.58 },
  })
  const liquidInset = showLiquidEffects
    ? isDragging
      ? -config.hoverSize * 1.35
      : isHovered
        ? -config.hoverSize
        : active
          ? -Math.max(3, config.hoverSize * 0.34)
          : 0
    : 0

  const itemStyle = {
    '--dock-item-pointer-x': '50%',
    '--dock-item-pointer-y': '50%',
    '--dock-item-glow-opacity': showLiquidEffects
      ? isHovered || isDragging
        ? 1
        : active
          ? 0.62
          : 0
      : 0,
    ...fluidTransformStyle,
  } satisfies MobileDockStyle

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!canTrackPointer || item.disabled) return

    const progress = getPointerProgress({
      clientX: event.clientX,
      clientY: event.clientY,
      rect: event.currentTarget.getBoundingClientRect(),
    })

    setCssVariables(event.currentTarget, {
      '--dock-item-pointer-x': `${progress.percentX}%`,
      '--dock-item-pointer-y': `${progress.percentY}%`,
      '--dock-item-glow-opacity': '1',
    })

    updateFluidTransform(progress.normalizedX, progress.normalizedY)
  }

  const handlePointerLeave = (event: ReactPointerEvent<HTMLDivElement>) => {
    setIsHovered(false)
    setIsDragging(false)

    if (showLiquidEffects) {
      setCssVariables(event.currentTarget, {
        '--dock-item-pointer-x': '50%',
        '--dock-item-pointer-y': '50%',
        '--dock-item-glow-opacity': active ? '0.62' : '0',
      })
    }

    setFocusedItemKey(null)
    resetFluidTransform()
  }

  return (
    <motion.div
      data-slot="mobile-sidebar-dock-item-shell"
      data-focused={effectiveFocusedItemKey === itemKey ? 'true' : 'false'}
      data-deemphasized={hasFocusedSibling ? 'true' : 'false'}
      className="group/mobile-dock-item relative isolate min-w-0 [--dock-item-glow-opacity:0] [--dock-item-pointer-x:50%] [--dock-item-pointer-y:50%]"
      style={itemStyle}
      animate={
        canAnimate
          ? {
              filter: hasFocusedSibling
                ? `blur(${config.focusBlurAmount}px) saturate(0.76) contrast(0.92)`
                : 'blur(0px) saturate(1) contrast(1)',
              opacity: hasFocusedSibling ? config.focusDimOpacity : 1,
            }
          : undefined
      }
      drag={
        showLiquidEffects && canAnimate && !item.disabled
          ? toMotionDragMode(config.dragMode)
          : false
      }
      dragConstraints={{
        left: -config.hoverSize,
        right: config.hoverSize,
        top: -config.hoverSize,
        bottom: config.hoverSize,
      }}
      dragElastic={0.42}
      dragMomentum={false}
      dragSnapToOrigin
      whileHover={
        canAnimate && !item.disabled
          ? { scale: active ? config.activeHoverScale : config.hoverScale }
          : undefined
      }
      whileTap={canAnimate && !item.disabled ? { scale: 0.92 } : undefined}
      whileDrag={
        showLiquidEffects && canAnimate && !item.disabled
          ? { scale: config.dragScale, zIndex: 50 }
          : undefined
      }
      transition={SIDEBAR_FLUID_TRANSITION}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => {
        if (!showLiquidEffects || item.disabled) return
        setIsHovered(true)
        setFocusedItemKey(itemKey)
      }}
      onPointerLeave={handlePointerLeave}
      onFocusCapture={() => {
        if (showLiquidEffects) {
          setFocusedItemKey(itemKey)
        }
      }}
      onBlurCapture={(event) => {
        if (showLiquidEffects && !event.currentTarget.contains(event.relatedTarget)) {
          setFocusedItemKey(null)
        }
      }}
      onDragStart={() => {
        if (!showLiquidEffects) return
        setIsDragging(true)
        setFocusedItemKey(itemKey)
      }}
      onDragEnd={() => {
        setIsDragging(false)
        resetFluidTransform()
      }}
    >
      {showLiquidEffects ? (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute rounded-[1.55rem] border border-transparent bg-[radial-gradient(circle_at_var(--dock-item-pointer-x)_var(--dock-item-pointer-y),var(--glass-highlight),color-mix(in_srgb,var(--glass-highlight)_34%,transparent)_36%,transparent_65%),linear-gradient(135deg,color-mix(in_srgb,var(--glass-highlight)_28%,transparent),transparent)] opacity-[var(--dock-item-glow-opacity)] shadow-[inset_0_1px_0_var(--glass-highlight)] backdrop-blur-md transition-[opacity,border-color] duration-150 group-hover/mobile-dock-item:border-[color:var(--glass-border)]"
          style={{ filter: `url(#${refractionId})` }}
          animate={{ top: liquidInset, right: liquidInset, bottom: liquidInset, left: liquidInset }}
          transition={SIDEBAR_FLUID_TRANSITION}
        />
      ) : null}

      {active && !showLiquidEffects ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[1.55rem] border border-[color:var(--glass-border)] bg-sidebar-accent shadow-sm"
        >
          <span className="pointer-events-none absolute inset-x-3 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--glass-highlight),transparent)] opacity-70" />
        </span>
      ) : null}

      {showLiquidEffects && (active || isHovered || isDragging) ? (
        <motion.span
          layoutId={active && canAnimate ? `${scopeId}-mobile-active-dock-item` : undefined}
          aria-hidden="true"
          className="pointer-events-none absolute overflow-hidden rounded-[1.55rem] border border-[color:var(--glass-border)] bg-[radial-gradient(circle_at_var(--dock-item-pointer-x)_var(--dock-item-pointer-y),var(--glass-highlight),transparent_36%),linear-gradient(135deg,var(--sidebar-accent),var(--glass-background)_52%,color-mix(in_srgb,var(--accent)_28%,transparent))] shadow-[0_18px_44px_color-mix(in_srgb,var(--accent)_22%,transparent),0_8px_22px_color-mix(in_srgb,var(--foreground)_15%,transparent),inset_0_1px_0_var(--glass-highlight)] backdrop-blur-xl backdrop-saturate-200"
          style={{ filter: `url(#${refractionId})` }}
          initial={
            canAnimate ? { opacity: 0, scale: 0.76, top: 0, right: 0, bottom: 0, left: 0 } : false
          }
          animate={{
            opacity: isDragging ? 0.96 : active ? 0.82 : 0.58,
            scale: isDragging ? 1.08 : 1,
            top: liquidInset,
            right: liquidInset,
            bottom: liquidInset,
            left: liquidInset,
          }}
          exit={{ opacity: 0, scale: 0.9, top: 0, right: 0, bottom: 0, left: 0 }}
          transition={SIDEBAR_FLUID_TRANSITION}
        >
          <span className="pointer-events-none absolute inset-x-2 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--glass-highlight),transparent)]" />
          <span
            className="pointer-events-none absolute inset-0 [filter:var(--mobile-dock-goo-filter)]"
            style={{ '--mobile-dock-goo-filter': `url(#${filterId})` } as CSSProperties}
          >
            <motion.span
              className="absolute -left-5 top-1/2 size-16 -translate-y-1/2 rounded-full bg-[color-mix(in_srgb,var(--accent)_30%,transparent)]"
              animate={canAnimate ? { x: [0, 8, -3, 0], scale: [1, 1.22, 0.94, 1] } : undefined}
              transition={
                canAnimate ? { duration: 2.7, repeat: Infinity, ease: 'easeInOut' } : undefined
              }
            />
            <motion.span
              className="absolute left-[var(--dock-item-pointer-x)] top-[var(--dock-item-pointer-y)] size-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[color-mix(in_srgb,var(--glass-highlight)_48%,transparent)]"
              animate={canAnimate ? { scale: [0.72, 1.34, 0.9] } : undefined}
              transition={
                canAnimate ? { duration: 0.95, repeat: Infinity, ease: 'easeInOut' } : undefined
              }
            />
            <motion.span
              className="absolute -right-5 bottom-0 size-16 rounded-full bg-[color-mix(in_srgb,var(--primary)_30%,transparent)]"
              animate={canAnimate ? { x: [0, -7, 3, 0], scale: [1, 0.9, 1.16, 1] } : undefined}
              transition={
                canAnimate ? { duration: 2.9, repeat: Infinity, ease: 'easeInOut' } : undefined
              }
            />
          </span>
        </motion.span>
      ) : null}

      <Link
        to={item.to}
        params={item.params}
        search={item.search}
        aria-current={active ? 'page' : undefined}
        aria-disabled={item.disabled || undefined}
        tabIndex={item.disabled ? -1 : undefined}
        className={cn(
          'relative z-10 flex min-h-[4.25rem] min-w-0 flex-col items-center justify-center gap-1 rounded-[1.55rem] px-1.5 py-2 text-[0.67rem] font-semibold leading-none outline-none transition-colors',
          'focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
          active
            ? 'text-sidebar-accent-foreground'
            : 'text-sidebar-foreground hover:text-sidebar-accent-foreground',
          item.disabled && 'pointer-events-none opacity-45',
        )}
        onClick={(event) => {
          if (item.disabled) {
            event.preventDefault()
            event.stopPropagation()
          }
        }}
      >
        <span className="relative grid size-5 place-items-center [&_svg]:size-full">
          {item.icon}
          {item.badge ? (
            <span className="absolute -right-2 -top-2 rounded-full bg-sidebar-primary px-1.5 py-0.5 text-[0.55rem] font-bold leading-none text-sidebar-primary-foreground shadow-sm">
              {item.badge}
            </span>
          ) : null}
        </span>
        <span className="max-w-full truncate">{item.shortLabel ?? item.label}</span>
      </Link>
    </motion.div>
  )
}
