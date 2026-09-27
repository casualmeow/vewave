import type { GlassIntensity, ResolvedAppearanceMode, ThemeTokens } from '@/shared/theme/contract'
import { getContrastRatio, hexToRgb } from '@/shared/theme/validators'

export type GlassRole =
  | 'none'
  | 'shell'
  | 'header'
  | 'navigation'
  | 'dialog'
  | 'form'
  | 'sheet'
  | 'menu'
  | 'control'
  | 'media'

export const glassOpticalProfiles = {
  subtle: { centerBlur: 2, edgeBlur: 0.5, bevel: 18, displacement: 6, bodyRefraction: 2 },
  balanced: { centerBlur: 4, edgeBlur: 0.75, bevel: 24, displacement: 10, bodyRefraction: 3.5 },
  strong: { centerBlur: 6, edgeBlur: 1, bevel: 30, displacement: 14, bodyRefraction: 5 },
} as const

export function getGlassMutedForeground(muted: string, foreground: string) {
  const from = hexToRgb(muted)
  const to = hexToRgb(foreground)
  if (!from || !to) return foreground
  return `#${(['r', 'g', 'b'] as const)
    .map((channel) =>
      Math.round(from[channel] * 0.8 + to[channel] * 0.2)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`.toUpperCase()
}

function composite(tint: string, backdrop: number, alpha: number) {
  const rgb = hexToRgb(tint)
  if (!rgb) return tint
  return `#${(['r', 'g', 'b'] as const)
    .map((channel) =>
      Math.round(rgb[channel] * alpha + backdrop * (1 - alpha))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`
}

export function resolveGlassReadability(
  tint: string,
  foregrounds: Array<string>,
  minimum: number,
  reflection = 0,
) {
  const readable = (alpha: number) =>
    [0, 255].every((backdrop) =>
      foregrounds.every((text) => {
        const pane = composite(tint, backdrop, alpha)
        const lit = composite(pane, 255, 1 - reflection)
        return (getContrastRatio(text, lit) ?? 0) >= 4.5
      }),
    )
  if (readable(minimum)) return minimum
  if (!readable(1)) return 1
  let low = minimum
  let high = 1
  for (let i = 0; i < 12; i++) {
    const mid = (low + high) / 2
    if (readable(mid)) high = mid
    else low = mid
  }
  return Math.ceil(high * 1000) / 1000
}

export type GlassMaterialOptions = {
  mode: ResolvedAppearanceMode
  intensity: GlassIntensity
  tokens?: Partial<ThemeTokens>
  role?: GlassRole
  thickness?: 'thin' | 'regular' | 'thick'
  elevation?: 'embedded' | 'raised' | 'floating'
}

export function resolveGlassMaterial({
  mode,
  intensity,
  tokens = {},
  role = 'none',
  thickness = 'regular',
  elevation = 'raised',
}: GlassMaterialOptions) {
  const dark = role === 'media' || mode === 'dark'
  const tintColor =
    (role === 'media'
      ? tokens.mediaBackground
      : role === 'navigation'
        ? tokens.sidebar
        : role === 'header'
          ? tokens.header
          : role === 'shell'
            ? tokens.card
            : tokens.popover) ?? (dark ? '#111111' : '#FAFCFF')
  const foreground =
    (role === 'media' ? tokens.mediaForeground : tokens.foreground) ??
    (dark ? '#E5E5E5' : '#18212B')
  const mutedForeground = getGlassMutedForeground(
    tokens.mutedForeground ?? (dark ? '#A3A3A3' : '#46515E'),
    foreground,
  )
  return {
    ...glassOpticalProfiles[intensity],
    ior: 1.5,
    roughness: { subtle: 0.035, balanced: 0.05, strong: 0.075 }[intensity],
    thickness: { thin: 6, regular: 10, thick: 16 }[thickness],
    dispersion: { subtle: 0.002, balanced: 0.004, strong: 0.006 }[intensity],
    tintColor,
    reflectionColor: '#FFFFFF',
    shadowColor: dark ? '#000000' : '#24303D',
    tintOpacity: { subtle: 0.12, balanced: 0.08, strong: 0.06 }[intensity],
    readabilityOpacity: resolveGlassReadability(
      tintColor,
      [foreground, mutedForeground],
      dark ? 0.78 : 0.72,
      dark ? 0.04 : 0,
    ),
    mutedForeground,
    bodyReflection: dark ? 0.04 : 0.08,
    shadowOpacity: (dark ? 1.5 : 1) * { embedded: 0.06, raised: 0.1, floating: 0.18 }[elevation],
  }
}

export type ResolvedGlassMaterial = ReturnType<typeof resolveGlassMaterial>

export function readGlassThemeTokens(element?: HTMLElement): Partial<ThemeTokens> {
  if (typeof document === 'undefined' || typeof getComputedStyle === 'undefined') return {}
  const style = getComputedStyle(element ?? document.documentElement)
  const names = {
    background: '--background',
    card: '--card',
    popover: '--popover',
    foreground: '--foreground',
    mutedForeground: '--muted-foreground',
    primary: '--primary',
    sidebar: '--sidebar',
    header: '--header',
    mediaBackground: '--media-background',
    mediaForeground: '--media-foreground',
  } as const
  return Object.fromEntries(
    Object.entries(names)
      .map(([key, variable]) => [key, style.getPropertyValue(variable).trim()])
      .filter(([, value]) => value),
  )
}
