import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { FLUID_GLASS_MATERIAL_PRESETS } from '@/components/fluid-glass/constants'
import { FluidGlassFallbackLens } from '@/components/fluid-glass/ui/fallback-lens'

const material = FLUID_GLASS_MATERIAL_PRESETS.production

function renderLens(
  lightDirection: readonly [number, number],
  overrides: Partial<typeof material> = {},
  backend: 'css-approximation' | 'css-glass' = 'css-approximation',
) {
  const template = document.createElement('template')
  template.innerHTML = renderToStaticMarkup(
    <FluidGlassFallbackLens
      backend={backend}
      reason="intent-css"
      material={{ ...material, ...overrides }}
      lightDirection={lightDirection}
    />,
  )
  return template.content.querySelector<HTMLElement>('[data-fluid-glass-material-body]')!
}

function declaration(body: HTMLElement, property: string) {
  const value = body.getAttribute('style')?.match(new RegExp(`(?:^|;)${property}:([^;]+)`))?.[1]
  expect(value, `${property} must be declared on the material body`).toBeDefined()
  return value!
}

describe('fallback lens shares the light model of the real lens', () => {
  it('places the specular highlight on the side the light comes from', () => {
    const fromUpperLeft = renderLens([-0.72, 0.68])
    const fromUpperRight = renderLens([0.72, 0.68])
    const originOf = (body: HTMLElement) => {
      const sheen = body.querySelector<HTMLElement>('[data-fluid-glass-fallback-layer="sheen"]')!
      const match = declaration(sheen, 'background').match(/at ([\d.]+)% ([\d.]+)%/)
      expect(match).not.toBeNull()
      return { x: Number(match?.[1]), y: Number(match?.[2]) }
    }
    const left = originOf(fromUpperLeft)
    const right = originOf(fromUpperRight)
    expect(left.x).toBeLessThan(50)
    expect(right.x).toBeGreaterThan(50)
    expect(left.y).toBeLessThan(50)
    expect(right.y).toBeLessThan(50)
  })

  it('increases shadow depth with thickness and derives rim and absorption from the material', () => {
    const shadowOf = (overrides: Partial<typeof material>) =>
      declaration(renderLens([-0.72, 0.68], overrides), 'box-shadow')
    const shadowSpread = (shadow: string) => {
      const match = shadow.match(/\) ([\d.]+)px -([\d.]+)px color-mix/)
      expect(match).not.toBeNull()
      return Number(match?.[1])
    }
    expect(shadowSpread(shadowOf({ physicalThickness: 0.9 }))).toBeGreaterThan(
      shadowSpread(shadowOf({ physicalThickness: 0.2 })),
    )
    const weights = (shadow: string, token: string) =>
      [...shadow.matchAll(new RegExp(`var\\(${token}\\) ([\\d.]+)%`, 'g'))].map((match) =>
        Number(match[1]),
      )
    const rim = (strength: number) =>
      weights(shadowOf({ rimIntensity: strength }), '--glass-highlight')
    const absorption = (strength: number) =>
      weights(shadowOf({ shadowStrength: strength }), '--material-shadow-color')
    expect(rim(0.2)).toHaveLength(2)
    expect(rim(0.9)[1]).toBeGreaterThan(rim(0.2)[1])
    expect(absorption(0.2)).toHaveLength(2)
    expect(absorption(0.9)[0]).toBeGreaterThan(absorption(0.2)[0])
    expect(absorption(0.9)[1]).toBeGreaterThan(absorption(0.2)[1])
  })

  it('uses shared scattering and saturation tokens when backdrop compositing is available', () => {
    const body = renderLens([-0.72, 0.68])
    expect(declaration(body, 'backdrop-filter')).toContain(
      'blur(calc(var(--glass-blur-base, 3px) * var(--lens-scattering, 0.7)))',
    )
    expect(declaration(body, 'backdrop-filter')).toContain('saturate(var(--glass-saturate, 110%))')
  })

  it('drops backdrop filtering when the tier cannot composite it', () => {
    const body = renderLens([-0.72, 0.68], {}, 'css-glass')
    expect(declaration(body, 'backdrop-filter')).toBe('none')
    expect(body.querySelector('[data-fluid-glass-fallback-layer="rim"]')).not.toBeNull()
    expect(body.querySelector('[data-fluid-glass-fallback-layer="sheen"]')).not.toBeNull()
  })
})

describe('SDF material presets stay in the legible range', () => {
  it.each(['production', 'expressive', 'dragPeak'] as const)(
    '%s keeps scattering and roughness low enough to read as glass',
    (preset) => {
      const values = FLUID_GLASS_MATERIAL_PRESETS[preset]
      expect(values.scattering).toBeLessThanOrEqual(0.2)
      expect(values.roughness).toBeLessThanOrEqual(0.08)
    },
  )

  it.each(['production', 'expressive', 'dragPeak'] as const)(
    '%s carries enough rim, internal reflection and thickness to read as a volume',
    (preset) => {
      const values = FLUID_GLASS_MATERIAL_PRESETS[preset]
      expect(values.rimIntensity).toBeGreaterThanOrEqual(0.2)
      expect(values.internalReflection).toBeGreaterThanOrEqual(0.25)
      expect(values.physicalThickness).toBeGreaterThanOrEqual(0.3)
      expect(values.ior).toBeGreaterThan(1.1)
    },
  )
})
