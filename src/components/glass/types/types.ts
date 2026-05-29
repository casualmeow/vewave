export type GlassDragMode = 'none' | 'x' | 'y' | 'both'

export type GlassFluidPreset = 'subtle' | 'balanced' | 'expressive' | 'extreme'

export type GlassResolvedFluidConfig = {
  hoverScale: number
  activeHoverScale: number
  dragScale: number
  hoverSize: number
  magneticStrength: number
  magneticVerticalStrength: number
  tiltStrength: number
  focusBlur: boolean
  focusBlurAmount: number
  focusDimOpacity: number
  liquidIntensity: number
  dragMode: GlassDragMode
}

export type GlassFluidInteractionProps = {
  hoverScale?: number
  activeHoverScale?: number
  dragScale?: number
  hoverSize?: number
  magneticStrength?: number
  magneticVerticalStrength?: number
  tiltStrength?: number
  focusBlur?: boolean
  focusBlurAmount?: number
  focusDimOpacity?: number
  liquidIntensity?: number
  dragMode?: GlassDragMode
}

export type GlassFilterIds = {
  goo: string
  gooStrong: string
  refraction: string
}
