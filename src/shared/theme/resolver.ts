import {
  cssVariableByToken,
  type AppearanceSettings,
  type ResolvedAppearanceMode,
  type ThemeTokens,
} from './contract'
import { getThemePreset } from './presets'
import { getReadableForeground, normalizeHexColor } from './validators'

export function resolveThemeTokens(
  settings: AppearanceSettings,
  mode: ResolvedAppearanceMode,
): ThemeTokens {
  const preset = getThemePreset(settings.preset)
  const tokens = { ...preset[mode] }

  if (settings.customTheme.enabled) {
    const overrides = settings.customTheme.overrides[mode] ?? {}
    const primary = normalizeHexColor(overrides.primary ?? '')
    const accent = normalizeHexColor(overrides.accent ?? '')

    if (primary) {
      tokens.primary = primary
      tokens.primaryForeground = getReadableForeground(primary)
      tokens.ring = primary
      tokens.sidebarPrimary = primary
      tokens.sidebarPrimaryForeground = tokens.primaryForeground
    }

    if (accent) {
      tokens.accent = accent
      tokens.accentForeground = getReadableForeground(accent)
      tokens.sidebarAccent = accent
      tokens.sidebarAccentForeground = tokens.accentForeground
      tokens.tabsTrack = mode === 'light' ? tokens.muted : tokens.surfaceElevated
    }
  }

  return tokens
}

export function applyThemeTokens(tokens: ThemeTokens, element = document.documentElement) {
  Object.entries(cssVariableByToken).forEach(([token, variable]) => {
    element.style.setProperty(variable, tokens[token as keyof ThemeTokens])
  })
}

export function clearThemeTokens(element = document.documentElement) {
  Object.values(cssVariableByToken).forEach((variable) => {
    element.style.removeProperty(variable)
  })
}
