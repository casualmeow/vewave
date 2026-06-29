import {
  cssVariableByToken,
  type AppearanceSettings,
  type EditableThemeTokenName,
  type ResolvedAppearanceMode,
  type ThemeTokenOverrides,
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

    Object.assign(tokens, overrides)

    if (primary) {
      tokens.primary = primary
      linkDerivedToken(tokens, overrides, 'primaryForeground', getReadableForeground(primary))
      linkDerivedToken(tokens, overrides, 'ring', primary)
      linkDerivedToken(tokens, overrides, 'sidebarPrimary', primary)
      linkDerivedToken(tokens, overrides, 'sidebarPrimaryForeground', tokens.primaryForeground)
      linkDerivedToken(tokens, overrides, 'logoDark', primary)
      linkDerivedToken(tokens, overrides, 'logoLight', primary)
      linkDerivedToken(tokens, overrides, 'logoAccent', primary)
    }

    if (accent) {
      tokens.accent = accent
      linkDerivedToken(tokens, overrides, 'accentForeground', getReadableForeground(accent))
      linkDerivedToken(tokens, overrides, 'sidebarAccent', accent)
      linkDerivedToken(tokens, overrides, 'sidebarAccentForeground', tokens.accentForeground)
      linkDerivedToken(tokens, overrides, 'logoAccent', accent)
      linkDerivedToken(
        tokens,
        overrides,
        'tabsTrack',
        mode === 'light' ? tokens.muted : tokens.surfaceElevated,
      )
    }
  }

  return tokens
}

function linkDerivedToken(
  tokens: ThemeTokens,
  overrides: ThemeTokenOverrides,
  token: EditableThemeTokenName,
  value: string,
) {
  if (!overrides[token]) {
    tokens[token] = value
  }
}

export function applyThemeTokens(tokens: ThemeTokens, element = document.documentElement) {
  Object.entries(cssVariableByToken).forEach(([token, variable]) => {
    element.style.setProperty(variable, tokens[token as keyof ThemeTokens])
  })
}

export function getThemeTokenStyle(tokens: ThemeTokens) {
  return Object.fromEntries(
    Object.entries(cssVariableByToken).map(([token, variable]) => [
      variable,
      tokens[token as keyof ThemeTokens],
    ]),
  ) as Record<`--${string}`, string>
}

export function clearThemeTokens(element = document.documentElement) {
  Object.values(cssVariableByToken).forEach((variable) => {
    element.style.removeProperty(variable)
  })
}
