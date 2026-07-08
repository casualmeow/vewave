/**
 * useHeaderInteractiveGlass
 *
 * Encapsulates all pointer-reactive glass behaviour for the Header:
 * - RAF-batched CSS variable updates for sheen / spot effects
 * - Magnetic tilt via useFluidTransform
 * - Derived capability flag
 */
import type { FocusEvent, PointerEvent as ReactPointerEvent } from 'react'
import type { HeaderFluidPreset, HeaderVariant } from '../types'
import { useFinePointer, useFluidTransform, useRafCssVariables } from '@/shared/hooks'
import { getPointerProgress, useResolvedGlassFluidConfig } from '@/components/glass'

export type UseHeaderInteractiveGlassOptions = {
  interactiveGlass: boolean
  variant: HeaderVariant
  fluidPreset: HeaderFluidPreset
  magneticStrength?: number
  magneticVerticalStrength?: number
  tiltStrength?: number
  liquidIntensity?: number
  prefersReducedMotion: boolean | null
  onRevealHeader: () => void
}

export function useHeaderInteractiveGlass({
  interactiveGlass,
  variant,
  fluidPreset,
  magneticStrength,
  magneticVerticalStrength,
  tiltStrength,
  liquidIntensity,
  prefersReducedMotion,
  onRevealHeader,
}: UseHeaderInteractiveGlassOptions) {
  const isInteractiveVariant =
    variant === 'glass' || variant === 'liquidGlass' || variant === 'telegramGlass'

  const finePointer = useFinePointer()
  const setCssVariables = useRafCssVariables()

  const fluidConfig = useResolvedGlassFluidConfig({
    fluidPreset,
    magneticStrength,
    magneticVerticalStrength,
    tiltStrength,
    liquidIntensity,
  })

  const canInteractiveGlass = Boolean(
    interactiveGlass && isInteractiveVariant && finePointer && !prefersReducedMotion,
  )

  const { fluidTransformStyle, updateFluidTransform, resetFluidTransform } = useFluidTransform({
    enabled: canInteractiveGlass,
    magneticStrength: fluidConfig.magneticStrength,
    magneticVerticalStrength: fluidConfig.magneticVerticalStrength,
    tiltStrength: fluidConfig.tiltStrength,
    perspective: 1200,
    tiltSpring: { stiffness: 180, damping: 28, mass: 0.72 },
  })

  const handleFocusCapture = (_event: FocusEvent<HTMLElement>) => {
    onRevealHeader()
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (!canInteractiveGlass) return

    const pointerProgress = getPointerProgress({
      clientX: event.clientX,
      clientY: event.clientY,
      rect: event.currentTarget.getBoundingClientRect(),
    })

    setCssVariables(event.currentTarget, {
      '--header-pointer-x': `${pointerProgress.localX}px`,
      '--header-pointer-y': `${pointerProgress.localY}px`,
      '--header-sheen-x': `${pointerProgress.percentX}%`,
      '--header-sheen-y': `${pointerProgress.percentY}%`,
      '--header-glass-spot-opacity': variant === 'telegramGlass' ? '0.62' : '0.78',
    })

    updateFluidTransform(pointerProgress.normalizedX, pointerProgress.normalizedY)
  }

  const handlePointerLeave = (event: ReactPointerEvent<HTMLElement>) => {
    if (!canInteractiveGlass) return

    setCssVariables(event.currentTarget, {
      '--header-pointer-x': '50%',
      '--header-pointer-y': '10%',
      '--header-sheen-x': '18%',
      '--header-sheen-y': '10%',
      '--header-glass-spot-opacity': variant === 'telegramGlass' ? '0.18' : '0.24',
    })

    resetFluidTransform()
  }

  return {
    canInteractiveGlass,
    fluidConfig,
    fluidTransformStyle,
    handleFocusCapture,
    handlePointerMove,
    handlePointerLeave,
  }
}
