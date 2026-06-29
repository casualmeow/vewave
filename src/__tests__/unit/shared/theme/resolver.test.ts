import { describe, expect, it } from 'vitest'

import type {
  AppearanceSettings,
  ResolvedAppearanceMode,
  ThemeTokenOverrides,
} from '@/shared/theme/contract'
import { defaultAppearanceSettings } from '@/shared/theme/presets'
import { resolveThemeTokens } from '@/shared/theme/resolver'

function settingsWithOverrides(
  mode: ResolvedAppearanceMode,
  overrides: ThemeTokenOverrides,
): AppearanceSettings {
  return {
    ...defaultAppearanceSettings,
    mode,
    customTheme: {
      enabled: true,
      overrides: {
        light: {},
        dark: {},
        [mode]: overrides,
      },
    },
  }
}

describe('resolveThemeTokens', () => {
  it('derives logo colors from custom primary and accent tokens', () => {
    const tokens = resolveThemeTokens(
      settingsWithOverrides('light', {
        primary: '#0F9F6E',
        accent: '#F59E0B',
      }),
      'light',
    )

    expect(tokens.logoDark).toBe('#0F9F6E')
    expect(tokens.logoLight).toBe('#0F9F6E')
    expect(tokens.logoAccent).toBe('#F59E0B')
  })

  it('uses custom primary for every logo fill when only primary is changed', () => {
    const tokens = resolveThemeTokens(
      settingsWithOverrides('dark', {
        primary: '#38BDF8',
      }),
      'dark',
    )

    expect(tokens.logoDark).toBe('#38BDF8')
    expect(tokens.logoLight).toBe('#38BDF8')
    expect(tokens.logoAccent).toBe('#38BDF8')
  })

  it('keeps explicit logo token overrides above derived brand colors', () => {
    const tokens = resolveThemeTokens(
      settingsWithOverrides('light', {
        primary: '#0F9F6E',
        accent: '#F59E0B',
        logoDark: '#111827',
        logoLight: '#F9FAFB',
        logoAccent: '#7C3AED',
      }),
      'light',
    )

    expect(tokens.logoDark).toBe('#111827')
    expect(tokens.logoLight).toBe('#F9FAFB')
    expect(tokens.logoAccent).toBe('#7C3AED')
  })
})
