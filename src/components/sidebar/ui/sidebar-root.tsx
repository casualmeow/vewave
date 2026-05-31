import { motion, useReducedMotion } from 'motion/react'
import { useId, useMemo, useState } from 'react'

import {
  SIDEBAR_FLUID_TRANSITION,
  SIDEBAR_INITIAL_STYLE,
  SIDEBAR_SOFT_TRANSITION,
  sidebarRootVariants,
} from '../constants'
import {
  useFinePointer,
  useFluidTransform,
  useRafCssVariables,
  useResolvedFluidConfig,
} from '../hooks'
import { getPointerProgress } from '../helpers'
import { SidebarProvider } from '../providers'
import { SidebarSurfaceEffects } from './sidebar-surface-effects'
import type { SidebarRootProps } from '../types'
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import { cn } from '@/shared/lib/utils'

type SidebarStyle = CSSProperties & Record<`--${string}`, string | number>

export function SidebarRoot({
  ref,
  design = 'liquidGlass',
  size = 'md',
  density = 'comfortable',
  collapsed = false,
  motion: motionPreset = 'fluid',
  fluidPreset = 'expressive',
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
  onPointerLeave,
  onPointerMove,
  style,
  ...props
}: SidebarRootProps) {
  const prefersReducedMotion = useReducedMotion()
  const finePointer = useFinePointer()
  const canAnimate = motionPreset !== 'none' && !prefersReducedMotion
  const interactiveGlass = design === 'liquidGlass' && canAnimate && finePointer
  const scopeId = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const filterIds = useMemo(
    () => ({
      goo: `${scopeId}-sidebar-goo`,
      gooStrong: `${scopeId}-sidebar-goo-strong`,
      refraction: `${scopeId}-sidebar-refraction`,
    }),
    [scopeId],
  )
  const motionTransition =
    motionPreset === 'fluid' ? SIDEBAR_FLUID_TRANSITION : SIDEBAR_SOFT_TRANSITION
  const [focusedItemKey, setFocusedItemKey] = useState<string | null>(null)
  const setCssVariables = useRafCssVariables()

  const fluidConfig = useResolvedFluidConfig({
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
  const { fluidTransformStyle, updateFluidTransform, resetFluidTransform } = useFluidTransform({
    enabled: interactiveGlass,
    magneticStrength: 0,
    magneticVerticalStrength: 0,
    tiltStrength: 1.25,
    perspective: 1200,
    tiltSpring: { stiffness: 180, damping: 26, mass: 0.7 },
  })

  const sidebarStyle = {
    ...SIDEBAR_INITIAL_STYLE,
    '--sidebar-focus-blur': `${fluidConfig.focusBlurAmount}px`,
    '--sidebar-focus-opacity': fluidConfig.focusDimOpacity,
    '--sidebar-hover-size': `${fluidConfig.hoverSize}px`,
    '--sidebar-liquid-intensity': fluidConfig.liquidIntensity,
    ...style,
  } satisfies SidebarStyle

  const contextValue = useMemo(
    () => ({
      scopeId,
      filterIds,
      design,
      size,
      density,
      collapsed,
      motion: motionPreset,
      interactiveGlass,
      fluidPreset,
      fluidConfig,
      focusedItemKey,
      setFocusedItemKey,
    }),
    [
      collapsed,
      density,
      design,
      fluidConfig,
      fluidPreset,
      focusedItemKey,
      interactiveGlass,
      motionPreset,
      scopeId,
      filterIds,
      size,
    ],
  )

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    onPointerMove?.(event)

    if (!interactiveGlass) return

    const progress = getPointerProgress({
      clientX: event.clientX,
      clientY: event.clientY,
      rect: event.currentTarget.getBoundingClientRect(),
    })

    setCssVariables(event.currentTarget, {
      '--sidebar-pointer-x': `${progress.localX}px`,
      '--sidebar-pointer-y': `${progress.localY}px`,
      '--sidebar-glass-sheen-x': `${progress.percentX}%`,
      '--sidebar-glass-sheen-y': `${progress.percentY}%`,
      '--sidebar-glass-spot-opacity': '0.72',
    })

    updateFluidTransform(progress.normalizedX, progress.normalizedY)
  }

  const handlePointerLeave = (event: ReactPointerEvent<HTMLElement>) => {
    onPointerLeave?.(event)

    if (!interactiveGlass) return

    setCssVariables(event.currentTarget, {
      '--sidebar-pointer-x': '50%',
      '--sidebar-pointer-y': '8%',
      '--sidebar-glass-sheen-x': '18%',
      '--sidebar-glass-sheen-y': '8%',
      '--sidebar-glass-spot-opacity': '0.2',
    })
    setFocusedItemKey(null)
    resetFluidTransform()
  }

  return (
    <SidebarProvider value={contextValue}>
      <motion.aside
        ref={ref}
        data-slot="liquid-sidebar"
        data-design={design}
        data-fluid-preset={fluidPreset}
        data-collapsed={collapsed ? 'true' : 'false'}
        className={cn(sidebarRootVariants({ design, size, collapsed }), className)}
        style={{
          ...sidebarStyle,
          ...fluidTransformStyle,
        }}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        {...props}
      >
        <svg aria-hidden="true" className="pointer-events-none absolute size-0" focusable="false">
          <defs>
            <filter id={filterIds.goo}>
              <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -11"
                result="goo"
              />
              <feComposite in="SourceGraphic" in2="goo" operator="atop" />
            </filter>
            <filter id={filterIds.gooStrong}>
              <feGaussianBlur in="SourceGraphic" stdDeviation="11" result="blur" />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 28 -14"
                result="goo"
              />
              <feComposite in="SourceGraphic" in2="goo" operator="atop" />
            </filter>
            <filter id={filterIds.refraction} x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.012 0.032"
                numOctaves="2"
                seed="7"
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="11"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>
        <SidebarSurfaceEffects design={design} filterIds={filterIds} />
        <motion.div
          initial={canAnimate ? { opacity: 0, x: -10, scale: 0.985 } : false}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={motionTransition}
          className="relative z-10 flex min-h-0 flex-1 flex-col"
        >
          {children}
        </motion.div>
      </motion.aside>
    </SidebarProvider>
  )
}
