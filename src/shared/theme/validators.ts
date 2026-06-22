type Rgb = {
  b: number
  g: number
  r: number
}

const shortHexPattern = /^#([\da-f]{3})$/i
const longHexPattern = /^#([\da-f]{6})$/i

export function normalizeHexColor(value: string) {
  const trimmed = value.trim()
  const shortMatch = trimmed.match(shortHexPattern)

  if (shortMatch) {
    const [, hex] = shortMatch
    return `#${hex
      .split('')
      .map((part) => `${part}${part}`)
      .join('')}`.toUpperCase()
  }

  if (longHexPattern.test(trimmed)) {
    return trimmed.toUpperCase()
  }

  return null
}

export function hexToRgb(value: string): Rgb | null {
  const normalized = normalizeHexColor(value)

  if (!normalized) {
    return null
  }

  return {
    r: Number.parseInt(normalized.slice(1, 3), 16),
    g: Number.parseInt(normalized.slice(3, 5), 16),
    b: Number.parseInt(normalized.slice(5, 7), 16),
  }
}

export function getRelativeLuminance(value: string) {
  const rgb = hexToRgb(value)

  if (!rgb) {
    return null
  }

  const toLinear = (channel: number) => {
    const normalized = channel / 255
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
  }

  const r = toLinear(rgb.r)
  const g = toLinear(rgb.g)
  const b = toLinear(rgb.b)

  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function getContrastRatio(foreground: string, background: string) {
  const foregroundLuminance = getRelativeLuminance(foreground)
  const backgroundLuminance = getRelativeLuminance(background)

  if (foregroundLuminance === null || backgroundLuminance === null) {
    return null
  }

  const lighter = Math.max(foregroundLuminance, backgroundLuminance)
  const darker = Math.min(foregroundLuminance, backgroundLuminance)

  return (lighter + 0.05) / (darker + 0.05)
}

export function meetsNormalTextContrast(foreground: string, background: string) {
  const ratio = getContrastRatio(foreground, background)
  return ratio !== null && ratio >= 4.5
}

export function getReadableForeground(background: string) {
  const dark = '#07101B'
  const light = '#FFFFFF'
  const darkContrast = getContrastRatio(dark, background) ?? 0
  const lightContrast = getContrastRatio(light, background) ?? 0

  return darkContrast >= lightContrast ? dark : light
}
