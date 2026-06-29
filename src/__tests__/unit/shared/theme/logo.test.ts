import { describe, expect, it } from 'vitest'

import {
  createVewaveLogoSvgDataUrl,
  getLogoColorsForTone,
  getVewaveLogoFaviconHref,
  resolveLogoTone,
} from '@/shared/theme/logo'
import { themePresets } from '@/shared/theme/presets'

const defaultLightTokens = themePresets[0].light
const defaultDarkTokens = themePresets[0].dark

function decodeLogoDataUrl(href: string) {
  const prefix = 'data:image/svg+xml,'
  expect(href.startsWith(prefix)).toBe(true)

  return decodeURIComponent(href.slice(prefix.length))
}

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

describe('logo favicon helpers', () => {
  it('maps resolved logo tones to theme token colors', () => {
    expect(getLogoColorsForTone('dark', defaultLightTokens)).toEqual({
      base: defaultLightTokens.logoDark,
      accent: defaultLightTokens.logoAccent,
    })
    expect(getLogoColorsForTone('light', defaultDarkTokens)).toEqual({
      base: defaultDarkTokens.logoLight,
      accent: defaultDarkTokens.logoAccent,
    })
    expect(getLogoColorsForTone('mono', defaultDarkTokens)).toEqual({
      base: defaultDarkTokens.foreground,
      accent: defaultDarkTokens.foreground,
    })
  })

  it('creates SVG data URLs with encoded logo colors', () => {
    const svg = decodeLogoDataUrl(
      createVewaveLogoSvgDataUrl({ base: '#123456', accent: '#ABCDEF' }),
    )

    expect(svg).toContain('fill="#123456"')
    expect(svg).toContain('fill="#ABCDEF"')
    expect(svg).toContain('viewBox="80 176 340 156"')
  })

  it('builds favicon data from the resolved theme background and custom logo tokens', () => {
    const customTokens = {
      ...defaultLightTokens,
      background: '#050A10',
      logoLight: '#EAF2FF',
      logoAccent: '#456789',
    }
    const svg = decodeLogoDataUrl(
      getVewaveLogoFaviconHref({
        logoStrategy: 'auto',
        resolvedMode: 'dark',
        tokens: customTokens,
      }),
    )

    expect(svg).toContain('fill="#EAF2FF"')
    expect(svg).toContain('fill="#456789"')
  })
})
