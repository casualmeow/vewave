import { useMemo } from 'react'
import type {
  GlassFluidInteractionProps,
  GlassFluidPreset,
  GlassResolvedFluidConfig,
} from '@/components/glass/types/types'
import { GLASS_FLUID_PRESETS } from '@/components/glass/constants'

export type UseResolvedGlassFluidConfigOptions = GlassFluidInteractionProps & {
  fluidPreset?: GlassFluidPreset
  minHoverSize?: number
}

export function useResolvedGlassFluidConfig({
  fluidPreset = 'balanced',
  minHoverSize = 0,
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
}: UseResolvedGlassFluidConfigOptions) {
  return useMemo<GlassResolvedFluidConfig>(() => {
    const preset = GLASS_FLUID_PRESETS[fluidPreset]

    return {
      hoverScale: hoverScale ?? preset.hoverScale,
      activeHoverScale: activeHoverScale ?? preset.activeHoverScale,
      dragScale: dragScale ?? preset.dragScale,
      hoverSize: hoverSize ?? Math.max(minHoverSize, preset.hoverSize),
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
    minHoverSize,
    tiltStrength,
  ])
}
