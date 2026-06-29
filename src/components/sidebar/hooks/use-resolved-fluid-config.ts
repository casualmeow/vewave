import { useMemo } from 'react'
import { SIDEBAR_FLUID_PRESETS } from '../constants'
import type {
  SidebarFluidInteractionProps,
  SidebarFluidPreset,
  SidebarResolvedFluidConfig,
} from '../types'

export type UseResolvedFluidConfigOptions = SidebarFluidInteractionProps & {
  fluidPreset?: SidebarFluidPreset
  minHoverSize?: number
}

export function useResolvedFluidConfig({
  fluidPreset = 'subtle',
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
}: UseResolvedFluidConfigOptions) {
  return useMemo<SidebarResolvedFluidConfig>(() => {
    const preset = SIDEBAR_FLUID_PRESETS[fluidPreset]

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
