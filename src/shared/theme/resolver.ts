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

  applyGlassIntensity(tokens, settings.glassIntensity)

  return tokens
}

// Glass surfaces (sidebar, docks) read --glass-* variables; presets ship the
// "balanced" alphas, so subtle/strong scale translucency from those values.
const glassIntensityAlphaFactors: Record<
  GlassIntensity,
  { background: number; border: number; highlight: number } | null
> = {
  subtle: { background: 1.35, border: 0.85, highlight: 0.55 },
  balanced: null,
  strong: { background: 0.55, border: 1.25, highlight: 1.6 },
}

function applyGlassIntensity(tokens: ThemeTokens, intensity: GlassIntensity) {
  const factors = glassIntensityAlphaFactors[intensity]

  if (!factors) {
    return
  }

  tokens.glassBackground = scaleColorAlpha(tokens.glassBackground, factors.background)
  tokens.glassBorder = scaleColorAlpha(tokens.glassBorder, factors.border)
  tokens.glassHighlight = scaleColorAlpha(tokens.glassHighlight, factors.highlight)
}

function scaleColorAlpha(color: string, factor: number) {
  const match = color.match(
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/,
  )

  if (!match) {
    return color
  }

  const alpha = match[4] === undefined ? 1 : Number.parseFloat(match[4])
  const nextAlpha = Math.min(0.98, Math.max(0.04, alpha * factor))

  return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${Number(nextAlpha.toFixed(3))})`
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
