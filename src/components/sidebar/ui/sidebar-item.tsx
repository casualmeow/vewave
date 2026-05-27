import { Slot } from '@radix-ui/react-slot'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react'
import { useEffect, useId, useState } from 'react'
import {
  SIDEBAR_FLUID_TRANSITION,
  SIDEBAR_MAGNETIC_TRANSITION,
  SIDEBAR_SOFT_TRANSITION,
  sidebarActiveIndicatorVariants,
  sidebarBadgeVariants,
  sidebarItemVariants,
} from '../constants'
import { useSidebarContext } from './sidebar-context'
import type { MotionStyle } from 'motion/react'
import type { FocusEvent as ReactFocusEvent, PointerEvent as ReactPointerEvent, Ref } from 'react'
import type { SidebarDragMode, SidebarItemPartProps, SidebarItemProps } from '../types'
import { cn } from '@/shared/lib/utils'

type ItemShellStyle = MotionStyle & Record<`--${string}`, string | number>

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function toMotionDragMode(mode: SidebarDragMode) {
  if (mode === 'none') return false
  if (mode === 'both') return true
  return mode
}

export function SidebarItem({
  ref,
  asChild = false,
  icon,
  badge,
  href,
  target,
  rel,
  type = 'button',
  value,
  active = false,
  disabled = false,
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
  className,
  children,
  onFocusCapture,
  onBlurCapture,
  ...props
}: SidebarItemProps) {
  const {
    scopeId,
    design,
    size,
    collapsed,
    motion: motionPreset,
    interactiveGlass,
    fluidConfig,
    focusedItemKey,
    setFocusedItemKey,
    activeItemKey,
    setActiveItemKey,
  } = useSidebarContext()
  const generatedId = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const itemKey = value ?? href ?? generatedId

  useEffect(() => {
    if (!active) return

    setActiveItemKey(itemKey)

    return () => {
      setActiveItemKey((current) => (current === itemKey ? null : current))
    }
  }, [active, itemKey, setActiveItemKey])

  const prefersReducedMotion = useReducedMotion()
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const canAnimate = motionPreset !== 'none' && !prefersReducedMotion
  const canFluid = interactiveGlass && !disabled
  const transition = motionPreset === 'fluid' ? SIDEBAR_FLUID_TRANSITION : SIDEBAR_SOFT_TRANSITION

  const resolvedHoverScale = hoverScale ?? fluidConfig.hoverScale
  const resolvedActiveHoverScale = activeHoverScale ?? fluidConfig.activeHoverScale
  const resolvedDragScale = dragScale ?? fluidConfig.dragScale
  const resolvedHoverSize = hoverSize ?? fluidConfig.hoverSize
  const resolvedMagneticStrength = magneticStrength ?? fluidConfig.magneticStrength
  const resolvedMagneticVerticalStrength =
    magneticVerticalStrength ?? fluidConfig.magneticVerticalStrength
  const resolvedTiltStrength = tiltStrength ?? fluidConfig.tiltStrength
  const resolvedFocusBlur = focusBlur ?? fluidConfig.focusBlur
  const resolvedFocusBlurAmount = focusBlurAmount ?? fluidConfig.focusBlurAmount
  const resolvedFocusDimOpacity = focusDimOpacity ?? fluidConfig.focusDimOpacity
  const resolvedLiquidIntensity = liquidIntensity ?? fluidConfig.liquidIntensity
  const resolvedDragMode = dragMode ?? fluidConfig.dragMode
  const effectiveFocusedItemKey = focusedItemKey ?? activeItemKey
  const hasFocusedSibling = Boolean(
    resolvedFocusBlur &&
      effectiveFocusedItemKey &&
      effectiveFocusedItemKey !== itemKey &&
      canAnimate,
  )

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const tiltX = useMotionValue(0)
  const tiltY = useMotionValue(0)
  const springX = useSpring(x, SIDEBAR_MAGNETIC_TRANSITION)
  const springY = useSpring(y, SIDEBAR_MAGNETIC_TRANSITION)
  const springTiltX = useSpring(tiltX, { stiffness: 420, damping: 34, mass: 0.62 })
  const springTiltY = useSpring(tiltY, { stiffness: 420, damping: 34, mass: 0.62 })
  const rotateX = useTransform(
    springTiltY,
    [-1, 1],
    [`${resolvedTiltStrength}deg`, `${-resolvedTiltStrength}deg`],
  )
  const rotateY = useTransform(
    springTiltX,
    [-1, 1],
    [`${-resolvedTiltStrength}deg`, `${resolvedTiltStrength}deg`],
  )

  const liquidInset = isDragging
    ? -resolvedHoverSize * 1.45
    : isHovered
      ? -resolvedHoverSize
      : active
        ? -Math.max(2, resolvedHoverSize * 0.25)
        : 0

  const itemStyle = {
    '--item-pointer-glow': isHovered || isDragging ? 1 : 0,
    '--item-pointer-x': '50%',
    '--item-pointer-y': '50%',
    '--item-hover-size': `${resolvedHoverSize}px`,
    '--item-liquid-intensity': resolvedLiquidIntensity,
    x: canFluid ? springX : undefined,
    y: canFluid ? springY : undefined,
    rotateX: canFluid ? rotateX : undefined,
    rotateY: canFluid ? rotateY : undefined,
    transformPerspective: canFluid ? 900 : undefined,
    transformStyle: canFluid ? 'preserve-3d' : undefined,
  } satisfies ItemShellStyle

  const resetMotion = () => {
    x.set(0)
    y.set(0)
    tiltX.set(0)
    tiltY.set(0)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!canFluid) return

    const rect = event.currentTarget.getBoundingClientRect()
    const localX = event.clientX - rect.left
    const localY = event.clientY - rect.top
    const percentX = clamp((localX / rect.width) * 100, 0, 100)
    const percentY = clamp((localY / rect.height) * 100, 0, 100)
    const normalizedX = (percentX / 100 - 0.5) * 2
    const normalizedY = (percentY / 100 - 0.5) * 2

    event.currentTarget.style.setProperty('--item-pointer-x', `${percentX}%`)
    event.currentTarget.style.setProperty('--item-pointer-y', `${percentY}%`)
    event.currentTarget.style.setProperty('--item-pointer-glow', '1')

    x.set(normalizedX * resolvedMagneticStrength)
    y.set(normalizedY * resolvedMagneticVerticalStrength)
    tiltX.set(normalizedX)
    tiltY.set(normalizedY)
  }

  const handlePointerEnter = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (canFluid) {
      setIsHovered(true)
      setFocusedItemKey(itemKey)
      event.currentTarget.style.setProperty('--item-pointer-glow', '1')
    }
  }

  const handlePointerLeave = (event: ReactPointerEvent<HTMLDivElement>) => {
    setIsHovered(false)
    setIsDragging(false)
    event.currentTarget.style.setProperty('--item-pointer-x', '50%')
    event.currentTarget.style.setProperty('--item-pointer-y', '50%')
    event.currentTarget.style.setProperty('--item-pointer-glow', '0')
    setFocusedItemKey(null)
    resetMotion()
  }

  const handleFocusCapture = (event: ReactFocusEvent<HTMLDivElement>) => {
    setFocusedItemKey(itemKey)
    onFocusCapture?.(event)
  }

  const handleBlurCapture = (event: ReactFocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setFocusedItemKey(null)
    }

    onBlurCapture?.(event)
  }

  const sharedProps = {
    'data-slot': 'liquid-sidebar-item',
    'data-active': active ? 'true' : 'false',
    'aria-current': active ? ('page' as const) : undefined,
    'aria-disabled': disabled || undefined,
    className: cn(sidebarItemVariants({ design, size, collapsed }), className),
    ...props,
  }

  const itemContent = asChild ? (
    children
  ) : (
    <>
      {icon ? <SidebarItemIcon>{icon}</SidebarItemIcon> : null}
      <SidebarItemLabel>{children}</SidebarItemLabel>
      {badge ? <SidebarItemBadge>{badge}</SidebarItemBadge> : null}
    </>
  )

  return (
    <motion.div
      data-slot="liquid-sidebar-item-shell"
      data-focused={effectiveFocusedItemKey === itemKey ? 'true' : 'false'}
      data-deemphasized={hasFocusedSibling ? 'true' : 'false'}
      className="group/sidebar-item-shell relative isolate [--item-pointer-glow:0] [--item-pointer-x:50%] [--item-pointer-y:50%]"
      style={itemStyle}
      animate={
        canAnimate
          ? {
              filter: hasFocusedSibling
                ? `blur(${resolvedFocusBlurAmount}px) saturate(0.76) contrast(0.92)`
                : 'blur(0px) saturate(1) contrast(1)',
              opacity: hasFocusedSibling ? resolvedFocusDimOpacity : 1,
            }
          : undefined
      }
      drag={canFluid ? toMotionDragMode(resolvedDragMode) : false}
      dragConstraints={{
        left: -resolvedHoverSize,
        right: resolvedHoverSize,
        top: -Math.max(6, resolvedHoverSize * 0.65),
        bottom: Math.max(6, resolvedHoverSize * 0.65),
      }}
      dragElastic={0.42}
      dragMomentum={false}
      dragSnapToOrigin
      whileHover={
        canAnimate && !disabled
          ? { scale: active ? resolvedActiveHoverScale : resolvedHoverScale }
          : undefined
      }
      whileTap={canAnimate && !disabled ? { scale: 0.95 } : undefined}
      whileDrag={canAnimate && !disabled ? { scale: resolvedDragScale, zIndex: 50 } : undefined}
      transition={transition}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onFocusCapture={handleFocusCapture}
      onBlurCapture={handleBlurCapture}
      onDragStart={() => {
        setIsDragging(true)
        setFocusedItemKey(itemKey)
      }}
      onDragEnd={() => {
        setIsDragging(false)
        resetMotion()
      }}
    >
      {design === 'liquidGlass' ? (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute rounded-[1.6rem] border border-white/0 bg-[radial-gradient(circle_at_var(--item-pointer-x)_var(--item-pointer-y),rgba(255,255,255,0.64),rgba(255,255,255,0.14)_35%,transparent_64%),linear-gradient(135deg,rgba(255,255,255,0.22),rgba(255,255,255,0.05))] opacity-[calc(var(--item-pointer-glow)*0.95)] shadow-[inset_0_1px_0_rgba(255,255,255,0.50)] backdrop-blur-sm transition-[opacity,border-color] duration-150 group-hover/sidebar-item-shell:border-white/32"
          style={{ filter: canFluid ? 'url(#vewave-sidebar-refraction)' : undefined }}
          animate={{
            top: liquidInset,
            right: liquidInset,
            bottom: liquidInset,
            left: liquidInset,
          }}
          transition={transition}
        />
      ) : null}

      <AnimatePresence initial={false}>
        {(isHovered || isDragging) && design === 'liquidGlass' ? (
          <motion.span
            key="fluid-field"
            aria-hidden="true"
            className="pointer-events-none absolute overflow-hidden rounded-[1.7rem] border border-white/40 bg-[linear-gradient(135deg,rgba(255,255,255,0.40),rgba(255,255,255,0.10)_45%,rgba(153,246,228,0.24))] shadow-[0_20px_52px_rgba(15,23,42,0.16),inset_0_1px_0_rgba(255,255,255,0.78)] backdrop-blur-2xl"
            style={{ filter: 'url(#vewave-sidebar-refraction)' }}
            initial={{ opacity: 0, scale: 0.82, top: 0, right: 0, bottom: 0, left: 0 }}
            animate={{
              opacity: isDragging ? 0.92 : 0.62,
              scale: isDragging ? 1.04 : 1,
              top: liquidInset,
              right: liquidInset,
              bottom: liquidInset,
              left: liquidInset,
            }}
            exit={{ opacity: 0, scale: 0.9, top: 0, right: 0, bottom: 0, left: 0 }}
            transition={transition}
          >
            <span className="absolute inset-0 bg-[radial-gradient(circle_at_var(--item-pointer-x)_var(--item-pointer-y),rgba(255,255,255,0.92),transparent_42%)]" />
            <span className="absolute inset-0 [filter:url(#vewave-sidebar-goo-strong)]">
              <motion.span
                className="absolute -left-6 top-1/2 size-20 -translate-y-1/2 rounded-full bg-teal-100/35"
                animate={canAnimate ? { x: [0, 11, -4, 0], scale: [1, 1.28, 0.96, 1] } : undefined}
                transition={
                  canAnimate ? { duration: 2.6, repeat: Infinity, ease: 'easeInOut' } : undefined
                }
              />
              <motion.span
                className="absolute left-[var(--item-pointer-x)] top-[var(--item-pointer-y)] size-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/45"
                animate={canAnimate ? { scale: [0.72, 1.34, 0.9] } : undefined}
                transition={
                  canAnimate ? { duration: 0.95, repeat: Infinity, ease: 'easeInOut' } : undefined
                }
              />
              <motion.span
                className="absolute -right-7 bottom-0 size-20 rounded-full bg-sky-100/32"
                animate={canAnimate ? { x: [0, -9, 4, 0], scale: [1, 0.88, 1.2, 1] } : undefined}
                transition={
                  canAnimate ? { duration: 2.9, repeat: Infinity, ease: 'easeInOut' } : undefined
                }
              />
            </span>
          </motion.span>
        ) : null}
      </AnimatePresence>

      {active ? (
        <motion.span
          layoutId={canAnimate ? `${scopeId}-active-sidebar-item` : undefined}
          transition={transition}
          className={sidebarActiveIndicatorVariants({ design })}
          animate={{
            top: liquidInset,
            right: liquidInset,
            bottom: liquidInset,
            left: liquidInset,
          }}
        >
          <span className="pointer-events-none absolute inset-0 [filter:url(#vewave-sidebar-refraction)]" />
          <span className="pointer-events-none absolute inset-x-2 top-0 h-px bg-gradient-to-r from-transparent via-white/95 to-transparent" />
          <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_var(--item-pointer-x)_var(--item-pointer-y),rgba(255,255,255,0.90),transparent_38%)] opacity-[calc(0.35+var(--item-pointer-glow)*0.55)]" />
          <span className="pointer-events-none absolute inset-0 [filter:url(#vewave-sidebar-goo-strong)]">
            <motion.span
              className="absolute -left-4 top-1/2 size-16 -translate-y-1/2 rounded-full bg-teal-100/36"
              animate={canAnimate ? { x: [0, 8, -3, 0], scale: [1, 1.18, 0.94, 1] } : undefined}
              transition={
                canAnimate ? { duration: 3.2, repeat: Infinity, ease: 'easeInOut' } : undefined
              }
            />
            <motion.span
              className="absolute left-[var(--item-pointer-x)] top-[var(--item-pointer-y)] size-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/46"
              animate={canAnimate ? { scale: [0.76, 1.24, 0.88] } : undefined}
              transition={
                canAnimate ? { duration: 1.05, repeat: Infinity, ease: 'easeInOut' } : undefined
              }
            />
            <motion.span
              className="absolute -right-5 bottom-0 size-16 rounded-full bg-sky-100/34"
              animate={canAnimate ? { x: [0, -7, 3, 0], scale: [1, 0.88, 1.12, 1] } : undefined}
              transition={
                canAnimate ? { duration: 2.9, repeat: Infinity, ease: 'easeInOut' } : undefined
              }
            />
          </span>
        </motion.span>
      ) : null}

      {asChild ? (
        <Slot ref={ref} {...sharedProps}>
          {itemContent}
        </Slot>
      ) : href ? (
        <a
          ref={ref as Ref<HTMLAnchorElement>}
          {...sharedProps}
          href={href}
          target={target}
          rel={rel}
        >
          {itemContent}
        </a>
      ) : (
        <button
          ref={ref as Ref<HTMLButtonElement>}
          {...sharedProps}
          type={type}
          disabled={disabled}
        >
          {itemContent}
        </button>
      )}
    </motion.div>
  )
}

export function SidebarItemIcon({ ref, className, ...props }: SidebarItemPartProps) {
  return (
    <span
      ref={ref}
      className={cn(
        'relative z-10 grid size-4 shrink-0 place-items-center transition-transform duration-200 group-hover/sidebar-item-shell:scale-110 [&_svg]:size-full',
        className,
      )}
      {...props}
    />
  )
}

export function SidebarItemLabel({ ref, className, ...props }: SidebarItemPartProps) {
  const { collapsed } = useSidebarContext()

  return (
    <span
      ref={ref}
      className={cn(
        'relative z-10 min-w-0 flex-1 truncate text-left',
        collapsed && 'sr-only',
        className,
      )}
      {...props}
    />
  )
}

export function SidebarItemBadge({ ref, className, ...props }: SidebarItemPartProps) {
  const { design, collapsed } = useSidebarContext()

  if (collapsed) return null

  return (
    <span
      ref={ref}
      className={cn('relative z-10', sidebarBadgeVariants({ design }), className)}
      {...props}
    />
  )
}
