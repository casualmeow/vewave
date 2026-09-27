import { describe, expect, it } from 'vitest'
import { resolveGlassMotion } from '@/shared/theme/glass-motion'

describe('glass motion policy', () => {
  it.each(['off', 'subtle', 'fluid'] as const)('resolves the saved %s profile', (preference) => {
    expect(resolveGlassMotion({ surfaceStyle: 'glass', preference })).toBe(preference)
  })

  it.each(['off', 'subtle', 'fluid'] as const)(
    'prioritizes accessibility over an explicit %s preview',
    (requested) => {
      expect(resolveGlassMotion({ requested, reducedMotion: true })).toBe('off')
      expect(resolveGlassMotion({ requested, keyboard: true })).toBe('off')
    },
  )

  it('keeps solid selection calm and permits an explicit showcase profile', () => {
    expect(resolveGlassMotion({ surfaceStyle: 'solid', preference: 'fluid' })).toBe('subtle')
    expect(resolveGlassMotion({ requested: 'fluid' })).toBe('fluid')
  })
})
