import { describe, expect, it } from 'vitest'

import {
  FLUID_GLASS_MATERIAL_PRESETS,
  FLUID_TRANSMISSION_MATERIAL_PRESETS,
  resolveFluidTransmissionMaterial,
} from '@/components/fluid-glass/constants'
import { resolveFluidGlassBackend } from '@/components/fluid-glass/renderer/backend'
import {
  isNeutralTransmissionMaterial,
  resolveTransmissionDebugMode,
  resolveTransmissionSupportLayers,
} from '@/components/fluid-glass/renderer/fluid-glass-transmission-renderer'
import { FluidGlassStore } from '@/components/fluid-glass/renderer/store'

const expressive = FLUID_TRANSMISSION_MATERIAL_PRESETS.expressive
const production = FLUID_TRANSMISSION_MATERIAL_PRESETS.production

describe('fluid glass transmission material contract', () => {
  it('maps presets to the expected renderer values', () => {
    for (const preset of [production, expressive]) {
      expect(preset.ior).toBeGreaterThan(1.1)
      expect(preset.ior).toBeLessThanOrEqual(1.25)
      // drei smears sample thickness by pow(roughness, 0.33); anything above
      // ~0.01 reads as milky fog instead of clear transmission.
      expect(preset.roughness).toBeLessThanOrEqual(0.01)
      expect(preset.anisotropy).toBe(0)
      expect(preset.distortion).toBe(0)
      expect(preset.temporalDistortion).toBe(0)
      expect(preset.attenuationColor).toBe('#ffffff')
      expect(preset.attenuationDistance).toBeGreaterThanOrEqual(1_000_000)
    }
    expect(expressive.chromaticAberration).toBeGreaterThan(production.chromaticAberration)
    expect(expressive.thickness).toBeGreaterThan(production.thickness)
  })

  it('merges overrides on top of the preset', () => {
    const material = resolveFluidTransmissionMaterial('production', { chromaticAberration: 0 })
    expect(material.chromaticAberration).toBe(0)
    expect(material.ior).toBe(production.ior)
  })

  it('treats a zero-dispersion white material as neutral', () => {
    expect(isNeutralTransmissionMaterial({ ...expressive, chromaticAberration: 0 })).toBe(true)
    expect(isNeutralTransmissionMaterial(expressive)).toBe(false)
  })

  it('disables every support layer in transmission isolation views', () => {
    for (const view of [
      'transmission-only',
      'transmission-red',
      'transmission-green',
      'transmission-blue',
      'curvature-weight',
      'dispersion-contribution',
      'final-dispersion',
    ] as const) {
      expect(resolveTransmissionSupportLayers(view, expressive)).toEqual({
        reflection: false,
        shadow: false,
      })
    }
  })

  it('keeps single-layer views and the final composition selective', () => {
    expect(resolveTransmissionSupportLayers('transmission-reflection', expressive)).toEqual({
      reflection: true,
      shadow: false,
    })
    expect(resolveTransmissionSupportLayers('transmission-shadow', expressive)).toEqual({
      reflection: false,
      shadow: true,
    })
    expect(resolveTransmissionSupportLayers('final', expressive)).toEqual({
      reflection: true,
      shadow: true,
    })
    expect(
      resolveTransmissionSupportLayers('final', { ...expressive, chromaticAberration: 0 }),
    ).toEqual({ reflection: false, shadow: false })
  })

  it('maps per-channel transmitted sample views to dedicated debug modes', () => {
    expect(resolveTransmissionDebugMode('final')).toBe(0)
    expect(resolveTransmissionDebugMode('transmission-red')).toBe(4)
    expect(resolveTransmissionDebugMode('transmission-green')).toBe(5)
    expect(resolveTransmissionDebugMode('transmission-blue')).toBe(6)
  })

  it('keeps SDF as the production backend unless transmission is explicitly preferred', () => {
    const supported = {
      activation: 'always' as const,
      environment: { type: 'theme' as const },
      experimentalRefraction: true,
      forceFallback: false,
      quality: 'auto',
      reducedTransparency: false,
      surfaceStyle: 'glass',
      webgl2: true,
    }
    expect(resolveFluidGlassBackend(supported)).toBe('sdf')
  })

  it('leaves scoped selection ownership untouched by material changes', () => {
    const store = new FluidGlassStore(true)
    store.registerTarget('A', { isConnected: true } as HTMLElement, {
      active: true,
      radius: 12,
      shape: 'rounded-rect',
    })
    const resolvedBefore = store.resolvedTarget?.id

    store.setResolvedMaterials(FLUID_GLASS_MATERIAL_PRESETS.expressive, expressive)

    expect(store.resolvedTarget?.id).toBe(resolvedBefore)
    expect(store.registry.getActiveTarget('default')?.id).toBe('A')
  })
})
