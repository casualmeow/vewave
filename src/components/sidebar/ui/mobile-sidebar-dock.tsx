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
  fluidPreset = 'extreme',
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
  dockDragMode = 'both',
  maxItems = 5,
  placement = 'container',
}: MobileSidebarDockProps) {
  const prefersReducedMotion = useReducedMotion()
  const finePointer = useFinePointer()
  const canAnimate = !prefersReducedMotion
  const canTrackPointer = canAnimate && finePointer
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
    setCssVariables(event.currentTarget, {
      '--mobile-dock-pointer-x': '50%',
      '--mobile-dock-pointer-y': '50%',
      '--mobile-dock-sheen-x': '22%',
      '--mobile-dock-sheen-y': '12%',
      '--mobile-dock-glow-opacity': '0.28',
    })
    setFocusedItemKey(null)
    resetFluidTransform()
  }

  return (
    <motion.div
      aria-label={ariaLabel}
      data-slot="liquid-mobile-sidebar-dock"
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
        className="pointer-events-auto relative mx-auto max-w-[27rem] overflow-visible rounded-[2.05rem] border border-white/55 bg-[linear-gradient(135deg,rgba(255,255,255,0.64),rgba(255,255,255,0.22)_42%,rgba(226,252,247,0.38))] p-2 shadow-[0_24px_80px_rgba(15,23,42,0.30),0_10px_34px_rgba(20,184,166,0.16),inset_0_1px_0_rgba(255,255,255,0.92),inset_0_-1px_0_rgba(255,255,255,0.34)] backdrop-blur-3xl backdrop-saturate-200 [--mobile-dock-glow-opacity:0.28] [--mobile-dock-pointer-x:50%] [--mobile-dock-pointer-y:50%] [--mobile-dock-sheen-x:22%] [--mobile-dock-sheen-y:12%] supports-[backdrop-filter]:bg-white/24"
        style={{
          ...fluidTransformStyle,
        }}
        drag={canAnimate ? toMotionDragMode(dockDragMode) : false}
        dragConstraints={{ left: -18, right: 18, top: -10, bottom: 10 }}
        dragElastic={0.32}
        dragMomentum={false}
        dragSnapToOrigin
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <svg aria-hidden="true" className="pointer-events-none absolute size-0" focusable="false">
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
          className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_var(--mobile-dock-pointer-x)_var(--mobile-dock-pointer-y),rgba(255,255,255,0.9),transparent_36%),linear-gradient(120deg,transparent,rgba(255,255,255,0.34)_var(--mobile-dock-sheen-x),transparent)] opacity-[var(--mobile-dock-glow-opacity)]"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
          style={{ filter: `url(#${scopeId}-mobile-dock-refraction)` }}
        >
          <span className="absolute -left-8 top-1/2 size-24 -translate-y-1/2 rounded-full bg-teal-100/18 blur-xl" />
          <span className="absolute -right-8 bottom-0 size-24 rounded-full bg-sky-100/18 blur-xl" />
        </span>

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
  canTrackPointer,
  effectiveFocusedItemKey,
  setFocusedItemKey,
}: MobileSidebarDockButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const hasFocusedSibling = Boolean(
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
  const liquidInset = isDragging
    ? -config.hoverSize * 1.35
    : isHovered
      ? -config.hoverSize
      : active
        ? -Math.max(3, config.hoverSize * 0.34)
        : 0

  const itemStyle = {
    '--dock-item-pointer-x': '50%',
    '--dock-item-pointer-y': '50%',
    '--dock-item-glow-opacity': isHovered || isDragging ? 1 : active ? 0.62 : 0,
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
    setCssVariables(event.currentTarget, {
      '--dock-item-pointer-x': '50%',
      '--dock-item-pointer-y': '50%',
      '--dock-item-glow-opacity': active ? '0.62' : '0',
    })
    setFocusedItemKey(null)
    resetFluidTransform()
  }

  return (
    <motion.div
      data-slot="liquid-mobile-sidebar-dock-item-shell"
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
      drag={canAnimate && !item.disabled ? toMotionDragMode(config.dragMode) : false}
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
      whileDrag={canAnimate && !item.disabled ? { scale: config.dragScale, zIndex: 50 } : undefined}
      transition={SIDEBAR_FLUID_TRANSITION}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => {
        if (item.disabled) return
        setIsHovered(true)
        setFocusedItemKey(itemKey)
      }}
      onPointerLeave={handlePointerLeave}
      onFocusCapture={() => setFocusedItemKey(itemKey)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setFocusedItemKey(null)
        }
      }}
      onDragStart={() => {
        setIsDragging(true)
        setFocusedItemKey(itemKey)
      }}
      onDragEnd={() => {
        setIsDragging(false)
        resetFluidTransform()
      }}
    >
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute rounded-[1.55rem] border border-white/0 bg-[radial-gradient(circle_at_var(--dock-item-pointer-x)_var(--dock-item-pointer-y),rgba(255,255,255,0.82),rgba(255,255,255,0.22)_36%,transparent_65%),linear-gradient(135deg,rgba(255,255,255,0.24),rgba(255,255,255,0.06))] opacity-[var(--dock-item-glow-opacity)] shadow-[inset_0_1px_0_rgba(255,255,255,0.64)] backdrop-blur-md transition-[opacity,border-color] duration-150 group-hover/mobile-dock-item:border-white/45"
        style={{ filter: `url(#${refractionId})` }}
        animate={{ top: liquidInset, right: liquidInset, bottom: liquidInset, left: liquidInset }}
        transition={SIDEBAR_FLUID_TRANSITION}
      />

      {active || isHovered || isDragging ? (
        <motion.span
          layoutId={active && canAnimate ? `${scopeId}-mobile-active-dock-item` : undefined}
          aria-hidden="true"
          className="pointer-events-none absolute overflow-hidden rounded-[1.55rem] border border-white/70 bg-[radial-gradient(circle_at_var(--dock-item-pointer-x)_var(--dock-item-pointer-y),rgba(255,255,255,1),transparent_36%),linear-gradient(135deg,rgba(255,255,255,0.78),rgba(255,255,255,0.22)_52%,rgba(153,246,228,0.40))] shadow-[0_18px_44px_rgba(20,184,166,0.22),0_8px_22px_rgba(15,23,42,0.15),inset_0_1px_0_rgba(255,255,255,0.98),inset_0_-1px_0_rgba(255,255,255,0.34)] backdrop-blur-xl backdrop-saturate-200"
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
          <span className="pointer-events-none absolute inset-x-2 top-0 h-px bg-gradient-to-r from-transparent via-white/95 to-transparent" />
          <span
            className="pointer-events-none absolute inset-0 [filter:var(--mobile-dock-goo-filter)]"
            style={{ '--mobile-dock-goo-filter': `url(#${filterId})` } as CSSProperties}
          >
            <motion.span
              className="absolute -left-5 top-1/2 size-16 -translate-y-1/2 rounded-full bg-teal-100/36"
              animate={canAnimate ? { x: [0, 8, -3, 0], scale: [1, 1.22, 0.94, 1] } : undefined}
              transition={
                canAnimate ? { duration: 2.7, repeat: Infinity, ease: 'easeInOut' } : undefined
              }
            />
            <motion.span
              className="absolute left-[var(--dock-item-pointer-x)] top-[var(--dock-item-pointer-y)] size-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/48"
              animate={canAnimate ? { scale: [0.72, 1.34, 0.9] } : undefined}
              transition={
                canAnimate ? { duration: 0.95, repeat: Infinity, ease: 'easeInOut' } : undefined
              }
            />
            <motion.span
              className="absolute -right-5 bottom-0 size-16 rounded-full bg-sky-100/34"
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
          'focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
          active ? 'text-zinc-950' : 'text-zinc-700 hover:text-zinc-950',
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
            <span className="absolute -right-2 -top-2 rounded-full bg-zinc-950 px-1.5 py-0.5 text-[0.55rem] font-bold leading-none text-white shadow-sm">
              {item.badge}
            </span>
          ) : null}
        </span>
        <span className="max-w-full truncate">{item.shortLabel ?? item.label}</span>
      </Link>
    </motion.div>
  )
}
