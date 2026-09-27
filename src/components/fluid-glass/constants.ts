import type {
  FluidGlassMaterial,
  FluidGlassMaterialPreset,
  FluidGlassQuality,
  FluidTransmissionMaterial,
} from './types'

export const FLUID_GLASS_QUALITY = {
  low: {
    dpr: 1,
    framebufferScale: 0.5,
    scatterSamples: 2,
  },
  medium: {
    dpr: 1.25,
    framebufferScale: 0.7,
    scatterSamples: 4,
  },
  high: {
    dpr: 1.5,
    framebufferScale: 1,
    scatterSamples: 6,
  },
} as const

export const FLUID_GLASS_MATERIAL_PRESETS: Record<FluidGlassMaterialPreset, FluidGlassMaterial> = {
  production: {
    edgeWidthRatio: 0.13,
    rimWidthRatio: 0.032,
    internalReflectionWidthRatio: 0.055,
    shadowWidthRatio: 0.22,
    minimumEdgeWidth: 2.5,
    maximumEdgeWidth: 10,
    ior: 1.19,
    dispersionIor: 0.006,
    physicalThickness: 0.34,
    surfaceCurvature: 1.06,
    viewDepth: 1.05,
    bulge: 0.32,
    roughness: 0.045,
    scattering: 0.14,
    dispersionPx: 1,
    rimIntensity: 0.42,
    internalReflection: 0.4,
    shadowStrength: 0.46,
    tintOpacity: 0.01,
  },

  expressive: {
    edgeWidthRatio: 0.13,
    rimWidthRatio: 0.042,
    internalReflectionWidthRatio: 0.058,
    shadowWidthRatio: 0.18,
    minimumEdgeWidth: 3,
    maximumEdgeWidth: 12,
    ior: 1.22,
    dispersionIor: 0.007,
    physicalThickness: 0.44,
    surfaceCurvature: 1.34,
    viewDepth: 1.15,
    bulge: 0.46,
    roughness: 0.03,
    scattering: 0.07,
    dispersionPx: 1.25,

    rimIntensity: 0.56,
    internalReflection: 0.4,
    shadowStrength: 0.26,
    tintOpacity: 0.004,
  },
  dragPeak: {
    edgeWidthRatio: 0.15,
    rimWidthRatio: 0.03,
    internalReflectionWidthRatio: 0.06,
    shadowWidthRatio: 0.22,
    minimumEdgeWidth: 2.5,
    maximumEdgeWidth: 13,
    ior: 1.18,
    dispersionIor: 0.008,
    physicalThickness: 0.42,
    surfaceCurvature: 1.42,
    viewDepth: 1.08,
    bulge: 0.48,
    roughness: 0.045,
    scattering: 0.1,
    dispersionPx: 1.45,
    rimIntensity: 0.2,
    internalReflection: 0.27,
    shadowStrength: 0.3,
    tintOpacity: 0.006,
  },
}

export const FLUID_TRANSMISSION_MATERIAL_PRESETS: Record<
  FluidGlassMaterialPreset,
  FluidTransmissionMaterial
> = {
  production: {
    ior: 1.16,
    thickness: 0.28,
    roughness: 0.005,
    anisotropy: 0,
    chromaticAberration: 0.04,
    distortion: 0,
    distortionScale: 0,
    temporalDistortion: 0,
    attenuationDistance: 1_000_000,
    attenuationColor: '#ffffff',
  },
  expressive: {
    ior: 1.2,
    thickness: 0.4,
    roughness: 0.005,
    anisotropy: 0,
    chromaticAberration: 0.07,
    distortion: 0,
    distortionScale: 0,
    temporalDistortion: 0,
    attenuationDistance: 1_000_000,
    attenuationColor: '#ffffff',
  },
  dragPeak: {
    ior: 1.22,
    thickness: 0.48,
    roughness: 0.01,
    anisotropy: 0,
    chromaticAberration: 0.1,
    distortion: 0.04,
    distortionScale: 0.12,
    temporalDistortion: 0.01,
    attenuationDistance: 1_000_000,
    attenuationColor: '#ffffff',
  },
}

export function resolveFluidGlassMaterial(
  preset: FluidGlassMaterialPreset,
  overrides?: Partial<FluidGlassMaterial>,
) {
  return { ...FLUID_GLASS_MATERIAL_PRESETS[preset], ...overrides }
}

export function resolveFluidTransmissionMaterial(
  preset: FluidGlassMaterialPreset,
  overrides?: Partial<FluidTransmissionMaterial>,
) {
  return { ...FLUID_TRANSMISSION_MATERIAL_PRESETS[preset], ...overrides }
}

export const FLUID_GLASS_SPRING = {
  stiffness: 430,
  damping: 34,
} as const

export const FLUID_GLASS_REDUCED_MOTION_LERP = 0.72

export function resolveFluidGlassQuality(quality: FluidGlassQuality) {
  if (quality !== 'auto') return FLUID_GLASS_QUALITY[quality]

  if (typeof navigator === 'undefined') return FLUID_GLASS_QUALITY.medium

  const memory = 'deviceMemory' in navigator ? Number(navigator.deviceMemory) : 4
  const cores = navigator.hardwareConcurrency || 4

  if (memory <= 4 || cores <= 4) return FLUID_GLASS_QUALITY.low
  if (memory >= 8 && cores >= 8) return FLUID_GLASS_QUALITY.high
  return FLUID_GLASS_QUALITY.medium
}
