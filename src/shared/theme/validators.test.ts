import { describe, expect, it } from 'vitest'

import { getContrastRatio, getReadableForeground, normalizeHexColor } from './validators'

describe('theme validators', () => {
  it('normalizes short and long hex values', () => {
    expect(normalizeHexColor('#abc')).toBe('#AABBCC')
    expect(normalizeHexColor('#d2274b')).toBe('#D2274B')
    expect(normalizeHexColor('not-a-color')).toBeNull()
  })

  it('calculates WCAG contrast ratios', () => {
    expect(getContrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21)
    expect(getContrastRatio('#D2274B', '#FFFFFF')).toBeGreaterThan(4.5)
  })

  it('chooses a readable foreground for custom brand colors', () => {
    expect(getReadableForeground('#D2274B')).toBe('#FFFFFF')
    expect(getReadableForeground('#FFE1EA')).toBe('#07101B')
  })
})
