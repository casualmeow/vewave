import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ModalGlassGeometry } from '@/shared/lib/modal-glass'
import {
  createModalGlassMaps,
  getModalGlassMutedForeground,
  getModalGlassStyle,
  modalGlassProfiles,
  resolveModalGlassMaterial,
  sampleModalGlass,
} from '@/shared/lib/modal-glass'
import { themePresets } from '@/shared/theme/presets'
import { getContrastRatio, hexToRgb } from '@/shared/theme/validators'
import { getThemeTokenStyle } from '@/shared/theme/resolver'

const geometry: ModalGlassGeometry = { width: 400, height: 300, radius: 24, intensity: 'balanced' }
afterEach(() => vi.restoreAllMocks())

describe('modal glass optics', () => {
  it('has a neutral frosted center, clear perimeter, and smoothly complementary weights', () => {
    expect(sampleModalGlass(geometry, 200, 150)).toMatchObject({
      x: 0,
      y: 0,
      core: 1,
      coverage: 1,
      rim: 0,
      height: 1,
    })
    expect(sampleModalGlass(geometry, 200, 0)).toMatchObject({ core: 0, height: 0 })
    expect(sampleModalGlass(geometry, 200, 12).core).toBeCloseTo(0.5)
    let previousCore = 0
    for (let y = 0; y <= 24; y += 0.25) {
      const sample = sampleModalGlass(geometry, 200, y)
      expect(sample.core).toBeGreaterThanOrEqual(previousCore)
      expect(sample.core - previousCore).toBeLessThan(0.02)
      expect(sample.core + (1 - sample.core)).toBe(1)
      previousCore = sample.core
    }
    expect(sampleModalGlass(geometry, -10, 150).coverage).toBe(0)
  })

  it('refracts inward with symmetric edges and rounded corners', () => {
    const left = sampleModalGlass(geometry, 3, 150)
    const right = sampleModalGlass(geometry, 397, 150)
    const top = sampleModalGlass(geometry, 200, 3)
    const bottom = sampleModalGlass(geometry, 200, 297)
    expect(left.x).toBeGreaterThan(0)
    expect(left.x).toBeCloseTo(-right.x)
    expect(top.y).toBeCloseTo(-bottom.y)
    expect(left.height).toBe(top.height)
    const corner = sampleModalGlass(geometry, 10, 10)
    expect(corner.x).toBeCloseTo(corner.y)
    expect(corner.x).toBeGreaterThan(0)
  })

  it.each(['subtle', 'balanced', 'strong'] as const)(
    'bounds actual optical displacement for %s',
    (intensity) => {
      const profile = modalGlassProfiles[intensity]
      let peak = 0
      for (let y = 0; y <= profile.bevel; y += 0.05) {
        const sample = sampleModalGlass({ ...geometry, intensity }, 200, y)
        peak = Math.max(peak, Math.hypot(sample.x, sample.y))
        expect(sample.height).toBeGreaterThanOrEqual(0)
        expect(sample.height).toBeLessThanOrEqual(1)
      }
      expect(peak).toBeLessThanOrEqual(profile.displacement)
      expect(peak).toBeGreaterThan(profile.displacement * 0.99)
    },
  )

  it('reuses geometry, bounds the cache, and preserves large-pane detail within 750,000 pixels', () => {
    const sizes: Array<number> = []
    const encode = vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockImplementation(function (
      this: HTMLCanvasElement,
    ) {
      return `data:image/png;${this.width}:${this.height}:${sizes.length}`
    })
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      createImageData(width: number, height: number) {
        sizes.push(width * height)
        return { data: new Uint8ClampedArray(width * height * 4) }
      },
      putImageData() {},
    } as unknown as CanvasRenderingContext2D)
    const small = { ...geometry, width: 100, height: 80 }
    const first = createModalGlassMaps(small)
    const encodes = encode.mock.calls.length
    expect(createModalGlassMaps(small)).toBe(first)
    expect(encode).toHaveBeenCalledTimes(encodes)
    for (let width = 101; width <= 108; width++) createModalGlassMaps({ ...small, width })
    expect(createModalGlassMaps(small)).not.toBe(first)
    createModalGlassMaps({ ...geometry, width: 8192, height: 4320 })
    expect(Math.max(...sizes)).toBeLessThanOrEqual(750_000)
    expect(Math.max(...sizes)).toBeGreaterThan(90_000)

    expect(sizes.filter((size) => size === 64 * 64)).toHaveLength(1)
  })
})

describe('smoked dialog readability', () => {
  const composite = (foreground: string, background: string, opacity: number) => {
    const front = hexToRgb(foreground)!
    const back = hexToRgb(background)!
    return `#${(['r', 'g', 'b'] as const)
      .map((channel) =>
        Math.round(front[channel] * opacity + back[channel] * (1 - opacity))
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')}`
  }

  it.each(themePresets)(
    'keeps $label body and helper text readable over bright and saturated content',
    (preset) => {
      for (const mode of ['light', 'dark'] as const) {
        const tokens = preset[mode]
        const muted = getModalGlassMutedForeground(tokens.mutedForeground, tokens.foreground)
        const scrim = mode === 'dark' ? 0.36 : 0.2
        for (const intensity of ['subtle', 'balanced', 'strong'] as const) {
          const material = resolveModalGlassMaterial(mode, intensity, tokens)

          const core = sampleModalGlass({ ...geometry, intensity }, 20, 150).core
          const tint = Math.min(1, core * material.tintCoreScale)
          const alpha = material.edgeTint + (material.centerTint - material.edgeTint) * tint
          expect(alpha).toBeCloseTo(material.centerTint)
          for (const backdrop of [
            '#FFFFFF',
            '#000000',
            '#FF0000',
            '#00FF00',
            '#0000FF',
            '#FFFF00',
            '#FF00FF',
            '#00FFFF',
          ]) {
            const behind = composite('#000000', backdrop, scrim)
            const pane = composite(tokens.popover, behind, alpha)
            for (const reflection of [0, material.bodyReflection]) {
              const lit = composite('#FFFFFF', pane, reflection)
              expect(
                getContrastRatio(tokens.foreground, lit),
                `${preset.id} ${mode} ${intensity} main`,
              ).toBeGreaterThanOrEqual(4.5)
              expect(
                getContrastRatio(muted, lit),
                `${preset.id} ${mode} ${intensity} helper`,
              ).toBeGreaterThanOrEqual(4.5)
            }
          }
        }
      }
    },
  )

  it('shares tint and scattering values between the native filter and CSS fallback', () => {
    for (const mode of ['light', 'dark'] as const) {
      for (const intensity of ['subtle', 'balanced', 'strong'] as const) {
        const material = resolveModalGlassMaterial(mode, intensity)
        const css = getModalGlassStyle(mode, intensity)
        expect(Number.parseFloat(css['--modal-glass-tint']) / 100).toBeCloseTo(material.centerTint)
        expect(Number.parseFloat(css['--modal-glass-blur'])).toBe(material.centerBlur)
        expect(material.edgeTint + material.coreTint * (1 - material.edgeTint)).toBeCloseTo(
          material.centerTint,
        )
      }
    }
  })

  it('derives dialog-only helper text without changing the saved Noir palette', () => {
    const noir = themePresets.find((preset) => preset.id === 'noir')!.dark
    const css = getThemeTokenStyle(noir)
    expect(css['--muted-foreground']).toBe('#9A9A9A')
    expect(css['--modal-muted-foreground']).toBe('#A9A9A9')
    expect(noir.background).toBe('#000000')
    expect(noir.popover).toBe('#111111')
  })
})
