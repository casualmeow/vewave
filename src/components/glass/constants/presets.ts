export const GLASS_SOFT_TRANSITION = {
  type: 'spring',
  stiffness: 260,
  damping: 30,
  mass: 0.8,
} as const

export const GLASS_FLUID_TRANSITION = {
  type: 'spring',
  stiffness: 520,
  damping: 32,
  mass: 0.62,
} as const

export const GLASS_MAGNETIC_TRANSITION = {
  type: 'spring',
  stiffness: 620,
  damping: 28,
  mass: 0.5,
} as const

export const GLASS_FLUID_PRESETS = {
  subtle: {
    hoverScale: 1.018,
    activeHoverScale: 1.012,
    dragScale: 1.035,
    hoverSize: 3,
    magneticStrength: 3,
    magneticVerticalStrength: 2,
    tiltStrength: 1.2,
    focusBlur: true,
    focusBlurAmount: 1.8,
    focusDimOpacity: 0.72,
    liquidIntensity: 0.72,
    dragMode: 'none',
  },
  balanced: {
    hoverScale: 1.035,
    activeHoverScale: 1.025,
    dragScale: 1.06,
    hoverSize: 6,
    magneticStrength: 7,
    magneticVerticalStrength: 4.5,
    tiltStrength: 2.2,
    focusBlur: true,
    focusBlurAmount: 2.8,
    focusDimOpacity: 0.6,
    liquidIntensity: 1,
    dragMode: 'none',
  },
  expressive: {
    hoverScale: 1.055,
    activeHoverScale: 1.04,
    dragScale: 1.1,
    hoverSize: 10,
    magneticStrength: 11,
    magneticVerticalStrength: 7,
    tiltStrength: 3.5,
    focusBlur: true,
    focusBlurAmount: 4,
    focusDimOpacity: 0.48,
    liquidIntensity: 1.25,
    dragMode: 'both',
  },
  extreme: {
    hoverScale: 1.08,
    activeHoverScale: 1.055,
    dragScale: 1.14,
    hoverSize: 14,
    magneticStrength: 16,
    magneticVerticalStrength: 10,
    tiltStrength: 4.8,
    focusBlur: true,
    focusBlurAmount: 5.4,
    focusDimOpacity: 0.36,
    liquidIntensity: 1.48,
    dragMode: 'both',
  },
} as const
