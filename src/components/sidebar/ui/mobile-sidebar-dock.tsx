import { Link } from '@tanstack/react-router'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'
import { useId, useMemo, useState } from 'react'
import {
  SIDEBAR_FLUID_PRESETS,
  SIDEBAR_FLUID_TRANSITION,
  SIDEBAR_MAGNETIC_TRANSITION,
} from '../constants'
import type { MotionStyle } from 'motion/react'
import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from 'react'

import type {
  SidebarDragMode,
  SidebarFluidPreset,
  SidebarMobileDockPlacement,
  SidebarResolvedFluidConfig,
} from '../types'
import { cn } from '@/shared/lib/utils'

type MobileDockStyle = MotionStyle & Record<`--${string}`, string | number>

export type MobileSidebarDockItem = {
  label: string
  shortLabel?: string
  to: string
  params?: Record<string, string>
  icon: ReactNode
  badge?: ReactNode
  disabled?: boolean
}

export interface MobileSidebarDockProps {
  items: Array<MobileSidebarDockItem>
  pathname: string
  className?: string
  fluidPreset?: SidebarFluidPreset
  hoverScale?: number
  activeHoverScale?: number
  dragScale?: number
  hoverSize?: number
  magneticStrength?: number
  magneticVerticalStrength?: number
  tiltStrength?: number
  focusBlur?: boolean
  focusBlurAmount?: number
  focusDimOpacity?: number
  liquidIntensity?: number
  dragMode?: SidebarDragMode
  dockDragMode?: SidebarDragMode
  maxItems?: number
  placement?: SidebarMobileDockPlacement
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function toMotionDragMode(mode: SidebarDragMode) {
  if (mode === 'none') return false
  if (mode === 'both') return true
  return mode
}

function isActivePath(pathname: string, to: string) {
  return pathname === to || pathname.startsWith(`${to}/`)
}

function useResolvedFluidConfig({
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
}: Omit<MobileSidebarDockProps, 'items' | 'pathname' | 'className' | 'dockDragMode' | 'maxItems'>) {
  return useMemo<SidebarResolvedFluidConfig>(() => {
    const preset = SIDEBAR_FLUID_PRESETS[fluidPreset]

    return {
      hoverScale: hoverScale ?? preset.hoverScale,
      activeHoverScale: activeHoverScale ?? preset.activeHoverScale,
      dragScale: dragScale ?? preset.dragScale,
      hoverSize: hoverSize ?? Math.max(12, preset.hoverSize),
      magneticStrength: magneticStrength ?? preset.magneticStrength,
      magneticVerticalStrength: magneticVerticalStrength ?? preset.magneticVerticalStrength,
      tiltStrength: tiltStrength ?? preset.tiltStrength,
      focusBlur: focusBlur ?? preset.focusBlur,
      focusBlurAmount: focusBlurAmount ?? preset.focusBlurAmount,
      focusDimOpacity: focusDimOpacity ?? preset.focusDimOpacity,
      liquidIntensity: liquidIntensity ?? preset.liquidIntensity,
      dragMode: dragMode ?? preset.dragMode,
    }
  }, [
    activeHoverScale,
    dragMode,
    dragScale,
    fluidPreset,
    focusBlur,
    focusBlurAmount,
    focusDimOpacity,
    hoverScale,
    hoverSize,
    liquidIntensity,
    magneticStrength,
    magneticVerticalStrength,
    tiltStrength,
  ])
}

export function MobileSidebarDock({
  items,
  pathname,
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
  const canAnimate = !prefersReducedMotion
  const scopeId = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const [focusedItemKey, setFocusedItemKey] = useState<string | null>(null)
  const visibleItems = items.slice(0, maxItems)
  const activeItemKey = visibleItems.find((item) => isActivePath(pathname, item.to))?.to ?? null
  const effectiveFocusedItemKey = focusedItemKey ?? activeItemKey
  const config = useResolvedFluidConfig({
    fluidPreset,
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

  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const springPointerX = useSpring(pointerX, { stiffness: 180, damping: 28, mass: 0.72 })
  const springPointerY = useSpring(pointerY, { stiffness: 180, damping: 28, mass: 0.72 })
  const rotateX = useTransform(springPointerY, [-1, 1], ['1.6deg', '-1.6deg'])
  const rotateY = useTransform(springPointerX, [-1, 1], ['-1.4deg', '1.4deg'])

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!canAnimate) return

    const rect = event.currentTarget.getBoundingClientRect()
    const localX = event.clientX - rect.left
    const localY = event.clientY - rect.top
    const normalizedX = (localX / rect.width - 0.5) * 2
    const normalizedY = (localY / rect.height - 0.5) * 2

    event.currentTarget.style.setProperty('--mobile-dock-pointer-x', `${localX}px`)
    event.currentTarget.style.setProperty('--mobile-dock-pointer-y', `${localY}px`)
    event.currentTarget.style.setProperty(
      '--mobile-dock-sheen-x',
      `${clamp((localX / rect.width) * 100, 0, 100)}%`,
    )
    event.currentTarget.style.setProperty(
      '--mobile-dock-sheen-y',
      `${clamp((localY / rect.height) * 100, 0, 100)}%`,
    )
    event.currentTarget.style.setProperty('--mobile-dock-glow-opacity', '0.86')

    pointerX.set(normalizedX)
    pointerY.set(normalizedY)
  }

  const handlePointerLeave = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty('--mobile-dock-pointer-x', '50%')
    event.currentTarget.style.setProperty('--mobile-dock-pointer-y', '50%')
    event.currentTarget.style.setProperty('--mobile-dock-sheen-x', '22%')
    event.currentTarget.style.setProperty('--mobile-dock-sheen-y', '12%')
    event.currentTarget.style.setProperty('--mobile-dock-glow-opacity', '0.28')
    setFocusedItemKey(null)
    pointerX.set(0)
    pointerY.set(0)
  }

  return (
    <motion.div
      aria-label="Studio mobile navigation"
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
          rotateX: canAnimate ? rotateX : undefined,
          rotateY: canAnimate ? rotateY : undefined,
          transformPerspective: 1100,
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
          {visibleItems.map((item) => (
            <MobileSidebarDockButton
              key={item.to}
              item={item}
              active={isActivePath(pathname, item.to)}
              scopeId={scopeId}
              filterId={`${scopeId}-mobile-dock-goo`}
              refractionId={`${scopeId}-mobile-dock-refraction`}
              config={config}
              canAnimate={canAnimate}
              effectiveFocusedItemKey={effectiveFocusedItemKey}
              setFocusedItemKey={setFocusedItemKey}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

interface MobileSidebarDockButtonProps {
  item: MobileSidebarDockItem
  active: boolean
  scopeId: string
  filterId: string
  refractionId: string
  config: SidebarResolvedFluidConfig
  canAnimate: boolean
  effectiveFocusedItemKey: string | null
  setFocusedItemKey: (key: string | null) => void
}

function MobileSidebarDockButton({
  item,
  active,
  scopeId,
  filterId,
  refractionId,
  config,
  canAnimate,
  effectiveFocusedItemKey,
  setFocusedItemKey,
}: MobileSidebarDockButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const hasFocusedSibling = Boolean(
    config.focusBlur &&
      effectiveFocusedItemKey &&
      effectiveFocusedItemKey !== item.to &&
      canAnimate,
  )
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const tiltX = useMotionValue(0)
  const tiltY = useMotionValue(0)
  const springX = useSpring(x, SIDEBAR_MAGNETIC_TRANSITION)
  const springY = useSpring(y, SIDEBAR_MAGNETIC_TRANSITION)
  const springTiltX = useSpring(tiltX, { stiffness: 420, damping: 32, mass: 0.58 })
  const springTiltY = useSpring(tiltY, { stiffness: 420, damping: 32, mass: 0.58 })
  const rotateX = useTransform(
    springTiltY,
    [-1, 1],
    [`${config.tiltStrength}deg`, `${-config.tiltStrength}deg`],
  )
  const rotateY = useTransform(
    springTiltX,
    [-1, 1],
    [`${-config.tiltStrength}deg`, `${config.tiltStrength}deg`],
  )
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
    x: canAnimate ? springX : undefined,
    y: canAnimate ? springY : undefined,
    rotateX: canAnimate ? rotateX : undefined,
    rotateY: canAnimate ? rotateY : undefined,
    transformPerspective: canAnimate ? 800 : undefined,
    transformStyle: canAnimate ? 'preserve-3d' : undefined,
  } satisfies MobileDockStyle

  const resetMotion = () => {
    x.set(0)
    y.set(0)
    tiltX.set(0)
    tiltY.set(0)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!canAnimate || item.disabled) return

    const rect = event.currentTarget.getBoundingClientRect()
    const localX = event.clientX - rect.left
    const localY = event.clientY - rect.top
    const percentX = clamp((localX / rect.width) * 100, 0, 100)
    const percentY = clamp((localY / rect.height) * 100, 0, 100)
    const normalizedX = (percentX / 100 - 0.5) * 2
    const normalizedY = (percentY / 100 - 0.5) * 2

    event.currentTarget.style.setProperty('--dock-item-pointer-x', `${percentX}%`)
    event.currentTarget.style.setProperty('--dock-item-pointer-y', `${percentY}%`)
    event.currentTarget.style.setProperty('--dock-item-glow-opacity', '1')

    x.set(normalizedX * config.magneticStrength)
    y.set(normalizedY * config.magneticVerticalStrength)
    tiltX.set(normalizedX)
    tiltY.set(normalizedY)
  }

  const handlePointerLeave = (event: ReactPointerEvent<HTMLDivElement>) => {
    setIsHovered(false)
    setIsDragging(false)
    event.currentTarget.style.setProperty('--dock-item-pointer-x', '50%')
    event.currentTarget.style.setProperty('--dock-item-pointer-y', '50%')
    event.currentTarget.style.setProperty('--dock-item-glow-opacity', active ? '0.62' : '0')
    setFocusedItemKey(null)
    resetMotion()
  }

  return (
    <motion.div
      data-slot="liquid-mobile-sidebar-dock-item-shell"
      data-focused={effectiveFocusedItemKey === item.to ? 'true' : 'false'}
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
        setFocusedItemKey(item.to)
      }}
      onPointerLeave={handlePointerLeave}
      onFocusCapture={() => setFocusedItemKey(item.to)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setFocusedItemKey(null)
        }
      }}
      onDragStart={() => {
        setIsDragging(true)
        setFocusedItemKey(item.to)
      }}
      onDragEnd={() => {
        setIsDragging(false)
        resetMotion()
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
        to={item.to as never}
        params={item.params as never}
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
