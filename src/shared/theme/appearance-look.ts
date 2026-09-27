import type { AppearanceSettings } from './contract'

export function getWhiteGlassAppearance(settings: AppearanceSettings): AppearanceSettings {
  return {
    ...settings,
    preset: 'pearl',
    mode: 'light',
    surfaceStyle: 'glass',
    customTheme: { ...settings.customTheme, enabled: false },
  }
}

export function isWhiteGlassAppearance(settings: AppearanceSettings) {
  return (
    settings.preset === 'pearl' &&
    settings.mode === 'light' &&
    settings.surfaceStyle === 'glass' &&
    !settings.customTheme.enabled
  )
}
