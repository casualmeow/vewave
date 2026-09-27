import type {
  BackgroundSettings,
  ResolvedAppearanceMode,
  ThemeTokens,
} from '@/shared/theme/contract'
import { getContrastRatio, hexToRgb } from '@/shared/theme/validators'

export type BackdropPalette = { base: string; first: string; second: string }

function mix(from: string, to: string, amount: number) {
  const a = hexToRgb(from) ?? { r: 0, g: 0, b: 0 }
  const b = hexToRgb(to) ?? a
  const linear = (channel: number) => {
    const value = channel / 255
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  }
  const srgb = (value: number) =>
    Math.round(255 * (value <= 0.0031308 ? value * 12.92 : 1.055 * value ** (1 / 2.4) - 0.055))
  return `#${(['r', 'g', 'b'] as const)
    .map((key) =>
      srgb(linear(a[key]) + (linear(b[key]) - linear(a[key])) * amount)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`
}

export function resolveBackdropPalette(
  settings: BackgroundSettings,
  tokens: ThemeTokens,
  mode: ResolvedAppearanceMode,
): BackdropPalette {
  const background = hexToRgb(tokens.background)
  const neutral = background && background.r === background.g && background.g === background.b
  const anchor =
    mode === 'dark' ? (neutral ? '#000000' : '#05070B') : neutral ? '#FFFFFF' : '#FBFCFE'
  const readable = (color: string) =>
    [tokens.foreground, tokens.mutedForeground].every(
      (text) => (getContrastRatio(text, color) ?? 0) >= 4.5,
    )
  const bound = (color: string) => {
    let low = 0
    let high = 1
    for (let i = 0; i < 12; i++) {
      const middle = (low + high) / 2
      if (readable(mix(anchor, color, middle))) low = middle
      else high = middle
    }
    return mix(anchor, color, low)
  }

  const colors =
    settings.palette === 'custom'
      ? settings.colors
      : [tokens.primary, mix(tokens.primary, tokens.mutedForeground, 0.3)]
  const strength = 0.06 + settings.brightness * 0.34
  return {
    base: bound(mix(anchor, tokens.background, 0.8)),
    first: mix(anchor, bound(colors[0]), strength),
    second: mix(anchor, bound(colors[1]), strength),
  }
}
