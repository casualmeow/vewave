import { type HeaderSize, type HeaderBlurIntensity } from './types'

export const HEADER_HEIGHT: Record<HeaderSize, number> = {
  sm: 48,
  md: 56,
  lg: 64,
}

export const BLUR_VALUE: Record<HeaderBlurIntensity, string> = {
  none: '0px',
  sm: '8px',
  md: '12px',
  lg: '20px',
  xl: '30px',
}

export const SPRING_PRESETS = {
  gentle: { stiffness: 150, damping: 24, mass: 0.75 },
  spring: { stiffness: 220, damping: 28, mass: 0.7 },
  smooth: { stiffness: 170, damping: 30, mass: 0.8 },
  snappy: { stiffness: 320, damping: 32, mass: 0.55 },
  bouncy: { stiffness: 260, damping: 18, mass: 0.7 },
} as const

export const HIDE_TRANSITIONS = {
  gentle: { type: 'spring', stiffness: 150, damping: 24, mass: 0.75 },
  spring: { type: 'spring', stiffness: 220, damping: 28, mass: 0.7 },
  smooth: { type: 'tween', duration: 0.28, ease: [0.4, 0, 0.2, 1] },
  snappy: { type: 'spring', stiffness: 320, damping: 32, mass: 0.55 },
  bouncy: { type: 'spring', stiffness: 260, damping: 18, mass: 0.7 },
} as const
