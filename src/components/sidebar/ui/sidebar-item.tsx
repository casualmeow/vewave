import { Slot } from '@radix-ui/react-slot'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useId, useState } from 'react'
import {
  SIDEBAR_FLUID_TRANSITION,
  SIDEBAR_SOFT_TRANSITION,
  sidebarActiveIndicatorVariants,
  sidebarBadgeVariants,
  sidebarItemVariants,
} from '../constants'
import { useFluidTransform, useRafCssVariables, useSidebarContext } from '../hooks'
import { getPointerProgress, toMotionDragMode } from '../helpers'
import type { MotionStyle } from 'motion/react'
import type { FocusEvent as ReactFocusEvent, PointerEvent as ReactPointerEvent, Ref } from 'react'
import type { SidebarItemPartProps, SidebarItemProps } from '../types'
import { cn } from '@/shared/lib/utils'

type ItemShellStyle = MotionStyle & Record<`--${string}`, string | number>

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
  focusGroup,
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
    filterIds,
    design,
    size,
    collapsed,
    motion: motionPreset,
    interactiveGlass,
    fluidConfig,
    focusedItemKey,
    setFocusedItemKey,
  } = useSidebarContext()
  const generatedId = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const itemKey = value ?? href ?? generatedId
  const interactionKey = focusGroup ?? itemKey

  const prefersReducedMotion = useReducedMotion()
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const setCssVariables = useRafCssVariables()
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
  const effectiveFocusedItemKey = focusedItemKey
  const hasFocusedSibling = Boolean(
    resolvedFocusBlur &&
      effectiveFocusedItemKey &&
      effectiveFocusedItemKey !== interactionKey &&
      canAnimate,
  )
  const deemphasizedOpacity = active ? 1 : resolvedFocusDimOpacity

  const { fluidTransformStyle, updateFluidTransform, resetFluidTransform } = useFluidTransform({
    enabled: canFluid,
    magneticStrength: resolvedMagneticStrength,
    magneticVerticalStrength: resolvedMagneticVerticalStrength,
    tiltStrength: resolvedTiltStrength,
    perspective: 900,
  })

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
    ...fluidTransformStyle,
  } satisfies ItemShellStyle

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!canFluid) return

    const progress = getPointerProgress({
      clientX: event.clientX,
      clientY: event.clientY,
      rect: event.currentTarget.getBoundingClientRect(),
    })

    setCssVariables(event.currentTarget, {
      '--item-pointer-x': `${progress.percentX}%`,
      '--item-pointer-y': `${progress.percentY}%`,
      '--item-pointer-glow': '1',
    })

    updateFluidTransform(progress.normalizedX, progress.normalizedY)
  }

  const handlePointerEnter = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (canFluid) {
      setIsHovered(true)
      setFocusedItemKey(interactionKey)
      setCssVariables(event.currentTarget, {
        '--item-pointer-glow': '1',
      })
    }
  }

  const handlePointerLeave = (event: ReactPointerEvent<HTMLDivElement>) => {
    setIsHovered(false)
    setIsDragging(false)
    setCssVariables(event.currentTarget, {
      '--item-pointer-x': '50%',
      '--item-pointer-y': '50%',
      '--item-pointer-glow': '0',
    })
    setFocusedItemKey(null)
    resetFluidTransform()
  }

  const handleFocusCapture = (event: ReactFocusEvent<HTMLDivElement>) => {
    setFocusedItemKey(interactionKey)
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
      data-focused={effectiveFocusedItemKey === interactionKey ? 'true' : 'false'}
      data-deemphasized={hasFocusedSibling ? 'true' : 'false'}
      className="group/sidebar-item-shell relative isolate [--item-pointer-glow:0] [--item-pointer-x:50%] [--item-pointer-y:50%]"
      style={itemStyle}
      animate={
        canAnimate
          ? {
              filter: hasFocusedSibling
                ? `blur(${resolvedFocusBlurAmount}px) saturate(0.76) contrast(0.92)`
                : 'blur(0px) saturate(1) contrast(1)',
              opacity: hasFocusedSibling ? deemphasizedOpacity : 1,
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
        setFocusedItemKey(interactionKey)
      }}
      onDragEnd={() => {
        setIsDragging(false)
        resetFluidTransform()
      }}
    >
      {design === 'liquidGlass' ? (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute rounded-[1.6rem] border border-transparent bg-[radial-gradient(circle_at_var(--item-pointer-x)_var(--item-pointer-y),var(--glass-highlight),color-mix(in_srgb,var(--glass-highlight)_34%,transparent)_35%,transparent_64%),linear-gradient(135deg,color-mix(in_srgb,var(--glass-highlight)_28%,transparent),transparent)] opacity-[calc(var(--item-pointer-glow)*0.95)] shadow-[inset_0_1px_0_var(--glass-highlight)] backdrop-blur-sm transition-[opacity,border-color] duration-150 group-hover/sidebar-item-shell:border-[color:var(--glass-border)]"
          style={{ filter: canFluid ? `url(#${filterIds.refraction})` : undefined }}
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
            className="pointer-events-none absolute overflow-hidden rounded-[1.7rem] border border-[color:var(--glass-border)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--glass-highlight)_48%,transparent),var(--glass-background)_45%,color-mix(in_srgb,var(--accent)_24%,transparent))] shadow-[0_20px_52px_color-mix(in_srgb,var(--foreground)_16%,transparent),inset_0_1px_0_var(--glass-highlight)] backdrop-blur-2xl"
            style={{ filter: `url(#${filterIds.refraction})` }}
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
            <span className="absolute inset-0 bg-[radial-gradient(circle_at_var(--item-pointer-x)_var(--item-pointer-y),var(--glass-highlight),transparent_42%)]" />
            <span className="absolute inset-0" style={{ filter: `url(#${filterIds.gooStrong})` }}>
              <motion.span
                className="absolute -left-6 top-1/2 size-20 -translate-y-1/2 rounded-full bg-[color-mix(in_srgb,var(--accent)_30%,transparent)]"
                animate={canAnimate ? { x: [0, 11, -4, 0], scale: [1, 1.28, 0.96, 1] } : undefined}
                transition={
                  canAnimate ? { duration: 2.6, repeat: Infinity, ease: 'easeInOut' } : undefined
                }
              />
              <motion.span
                className="absolute left-[var(--item-pointer-x)] top-[var(--item-pointer-y)] size-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[color-mix(in_srgb,var(--glass-highlight)_45%,transparent)]"
                animate={canAnimate ? { scale: [0.72, 1.34, 0.9] } : undefined}
                transition={
                  canAnimate ? { duration: 0.95, repeat: Infinity, ease: 'easeInOut' } : undefined
                }
              />
              <motion.span
                className="absolute -right-7 bottom-0 size-20 rounded-full bg-[color-mix(in_srgb,var(--primary)_28%,transparent)]"
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
          <span
            className="pointer-events-none absolute inset-0"
            style={{ filter: `url(#${filterIds.refraction})` }}
          />
          <span className="pointer-events-none absolute inset-x-2 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--glass-highlight),transparent)]" />
          <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_var(--item-pointer-x)_var(--item-pointer-y),var(--glass-highlight),transparent_38%)] opacity-[calc(0.35+var(--item-pointer-glow)*0.55)]" />
          <span
            className="pointer-events-none absolute inset-0"
            style={{ filter: `url(#${filterIds.gooStrong})` }}
          >
            <motion.span
              className="absolute -left-4 top-1/2 size-16 -translate-y-1/2 rounded-full bg-[color-mix(in_srgb,var(--accent)_30%,transparent)]"
              animate={canAnimate ? { x: [0, 8, -3, 0], scale: [1, 1.18, 0.94, 1] } : undefined}
              transition={
                canAnimate ? { duration: 3.2, repeat: Infinity, ease: 'easeInOut' } : undefined
              }
            />
            <motion.span
              className="absolute left-[var(--item-pointer-x)] top-[var(--item-pointer-y)] size-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[color-mix(in_srgb,var(--glass-highlight)_46%,transparent)]"
              animate={canAnimate ? { scale: [0.76, 1.24, 0.88] } : undefined}
              transition={
                canAnimate ? { duration: 1.05, repeat: Infinity, ease: 'easeInOut' } : undefined
              }
            />
            <motion.span
              className="absolute -right-5 bottom-0 size-16 rounded-full bg-[color-mix(in_srgb,var(--primary)_30%,transparent)]"
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
