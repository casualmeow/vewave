import { describe, expect, it } from 'vitest'

import type { AppearanceSettings } from '@/shared/theme/contract'
import {
  getAppearanceSettingsFromAppConfig,
  sanitizeAppearanceSettings,
  withAppearanceSettingsInAppConfig,
} from '@/shared/theme/persistence'
import { defaultAppearanceSettings } from '@/shared/theme/presets'

describe('appearance persistence', () => {
  it('stores appearance settings inside app config without dropping unrelated keys', () => {
    const settings: AppearanceSettings = {
      ...defaultAppearanceSettings,
      mode: 'dark',
      preset: 'vewave',
      customTheme: {
        enabled: true,
        overrides: {
          light: {
            primary: '#123456',
          },
          dark: {
            primary: '#6985AA',
            background: '#0A0F17',
          },
        },
      },
    }

    const appConfig = withAppearanceSettingsInAppConfig(
      {
        onboarding: {
          completed: true,
        },
        shortcuts: ['create-room'],
      },
      settings,
    )

    expect(appConfig.onboarding).toEqual({ completed: true })
    expect(appConfig.shortcuts).toEqual(['create-room'])
    expect(appConfig.appearance).toEqual(settings)
  })

  it('reads sanitized appearance settings from account app config', () => {
    const appearance = getAppearanceSettingsFromAppConfig({
      appearance: {
        version: 99,
        mode: 'dark',
        preset: 'missing',
        logoStrategy: 'auto',
        glassIntensity: 'strong',
        customTheme: {
          enabled: true,
          overrides: {
            light: {
              primary: '#abc',
              card: 'not-a-color',
              unknownToken: '#ffffff',
            },
            dark: {
              background: '#0d121a',
            },
          },
        },
      },
    })

    expect(appearance).toEqual({
      ...defaultAppearanceSettings,
      mode: 'dark',
      logoStrategy: 'auto',
      glassIntensity: 'strong',
      customTheme: {
        enabled: true,
        overrides: {
          light: {
            primary: '#AABBCC',
          },
          dark: {
            background: '#0D121A',
          },
        },
      },
    })
  })

  it('falls back to defaults for invalid settings payloads', () => {
    expect(sanitizeAppearanceSettings(null)).toEqual(defaultAppearanceSettings)
    expect(getAppearanceSettingsFromAppConfig({ appearance: null })).toBeNull()
  })
})
