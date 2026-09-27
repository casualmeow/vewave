import {
  cssVariableByToken,
  type AppearanceSettings,
  type EditableThemeTokenName,
  type GlassIntensity,
  type ResolvedAppearanceMode,
  type ThemeTokenOverrides,
  type ThemeTokens,
} from './contract'
import { getThemePreset } from './presets'
import { getReadableForeground, hexToRgb, normalizeHexColor } from './validators'
import { getModalGlassMutedForeground } from '@/shared/lib/modal-glass'
import { resolveGlassMaterial } from '@/shared/lib/glass-material'

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

  applyGlassIntensity(tokens, settings.glassIntensity, mode)

  return tokens
}

function applyGlassIntensity(
  tokens: ThemeTokens,
  intensity: GlassIntensity,
  mode: 'light' | 'dark',
) {
  const material = resolveGlassMaterial({ tokens, intensity, mode })
  tokens.glassBackground = withColorAlpha(tokens.glassBackground, material.tintOpacity)
  tokens.glassBorder = withColorAlpha(tokens.glassBorder, mode === 'light' ? 0.22 : 0.16)
  tokens.glassHighlight = withColorAlpha(tokens.glassHighlight, mode === 'light' ? 0.48 : 0.14)
}

function withColorAlpha(color: string, alpha: number) {
  const hex = hexToRgb(color)
  if (hex) return `rgba(${hex.r}, ${hex.g}, ${hex.b}, ${alpha})`
  const match = color.match(
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/,
  )

  if (!match) {
    return color
  }

  return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${alpha})`
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
  Object.entries(getThemeTokenStyle(tokens)).forEach(([variable, value]) => {
    element.style.setProperty(variable, value)
  })
}

export function getThemeTokenStyle(tokens: ThemeTokens) {
  return {
    ...Object.fromEntries(
      Object.entries(cssVariableByToken).map(([token, variable]) => [
        variable,
        tokens[token as keyof ThemeTokens],
      ]),
    ),
    '--modal-muted-foreground': getModalGlassMutedForeground(
      tokens.mutedForeground,
      tokens.foreground,
    ),
  } as Record<`--${string}`, string>
}

export function clearThemeTokens(element = document.documentElement) {
  Object.values(cssVariableByToken).forEach((variable) => {
    element.style.removeProperty(variable)
  })
  element.style.removeProperty('--modal-muted-foreground')
}
