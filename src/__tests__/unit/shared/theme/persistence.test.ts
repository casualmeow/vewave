import { afterEach, describe, expect, it, vi } from 'vitest'

import type { AppearanceSettings } from '@/shared/theme/contract'
import {
  getAppearanceSettingsFromAppConfig,
  loadAppearanceSettings,
  saveAppearanceSettings,
  sanitizeAppearanceSettings,
  withAppearanceSettingsInAppConfig,
} from '@/shared/theme/persistence'
import { defaultAppearanceSettings } from '@/shared/theme/presets'

describe('appearance persistence', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('isolates each account cache and never migrates a guest theme into an empty account', () => {
    const entries = new Map<string, string>([['vewave:appearance-mode', 'dark']])
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => entries.get(key) ?? null,
      setItem: (key: string, value: string) => entries.set(key, value),
    })
    const guest = { ...defaultAppearanceSettings, preset: 'heatwave' as const }
    const account = {
      ...defaultAppearanceSettings,
      preset: 'coldwave' as const,
      background: { ...defaultAppearanceSettings.background, preset: 'silk' as const },
    }
    saveAppearanceSettings(guest)
    saveAppearanceSettings(account, 'account-a')
    expect(loadAppearanceSettings()).toEqual(guest)
    expect(loadAppearanceSettings('account-a')).toEqual(account)
    expect(loadAppearanceSettings('account-b')).toEqual(defaultAppearanceSettings)
  })

  it('keeps live preference updates usable when browser storage is blocked', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
    })
    expect(() => saveAppearanceSettings(defaultAppearanceSettings, 'account-a')).not.toThrow()
    expect(loadAppearanceSettings('account-a')).toEqual(defaultAppearanceSettings)
  })

  it('adds background defaults to old configs without changing their surface choice', () => {
    const settings = sanitizeAppearanceSettings({
      mode: 'dark',
      surfaceStyle: 'glass',
      experimentalRefraction: false,
    })
    expect(settings.background).toEqual(defaultAppearanceSettings.background)
    expect(settings.surfaceStyle).toBe('glass')
    expect(settings.experimentalRefraction).toBe(false)
  })

  it('sanitizes partial and invalid background settings and preserves account data', () => {
    const settings = sanitizeAppearanceSettings({
      background: {
        preset: 'silk',
        palette: 'custom',
        colors: ['#abc', 'url(x)'],
        brightness: 8,
        speed: -2,
        animated: false,
      },
    })
    expect(settings.background).toEqual({
      preset: 'silk',
      palette: 'custom',
      colors: ['#AABBCC', defaultAppearanceSettings.background.colors[1]],
      brightness: 1,
      speed: 0,
      animated: false,
    })
    const config = withAppearanceSettingsInAppConfig({ other: true }, settings)
    expect(config.other).toBe(true)
    expect(getAppearanceSettingsFromAppConfig(config)?.background).toEqual(settings.background)
    expect(
      sanitizeAppearanceSettings({
        background: { brightness: NaN, speed: Infinity, preset: 'invalid' },
      }).background,
    ).toEqual(defaultAppearanceSettings.background)
  })

  it.each(['off', 'subtle', 'fluid'] as const)(
    'round trips %s motion through account config',
    (glassMotion) => {
      const settings = { ...defaultAppearanceSettings, glassMotion }
      expect(
        getAppearanceSettingsFromAppConfig(
          withAppearanceSettingsInAppConfig({ unrelated: true }, settings),
        ),
      ).toEqual(settings)
    },
  )

  it('upgrades older settings and rejects invalid motion without resetting other preferences', () => {
    for (const glassMotion of [undefined, 'invalid', 1, null]) {
      const settings = sanitizeAppearanceSettings({
        version: 1,
        mode: 'dark',
        glassIntensity: 'strong',
        glassMotion,
      })
      expect(settings).toMatchObject({
        version: 1,
        mode: 'dark',
        glassIntensity: 'strong',
        glassMotion: 'fluid',
      })
    }
  })

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
