import { describe, expect, it } from 'vitest'
import type { AppearanceSettings, ThemeTokenName } from '@/shared/theme/contract'
import { resolveBackdropPalette } from '@/components/app-backdrop/palette'
import { appearancePresetIds } from '@/shared/theme/contract'
import {
  getAppearanceSettingsFromAppConfig,
  sanitizeAppearanceSettings,
  withAppearanceSettingsInAppConfig,
} from '@/shared/theme/persistence'
import { defaultAppearanceSettings, getThemePreset, themePresets } from '@/shared/theme/presets'
import { resolveThemeTokens } from '@/shared/theme/resolver'
import { getContrastRatio, hexToRgb } from '@/shared/theme/validators'

const settings: AppearanceSettings = { ...defaultAppearanceSettings, preset: 'noir', mode: 'dark' }
const neutralTokens: Array<ThemeTokenName> = [
  'background',
  'foreground',
  'card',
  'cardForeground',
  'popover',
  'popoverForeground',
  'primary',
  'primaryForeground',
  'secondary',
  'secondaryForeground',
  'muted',
  'mutedForeground',
  'accent',
  'accentForeground',
  'border',
  'input',
  'ring',
  'surfaceElevated',
  'header',
  'headerForeground',
  'tabsTrack',
  'tabsActive',
]

describe('Noir / OLED theme', () => {
  it('registers a complete preset and round-trips it through account config without changing other preferences', () => {
    expect(appearancePresetIds).toContain('noir')
    expect(themePresets.filter((preset) => preset.id === 'noir')).toHaveLength(1)
    expect(getThemePreset('noir').label).toBe('Mono')
    expect(sanitizeAppearanceSettings(settings)).toEqual(settings)
    const config = withAppearanceSettingsInAppConfig({ unrelated: true }, settings)
    expect(config.unrelated).toBe(true)
    expect(getAppearanceSettingsFromAppConfig(config)).toEqual(settings)
  })

  it.each(['light', 'dark'] as const)(
    'keeps %s reading surfaces, actions, field boundaries, and focus rings legible',
    (mode) => {
      const tokens = resolveThemeTokens(settings, mode)
      const textPairs: Array<[ThemeTokenName, ThemeTokenName]> = [
        ['foreground', 'background'],
        ['cardForeground', 'card'],
        ['popoverForeground', 'popover'],
        ['primaryForeground', 'primary'],
        ['secondaryForeground', 'secondary'],
        ['accentForeground', 'accent'],
        ['headerForeground', 'header'],
        ['destructiveForeground', 'destructive'],
        ['successForeground', 'success'],
        ['warningForeground', 'warning'],
      ]
      for (const [foreground, surface] of textPairs) {
        expect(
          getContrastRatio(tokens[foreground], tokens[surface]),
          `${foreground} on ${surface}`,
        ).toBeGreaterThanOrEqual(4.5)
      }
      for (const surface of [
        'background',
        'card',
        'popover',
        'muted',
        'surfaceElevated',
      ] as const) {
        expect(
          getContrastRatio(tokens.mutedForeground, tokens[surface]),
          `secondary text on ${surface}`,
        ).toBeGreaterThanOrEqual(4.5)
        expect(
          getContrastRatio(tokens.input, tokens[surface]),
          `field boundary on ${surface}`,
        ).toBeGreaterThanOrEqual(3)
        const ring = hexToRgb(tokens.ring)!
        const base = hexToRgb(tokens[surface])!

        const focusColor =
          '#' +
          (['r', 'g', 'b'] as const)
            .map((channel) =>
              Math.round((ring[channel] + base[channel]) / 2)
                .toString(16)
                .padStart(2, '0'),
            )
            .join('')
        expect(
          getContrastRatio(focusColor, tokens[surface]),
          `focus ring on ${surface}`,
        ).toBeGreaterThanOrEqual(3)
      }
    },
  )

  it.each(['light', 'dark'] as const)(
    'keeps %s surfaces and theme shader colors monochrome',
    (mode) => {
      const tokens = resolveThemeTokens(settings, mode)
      const palette = resolveBackdropPalette(settings.background, tokens, mode)
      for (const color of [
        ...neutralTokens.map((token) => tokens[token]),
        ...Object.values(palette),
      ]) {
        const rgb = hexToRgb(color)!
        expect(rgb.r).toBe(rgb.g)
        expect(rgb.g).toBe(rgb.b)
      }
      if (mode === 'dark') {
        expect(tokens.background).toBe('#000000')
        expect(tokens.header).toBe('#000000')
        expect(palette.base).toBe('#000000')
      }
    },
  )

  it('preserves custom theme overrides and custom background colors', () => {
    const custom: AppearanceSettings = {
      ...settings,
      customTheme: { enabled: true, overrides: { dark: { primary: '#70A0C0' } } },
      background: { ...settings.background, palette: 'custom', colors: ['#CC7044', '#5588CC'] },
    }
    const tokens = resolveThemeTokens(custom, 'dark')
    expect(tokens.primary).toBe('#70A0C0')
    const first = hexToRgb(resolveBackdropPalette(custom.background, tokens, 'dark').first)!
    expect(first.r).not.toBe(first.b)
  })
})
