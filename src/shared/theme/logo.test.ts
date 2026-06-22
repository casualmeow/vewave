import { describe, expect, it } from 'vitest'

import { resolveLogoTone } from './logo'

describe('resolveLogoTone', () => {
  it('honors explicit logo strategies', () => {
    expect(resolveLogoTone('light', '#000000', 'light')).toBe('light')
    expect(resolveLogoTone('dark', '#FFFFFF', 'dark')).toBe('dark')
    expect(resolveLogoTone('mono', '#FFFFFF', 'dark')).toBe('mono')
  })

  it('chooses the opposite tone for readable auto placement', () => {
    expect(resolveLogoTone('auto', '#0D121A', 'light')).toBe('light')
    expect(resolveLogoTone('auto', '#FFFFFF', 'dark')).toBe('dark')
  })

  it('falls back to the resolved mode when the surface is not a hex color', () => {
    expect(resolveLogoTone('auto', 'rgba(0, 0, 0, 0.4)', 'dark')).toBe('light')
    expect(resolveLogoTone('auto', 'rgba(255, 255, 255, 0.4)', 'light')).toBe('dark')
  })
})
