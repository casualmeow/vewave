import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useState } from 'react'
import { SIDEBAR_FLUID_TRANSITION } from '../constants'
import { useFluidTransform, useRafCssVariables } from '../hooks'
import { getPointerProgress, toMotionDragMode } from '../helpers'
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import type { MotionStyle } from 'motion/react'
import type { SidebarResolvedFluidConfig } from '../types'
import type { MobileSidebarDockItem } from './mobile-sidebar-dock'
import { cn } from '@/shared/lib/utils'

type MobileDockStyle = MotionStyle & Record<`--${string}`, string | number>

interface MobileSidebarDockItemProps {
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

export function MobileSidebarDockButton({
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
}: MobileSidebarDockItemProps) {
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
