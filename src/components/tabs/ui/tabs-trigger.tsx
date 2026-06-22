import * as TabsPrimitive from '@radix-ui/react-tabs'
import { motion } from 'motion/react'
import { useState } from 'react'
import { tabsActiveIndicatorVariants, tabsTriggerVariants } from '../constants'
import { useTabsContext } from '../hooks'
import type {
  CSSProperties,
  FocusEvent as ReactFocusEvent,
  PointerEvent as ReactPointerEvent,
} from 'react'
import type { TabsTriggerProps } from '../types'
import {
  GLASS_FLUID_TRANSITION,
  GLASS_SOFT_TRANSITION,
  getPointerProgress,
  toMotionDragMode,
  useFluidTransform,
  useRafCssVariables,
} from '@/components/glass'
import { cn } from '@/shared/lib/utils'

type TriggerShellStyle = CSSProperties & Record<`--${string}`, string | number>

export function TabsTrigger({
  ref,
  className,
  value,
  icon,
  badge,
  disabled,
  children,
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
  asChild,
  ...props
}: TabsTriggerProps) {
  const {
    scopeId,
    filterIds,
    design,
    size,
    fullWidth,
    motion: motionPreset,
    interactiveGlass,
    fluidConfig,
    activeValue,
    focusedValue,
    setFocusedValue,
  } = useTabsContext()
  const active = activeValue === value
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const setCssVariables = useRafCssVariables()
  const canAnimate = motionPreset !== 'none'
  const canFluid = interactiveGlass && design !== 'solid' && !disabled
  const transition = motionPreset === 'fluid' ? GLASS_FLUID_TRANSITION : GLASS_SOFT_TRANSITION

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
  const hasFocusedSibling = Boolean(
    resolvedFocusBlur && focusedValue && focusedValue !== value && canAnimate,
  )

  const { fluidTransformStyle, updateFluidTransform, resetFluidTransform } = useFluidTransform({
    enabled: canFluid,
    magneticStrength: resolvedMagneticStrength,
    magneticVerticalStrength: resolvedMagneticVerticalStrength,
    tiltStrength: resolvedTiltStrength,
    perspective: 900,
  })

  const liquidInset = isDragging
    ? -resolvedHoverSize * 1.28
    : isHovered
      ? -resolvedHoverSize
      : active
        ? -Math.max(2, resolvedHoverSize * 0.25)
        : 0

  const triggerStyle = {
    '--tab-pointer-x': '50%',
    '--tab-pointer-y': '50%',
    '--tab-glow-opacity': isHovered || isDragging ? 1 : active ? 0.58 : 0,
    '--tab-liquid-intensity': resolvedLiquidIntensity,
    ...fluidTransformStyle,
  } satisfies TriggerShellStyle

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!canFluid) return

    const progress = getPointerProgress({
      clientX: event.clientX,
      clientY: event.clientY,
      rect: event.currentTarget.getBoundingClientRect(),
    })

    setCssVariables(event.currentTarget, {
      '--tab-pointer-x': `${progress.percentX}%`,
      '--tab-pointer-y': `${progress.percentY}%`,
      '--tab-glow-opacity': '1',
    })

    updateFluidTransform(progress.normalizedX, progress.normalizedY)
  }

  const handlePointerLeave = (event: ReactPointerEvent<HTMLDivElement>) => {
    setIsHovered(false)
    setIsDragging(false)
    setCssVariables(event.currentTarget, {
      '--tab-pointer-x': '50%',
      '--tab-pointer-y': '50%',
      '--tab-glow-opacity': active ? '0.58' : '0',
    })
    setFocusedValue(null)
    resetFluidTransform()
  }

  const content = asChild ? (
    children
  ) : (
    <>
      {icon ? <span className="shrink-0">{icon}</span> : null}
      <span className="truncate">{children}</span>
      {badge ? (
        <span className="ml-0.5 rounded-full bg-primary px-1.5 py-0.5 text-[0.65rem] font-semibold leading-none text-primary-foreground shadow-[inset_0_1px_0_var(--glass-highlight)]">
          {badge}
        </span>
      ) : null}
    </>
  )

  return (
    <motion.div
      data-slot="liquid-tabs-trigger-shell"
      data-focused={focusedValue === value ? 'true' : 'false'}
      data-deemphasized={hasFocusedSibling ? 'true' : 'false'}
      className="group/tabs-trigger relative isolate min-w-0 [--tab-glow-opacity:0] [--tab-pointer-x:50%] [--tab-pointer-y:50%]"
      style={triggerStyle}
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
        top: -Math.max(4, resolvedHoverSize * 0.55),
        bottom: Math.max(4, resolvedHoverSize * 0.55),
      }}
      dragElastic={0.38}
      dragMomentum={false}
      dragSnapToOrigin
      whileHover={
        canAnimate && !disabled
          ? { scale: active ? resolvedActiveHoverScale : resolvedHoverScale }
          : undefined
      }
      whileTap={canAnimate && !disabled ? { scale: 0.96 } : undefined}
      whileDrag={canAnimate && !disabled ? { scale: resolvedDragScale, zIndex: 50 } : undefined}
      transition={transition}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => {
        if (!canFluid) return
        setIsHovered(true)
        setFocusedValue(value)
      }}
      onPointerLeave={handlePointerLeave}
      onFocusCapture={() => setFocusedValue(value)}
      onBlurCapture={(event: ReactFocusEvent<HTMLDivElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setFocusedValue(null)
        }
      }}
      onDragStart={() => {
        setIsDragging(true)
        setFocusedValue(value)
      }}
      onDragEnd={() => {
        setIsDragging(false)
        resetFluidTransform()
      }}
    >
      {design !== 'solid' ? (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full border border-transparent bg-[radial-gradient(circle_at_var(--tab-pointer-x)_var(--tab-pointer-y),var(--glass-highlight),color-mix(in_srgb,var(--glass-highlight)_34%,transparent)_35%,transparent_64%),linear-gradient(135deg,color-mix(in_srgb,var(--glass-highlight)_28%,transparent),transparent)] opacity-[var(--tab-glow-opacity)] shadow-[inset_0_1px_0_var(--glass-highlight)] backdrop-blur-sm transition-[opacity,border-color] duration-150 group-hover/tabs-trigger:border-[color:var(--glass-border)]"
          style={{ filter: canFluid ? `url(#${filterIds.refraction})` : undefined }}
          animate={{ top: liquidInset, right: liquidInset, bottom: liquidInset, left: liquidInset }}
          transition={GLASS_FLUID_TRANSITION}
        />
      ) : null}

      {active ? (
        <motion.span
          layoutId={canAnimate ? `${scopeId}-active-tab` : undefined}
          aria-hidden="true"
          className={tabsActiveIndicatorVariants({ design })}
          style={design !== 'solid' ? { filter: `url(#${filterIds.refraction})` } : undefined}
          initial={canAnimate ? { opacity: 0, scale: 0.84 } : false}
          animate={{
            opacity: isDragging ? 0.96 : 1,
            scale: isDragging ? 1.05 : 1,
            top: liquidInset,
            right: liquidInset,
            bottom: liquidInset,
            left: liquidInset,
          }}
          transition={transition}
        >
          {design === 'liquidGlass' ? (
            <span
              className="pointer-events-none absolute inset-0 [filter:var(--tabs-goo-filter)]"
              style={{ '--tabs-goo-filter': `url(#${filterIds.goo})` } as CSSProperties}
            >
              <span className="absolute -left-5 top-1/2 size-14 -translate-y-1/2 rounded-full bg-[color-mix(in_srgb,var(--accent)_30%,transparent)]" />
              <span className="absolute left-[var(--tab-pointer-x)] top-[var(--tab-pointer-y)] size-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[color-mix(in_srgb,var(--glass-highlight)_42%,transparent)]" />
              <span className="absolute -right-5 bottom-0 size-14 rounded-full bg-[color-mix(in_srgb,var(--primary)_28%,transparent)]" />
            </span>
          ) : null}
        </motion.span>
      ) : null}

      <TabsPrimitive.Trigger
        ref={ref}
        data-slot="liquid-tabs-trigger"
        data-active={active ? 'true' : 'false'}
        value={value}
        disabled={disabled}
        asChild={asChild}
        className={cn(tabsTriggerVariants({ design, size, fullWidth }), className)}
        {...props}
      >
        {content}
      </TabsPrimitive.Trigger>
    </motion.div>
  )
}
