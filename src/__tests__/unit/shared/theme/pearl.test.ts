import { describe, expect, it } from 'vitest'
import type { AppearanceSettings, ThemeTokenName } from '@/shared/theme/contract'
import { getWhiteGlassAppearance, isWhiteGlassAppearance } from '@/shared/theme/appearance-look'
import { appearancePresetIds } from '@/shared/theme/contract'
import {
  getAppearanceSettingsFromAppConfig,
  sanitizeAppearanceSettings,
  withAppearanceSettingsInAppConfig,
} from '@/shared/theme/persistence'
import { defaultAppearanceSettings, getThemePreset, themePresets } from '@/shared/theme/presets'
import { resolveThemeTokens } from '@/shared/theme/resolver'
import { getContrastRatio, hexToRgb } from '@/shared/theme/validators'

describe('Pearl palette', () => {
  it('registers complete light and dark variants that round-trip through account config', () => {
    expect(appearancePresetIds).toContain('pearl')
    expect(themePresets.filter((preset) => preset.id === 'pearl')).toHaveLength(1)
    const preset = getThemePreset('pearl')
    expect(preset.label).toBe('Pearl')
    for (const mode of ['light', 'dark'] as const) {
      expect(Object.keys(preset[mode]).sort()).toEqual(
        Object.keys(getThemePreset('default')[mode]).sort(),
      )
      expect(preset[mode].logoAccent).not.toBe(
        mode === 'light' ? preset[mode].logoDark : preset[mode].logoLight,
      )
    }
    const settings: AppearanceSettings = {
      ...defaultAppearanceSettings,
      preset: 'pearl',
      mode: 'system',
    }
    expect(sanitizeAppearanceSettings(settings)).toEqual(settings)
    const config = JSON.parse(
      JSON.stringify(withAppearanceSettingsInAppConfig({ unrelated: { keep: true } }, settings)),
    )
    expect(config.unrelated).toEqual({ keep: true })
    expect(getAppearanceSettingsFromAppConfig(config)).toEqual(settings)
  })

  it.each(['light', 'dark'] as const)('keeps %s surfaces and controls readable', (mode) => {
    const tokens = resolveThemeTokens({ ...defaultAppearanceSettings, preset: 'pearl' }, mode)
    const pairs: Array<[ThemeTokenName, ThemeTokenName]> = [
      ['foreground', 'background'],
      ['cardForeground', 'card'],
      ['popoverForeground', 'popover'],
      ['primaryForeground', 'primary'],
      ['secondaryForeground', 'secondary'],
      ['accentForeground', 'accent'],
      ['headerForeground', 'header'],
      ['sidebarForeground', 'sidebar'],
      ['destructiveForeground', 'destructive'],
      ['successForeground', 'success'],
      ['warningForeground', 'warning'],
    ]
    for (const [foreground, background] of pairs) {
      expect(
        getContrastRatio(tokens[foreground], tokens[background]),
        `${foreground} on ${background}`,
      ).toBeGreaterThanOrEqual(4.5)
    }
    for (const surface of ['background', 'card', 'popover', 'muted', 'surfaceElevated'] as const) {
      expect(
        getContrastRatio(tokens.mutedForeground, tokens[surface]),
        `secondary text on ${surface}`,
      ).toBeGreaterThanOrEqual(4.5)
      expect(
        getContrastRatio(tokens.input, tokens[surface]),
        `field on ${surface}`,
      ).toBeGreaterThanOrEqual(3)
      const ring = hexToRgb(tokens.ring)!
      const base = hexToRgb(tokens[surface])!
      const blendedRing =
        '#' +
        (['r', 'g', 'b'] as const)
          .map((channel) =>
            Math.round((ring[channel] + base[channel]) / 2)
              .toString(16)
              .padStart(2, '0'),
          )
          .join('')
      expect(
        getContrastRatio(blendedRing, tokens[surface]),
        `focus on ${surface}`,
      ).toBeGreaterThanOrEqual(3)
    }
  })

  it('keeps Pearl as a palette choice without imposing light mode, glass, or disabled custom colors', () => {
    const settings = sanitizeAppearanceSettings({
      ...defaultAppearanceSettings,
      preset: 'pearl',
      mode: 'dark',
      surfaceStyle: 'solid',
      customTheme: { enabled: true, overrides: { dark: { primary: '#70A0C0' } } },
    })
    expect(settings).toMatchObject({ preset: 'pearl', mode: 'dark', surfaceStyle: 'solid' })
    expect(settings.customTheme.enabled).toBe(true)
    expect(resolveThemeTokens(settings, 'dark').primary).toBe('#70A0C0')
    expect(isWhiteGlassAppearance(settings)).toBe(false)
  })
})

describe('White Glass look', () => {
  it('applies the coordinated look without mutating or dropping stored preferences', () => {
    const original: AppearanceSettings = {
      ...defaultAppearanceSettings,
      preset: 'noir',
      mode: 'system',
      surfaceStyle: 'solid',
      glassIntensity: 'strong',
      glassMotion: 'off',
      logoStrategy: 'mono',
      experimentalRefraction: true,
      background: {
        preset: 'contours',
        palette: 'custom',
        colors: ['#AABBCC', '#CCDDEE'],
        brightness: 0.4,
        speed: 0.1,
        animated: true,
      },
      customTheme: {
        enabled: true,
        overrides: { light: { background: '#DDEEFF' }, dark: { primary: '#9988AA' } },
      },
    }
    const before = structuredClone(original)
    const applied = getWhiteGlassAppearance(original)
    expect(applied).toEqual({
      ...before,
      preset: 'pearl',
      mode: 'light',
      surfaceStyle: 'glass',
      customTheme: { ...before.customTheme, enabled: false },
    })
    expect(original).toEqual(before)
    expect(isWhiteGlassAppearance(applied)).toBe(true)
    expect(getWhiteGlassAppearance(applied)).toEqual(applied)
    expect(resolveThemeTokens(applied, 'light').background).toBe(
      getThemePreset('pearl').light.background,
    )
    const account = withAppearanceSettingsInAppConfig({ existing: true }, applied)
    expect(getAppearanceSettingsFromAppConfig(account)).toEqual(applied)
    expect(account.existing).toBe(true)
  })

  it('does not report an applied look after changing any of its defining preferences', () => {
    const applied = getWhiteGlassAppearance(defaultAppearanceSettings)
    for (const change of [
      { preset: 'noir' as const },
      { mode: 'system' as const },
      { surfaceStyle: 'solid' as const },
      { customTheme: { ...applied.customTheme, enabled: true } },
    ]) {
      expect(isWhiteGlassAppearance({ ...applied, ...change })).toBe(false)
    }
  })
})
