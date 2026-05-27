import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'
import { useId, useMemo, useState } from 'react'

import {
  SIDEBAR_FLUID_PRESETS,
  SIDEBAR_FLUID_TRANSITION,
  SIDEBAR_INITIAL_STYLE,
  SIDEBAR_SOFT_TRANSITION,
  sidebarRootVariants,
} from '../constants'
import { SidebarProvider } from './sidebar-context'
import { SidebarSurfaceEffects } from './sidebar-surface-effects'
import type { SidebarResolvedFluidConfig, SidebarRootProps } from '../types'
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
  const canAnimate = motionPreset !== 'none' && !prefersReducedMotion
  const interactiveGlass = design === 'liquidGlass' && canAnimate
  const scopeId = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const motionTransition =
    motionPreset === 'fluid' ? SIDEBAR_FLUID_TRANSITION : SIDEBAR_SOFT_TRANSITION
  const [focusedItemKey, setFocusedItemKey] = useState<string | null>(null)

  const fluidConfig = useMemo<SidebarResolvedFluidConfig>(() => {
    const preset = SIDEBAR_FLUID_PRESETS[fluidPreset]

    return {
      hoverScale: hoverScale ?? preset.hoverScale,
      activeHoverScale: activeHoverScale ?? preset.activeHoverScale,
      dragScale: dragScale ?? preset.dragScale,
      hoverSize: hoverSize ?? preset.hoverSize,
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

  const tiltX = useMotionValue(0)
  const tiltY = useMotionValue(0)
  const springTiltX = useSpring(tiltX, { stiffness: 180, damping: 26, mass: 0.7 })
  const springTiltY = useSpring(tiltY, { stiffness: 180, damping: 26, mass: 0.7 })
  const rotateX = useTransform(springTiltY, [-1, 1], ['1.5deg', '-1.5deg'])
  const rotateY = useTransform(springTiltX, [-1, 1], ['-1.25deg', '1.25deg'])

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
      size,
    ],
  )

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    onPointerMove?.(event)

    if (!interactiveGlass) return

    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const normalizedX = (x / rect.width - 0.5) * 2
    const normalizedY = (y / rect.height - 0.5) * 2

    event.currentTarget.style.setProperty('--sidebar-pointer-x', `${x}px`)
    event.currentTarget.style.setProperty('--sidebar-pointer-y', `${y}px`)
    event.currentTarget.style.setProperty(
      '--sidebar-glass-sheen-x',
      `${Math.max(0, Math.min(100, (x / rect.width) * 100))}%`,
    )
    event.currentTarget.style.setProperty(
      '--sidebar-glass-sheen-y',
      `${Math.max(0, Math.min(100, (y / rect.height) * 100))}%`,
    )
    event.currentTarget.style.setProperty('--sidebar-glass-spot-opacity', '0.72')

    tiltX.set(normalizedX)
    tiltY.set(normalizedY)
  }

  const handlePointerLeave = (event: ReactPointerEvent<HTMLElement>) => {
    onPointerLeave?.(event)

    if (!interactiveGlass) return

    event.currentTarget.style.setProperty('--sidebar-pointer-x', '50%')
    event.currentTarget.style.setProperty('--sidebar-pointer-y', '8%')
    event.currentTarget.style.setProperty('--sidebar-glass-sheen-x', '18%')
    event.currentTarget.style.setProperty('--sidebar-glass-sheen-y', '8%')
    event.currentTarget.style.setProperty('--sidebar-glass-spot-opacity', '0.2')
    setFocusedItemKey(null)

    tiltX.set(0)
    tiltY.set(0)
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
          rotateX: interactiveGlass ? rotateX : undefined,
          rotateY: interactiveGlass ? rotateY : undefined,
          transformPerspective: 1200,
        }}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        {...props}
      >
        <svg aria-hidden="true" className="pointer-events-none absolute size-0" focusable="false">
          <defs>
            <filter id="vewave-sidebar-goo">
              <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -11"
                result="goo"
              />
              <feComposite in="SourceGraphic" in2="goo" operator="atop" />
            </filter>
            <filter id="vewave-sidebar-goo-strong">
              <feGaussianBlur in="SourceGraphic" stdDeviation="11" result="blur" />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 28 -14"
                result="goo"
              />
              <feComposite in="SourceGraphic" in2="goo" operator="atop" />
            </filter>
            <filter id="vewave-sidebar-refraction" x="-20%" y="-20%" width="140%" height="140%">
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
        <SidebarSurfaceEffects design={design} />
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
