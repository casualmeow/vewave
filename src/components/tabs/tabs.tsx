'use client'

import * as TabsPrimitive from '@radix-ui/react-tabs'
import { useId, useMemo, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { TabsProvider } from './providers'
import { TabsContent, TabsList, TabsTrigger } from './ui'
import type { TabsProps } from './types'
import { useFinePointer, useResolvedGlassFluidConfig } from '@/components/glass'
import { cn } from '@/shared/lib/utils'

export function Tabs({
  ref,
  className,
  design = 'liquidGlass',
  size = 'md',
  orientation = 'horizontal',
  fullWidth = false,
  motion = 'fluid',
  fluidPreset = 'balanced',
  interactiveGlass = true,
  value,
  defaultValue,
  onValueChange,
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
  children,
  ...props
}: TabsProps) {
  const scopeId = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const filterIds = useMemo(
    () => ({
      goo: `${scopeId}-tabs-goo`,
      gooStrong: `${scopeId}-tabs-goo-strong`,
      refraction: `${scopeId}-tabs-refraction`,
    }),
    [scopeId],
  )
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue)
  const [focusedValue, setFocusedValue] = useState<string | null>(null)
  const prefersReducedMotion = useReducedMotion()
  const finePointer = useFinePointer()
  const canAnimate = motion !== 'none' && !prefersReducedMotion
  const canInteractiveGlass = Boolean(
    interactiveGlass && design !== 'solid' && canAnimate && finePointer,
  )
  const activeValue = value ?? uncontrolledValue
  const fluidConfig = useResolvedGlassFluidConfig({
    fluidPreset,
    minHoverSize: 2,
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

  const contextValue = useMemo(
    () => ({
      scopeId,
      filterIds,
      design,
      size,
      orientation,
      fullWidth,
      motion,
      interactiveGlass: canInteractiveGlass,
      fluidPreset,
      fluidConfig,
      activeValue,
      focusedValue,
      setFocusedValue,
    }),
    [
      activeValue,
      canInteractiveGlass,
      design,
      filterIds,
      fluidConfig,
      fluidPreset,
      focusedValue,
      fullWidth,
      motion,
      orientation,
      scopeId,
      size,
    ],
  )

  const handleValueChange = (nextValue: string) => {
    if (value === undefined) {
      setUncontrolledValue(nextValue)
    }

    onValueChange?.(nextValue)
  }

  return (
    <TabsProvider value={contextValue}>
      <TabsPrimitive.Root
        ref={ref}
        data-slot="liquid-tabs"
        data-design={design}
        data-orientation={orientation}
        data-interactive-glass={canInteractiveGlass ? 'true' : 'false'}
        value={value}
        defaultValue={value === undefined ? defaultValue : undefined}
        onValueChange={handleValueChange}
        orientation={orientation}
        className={cn('relative min-w-0', fullWidth && 'w-full', className)}
        {...props}
      >
        {design !== 'solid' ? (
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
                  baseFrequency={design === 'telegramGlass' ? '0.01 0.026' : '0.012 0.034'}
                  numOctaves="2"
                  seed="17"
                  result="noise"
                />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="noise"
                  scale={design === 'telegramGlass' ? '7' : '11'}
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
              </filter>
            </defs>
          </svg>
        ) : null}

        {children}
      </TabsPrimitive.Root>
    </TabsProvider>
  )
}

export { TabsContent, TabsList, TabsPrimitive, TabsTrigger }
