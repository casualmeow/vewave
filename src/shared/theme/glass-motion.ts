import type { GlassMotion } from './contract'

export const glassMotionProfiles = {
  off: { travelMs: 0, settleMs: 0, stretch: 0, compression: 0 },
  subtle: { travelMs: 180, settleMs: 180, stretch: 0, compression: 0 },
  fluid: { travelMs: 225, settleMs: 300, stretch: 0.05, compression: 0.02 },
} as const satisfies Record<
  GlassMotion,
  {
    travelMs: number
    settleMs: number
    stretch: number
    compression: number
  }
>

export function resolveGlassMotion({
  requested = 'auto',
  preference = 'fluid',
  surfaceStyle = 'solid',
  reducedMotion = false,
  keyboard = false,
}: {
  requested?: 'auto' | GlassMotion
  preference?: GlassMotion
  surfaceStyle?: string
  reducedMotion?: boolean
  keyboard?: boolean
}): GlassMotion {
  if (reducedMotion || keyboard) return 'off'
  return requested === 'auto' ? (surfaceStyle === 'glass' ? preference : 'subtle') : requested
}
