import { describe, expect, it } from 'vitest'
import { resolveGlassMaterial, resolveGlassReadability } from '@/shared/lib/glass-material'
import { themePresets } from '@/shared/theme/presets'
import { getContrastRatio, hexToRgb } from '@/shared/theme/validators'

function composite(color: string, behind: number, alpha: number) {
  const rgb = hexToRgb(color)!
  return `#${(['r', 'g', 'b'] as const)
    .map((channel) =>
      Math.round(rgb[channel] * alpha + behind * (1 - alpha))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`
}

describe('unified glass material', () => {
  it.each(themePresets)('protects $label text against either backdrop extreme', (preset) => {
    for (const mode of ['light', 'dark'] as const) {
      const tokens = preset[mode]
      const material = resolveGlassMaterial({ mode, intensity: 'balanced', tokens, role: 'dialog' })
      for (const background of [0, 255]) {
        const pane = composite(material.tintColor, background, material.readabilityOpacity)
        const lit = composite(pane, 255, 1 - material.bodyReflection)
        for (const foreground of [tokens.foreground, material.mutedForeground]) {
          expect(getContrastRatio(foreground, pane)).toBeGreaterThanOrEqual(4.5)
          expect(getContrastRatio(foreground, lit)).toBeGreaterThanOrEqual(4.5)
        }
      }
      expect(material.tintOpacity).toBeLessThan(material.readabilityOpacity)
      expect(material.reflectionColor).toBe('#FFFFFF')
    }
  })

  it('keeps physically shallow panes independent of the viewport size', () => {
    const thin = resolveGlassMaterial({ mode: 'light', intensity: 'balanced', thickness: 'thin' })
    const thick = resolveGlassMaterial({ mode: 'light', intensity: 'balanced', thickness: 'thick' })
    expect(thin.ior).toBe(1.5)
    expect(thick.thickness).toBe(16)
    expect(thick.thickness).toBeGreaterThan(thin.thickness)
    expect(thick.bevel).toBe(24)
    expect(thick.centerBlur).toBeLessThan(8)
  })

  it('uses a dark readable recipe for media even in the light app theme', () => {
    const material = resolveGlassMaterial({ mode: 'light', intensity: 'balanced', role: 'media' })
    expect(material.tintColor).toBe('#111111')
    expect(material.readabilityOpacity).toBeGreaterThanOrEqual(0.78)
    expect(material.bodyReflection).toBe(0.04)
  })

  it('uses opaque protection when custom text colors cannot satisfy contrast', () => {
    expect(resolveGlassReadability('#FFFFFF', ['#FFFFFF'], 0.72)).toBe(1)
  })
})
