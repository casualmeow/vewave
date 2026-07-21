import {
  appearanceConfigVersion,
  appearanceModes,
  appearancePresetIds,
  editableThemeTokenNames,
  glassIntensities,
  logoStrategies,
  surfaceStyles,
  type AppearanceMode,
  type AppearanceSettings,
  type ResolvedAppearanceMode,
  type ThemeTokenOverrides,
} from './contract'
import { defaultAppearanceSettings } from './presets'
import { normalizeHexColor } from './validators'

export const appearanceStorageKey = 'vewave:appearance'
export const appearanceModeStorageKey = 'vewave:appearance-mode'

export type UserAppConfig = Record<string, unknown> & {
  appearance?: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function sanitizeOverrides(value: unknown): ThemeTokenOverrides {
  if (!isRecord(value)) {
    return {}
  }

  const sanitized: ThemeTokenOverrides = {}

  editableThemeTokenNames.forEach((token) => {
    const normalized = typeof value[token] === 'string' ? normalizeHexColor(value[token]) : null

    if (normalized) {
      sanitized[token] = normalized
    }
  })

  return sanitized
}

function sanitizeModeOverrides(
  value: unknown,
): Partial<Record<ResolvedAppearanceMode, ThemeTokenOverrides>> {
  if (!isRecord(value)) {
    return { light: {}, dark: {} }
  }

  return {
    light: sanitizeOverrides(value.light),
    dark: sanitizeOverrides(value.dark),
  }
}

export function sanitizeAppearanceSettings(value: unknown): AppearanceSettings {
  if (!isRecord(value)) {
    return defaultAppearanceSettings
  }

  const customTheme = isRecord(value.customTheme) ? value.customTheme : {}

  return {
    version: appearanceConfigVersion,
    mode:
      typeof value.mode === 'string' && appearanceModes.includes(value.mode as AppearanceMode)
        ? (value.mode as AppearanceMode)
        : defaultAppearanceSettings.mode,
    preset:
      typeof value.preset === 'string' &&
      appearancePresetIds.includes(value.preset as AppearanceSettings['preset'])
        ? (value.preset as AppearanceSettings['preset'])
        : defaultAppearanceSettings.preset,
    logoStrategy:
      typeof value.logoStrategy === 'string' &&
      logoStrategies.includes(value.logoStrategy as AppearanceSettings['logoStrategy'])
        ? (value.logoStrategy as AppearanceSettings['logoStrategy'])
        : defaultAppearanceSettings.logoStrategy,
    glassIntensity:
      typeof value.glassIntensity === 'string' &&
      glassIntensities.includes(value.glassIntensity as AppearanceSettings['glassIntensity'])
        ? (value.glassIntensity as AppearanceSettings['glassIntensity'])
        : defaultAppearanceSettings.glassIntensity,
    surfaceStyle:
      typeof value.surfaceStyle === 'string' &&
      surfaceStyles.includes(value.surfaceStyle as AppearanceSettings['surfaceStyle'])
        ? (value.surfaceStyle as AppearanceSettings['surfaceStyle'])
        : defaultAppearanceSettings.surfaceStyle,
    experimentalRefraction:
      typeof value.experimentalRefraction === 'boolean'
        ? value.experimentalRefraction
        : defaultAppearanceSettings.experimentalRefraction,
    customTheme: {
      enabled:
        typeof customTheme.enabled === 'boolean'
          ? customTheme.enabled
          : defaultAppearanceSettings.customTheme.enabled,
      overrides: sanitizeModeOverrides(customTheme.overrides),
    },
  }
}

export function getAppearanceSettingsFromAppConfig(value: unknown) {
  if (!isRecord(value) || !isRecord(value.appearance)) {
    return null
  }

  return sanitizeAppearanceSettings(value.appearance)
}

export function withAppearanceSettingsInAppConfig(
  value: unknown,
  settings: AppearanceSettings,
): UserAppConfig {
  return {
    ...(isRecord(value) ? value : {}),
    appearance: sanitizeAppearanceSettings(settings),
  }
}

export function loadAppearanceSettings() {
  if (typeof window === 'undefined') {
    return defaultAppearanceSettings
  }

  try {
    const rawValue = JSON.parse(window.localStorage.getItem(appearanceStorageKey) ?? 'null')
    const settings = sanitizeAppearanceSettings(rawValue)

    if (isRecord(rawValue) && typeof rawValue.mode === 'string') {
      return settings
    }

    const legacyMode = window.localStorage.getItem(appearanceModeStorageKey)

    return legacyMode && appearanceModes.includes(legacyMode as AppearanceMode)
      ? { ...settings, mode: legacyMode as AppearanceMode }
      : settings
  } catch {
    return defaultAppearanceSettings
  }
}

export function saveAppearanceSettings(settings: AppearanceSettings) {
  window.localStorage.setItem(appearanceStorageKey, JSON.stringify(settings))
}
