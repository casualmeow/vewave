import {
  appearancePresetIds,
  glassIntensities,
  logoStrategies,
  type AppearanceSettings,
  type ResolvedAppearanceMode,
  type ThemeTokenOverrides,
} from './contract'
import { defaultAppearanceSettings } from './presets'
import { normalizeHexColor } from './validators'

export const appearanceStorageKey = 'vewave:appearance'
export const appearanceModeStorageKey = 'vewave:appearance-mode'

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function sanitizeOverrides(value: unknown): ThemeTokenOverrides {
  if (!isRecord(value)) {
    return {}
  }

  const primary = typeof value.primary === 'string' ? normalizeHexColor(value.primary) : null
  const accent = typeof value.accent === 'string' ? normalizeHexColor(value.accent) : null

  return {
    ...(primary ? { primary } : {}),
    ...(accent ? { accent } : {}),
  }
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
    customTheme: {
      enabled:
        typeof customTheme.enabled === 'boolean'
          ? customTheme.enabled
          : defaultAppearanceSettings.customTheme.enabled,
      overrides: sanitizeModeOverrides(customTheme.overrides),
    },
  }
}

export function loadAppearanceSettings() {
  if (typeof window === 'undefined') {
    return defaultAppearanceSettings
  }

  try {
    return sanitizeAppearanceSettings(
      JSON.parse(window.localStorage.getItem(appearanceStorageKey) ?? 'null'),
    )
  } catch {
    return defaultAppearanceSettings
  }
}

export function saveAppearanceSettings(settings: AppearanceSettings) {
  window.localStorage.setItem(appearanceStorageKey, JSON.stringify(settings))
}
