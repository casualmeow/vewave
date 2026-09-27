import { adaptEnvironmentSource, describeBackdropSource } from '../lens/backdrop-source'
import {
  probeCssBackdropFilterSupport,
  probeNativeSvgRefractionSupport,
  probeWebglSupport,
  resolveLensCapabilities,
} from '../lens/capability'
import { resolveLensBackend, toLegacyBackend } from '../lens/backend-resolution'
import type { LensBackendResolution, LensMaterialIntent } from '../lens/backend-resolution'
import type { LensSourceReadability } from '../lens/backdrop-source'
import type { FluidGlassBackend, FluidGlassEnvironmentSource } from '../types'

export type FluidGlassBackendOptions = {
  environment?: FluidGlassEnvironmentSource
  experimentalRefraction: boolean
  forceFallback: boolean
  quality: string
  reducedTransparency: boolean
  surfaceStyle: string
  webgl2: boolean
  activation: 'always' | 'appearance'
  transmissionPreferred?: boolean

  sourceReadability?: LensSourceReadability

  webglScopeAvailable?: boolean

  rendererHealthy?: boolean
}

export function supportsWebGl2() {
  return probeWebglSupport()
}

export function resolveFluidGlassBackendResolution({
  activation,
  environment,
  experimentalRefraction,
  forceFallback,
  quality,
  reducedTransparency,
  rendererHealthy = true,
  sourceReadability,
  surfaceStyle,
  transmissionPreferred = false,
  webgl2,
  webglScopeAvailable = true,
}: FluidGlassBackendOptions): LensBackendResolution {
  const source = adaptEnvironmentSource(environment)
  const descriptor = describeBackdropSource(source, sourceReadability)

  const capability = resolveLensCapabilities({
    cssBackdropFilter: probeCssBackdropFilterSupport(),
    nativeSvgRefraction: probeNativeSvgRefractionSupport(),
    nativeSvgExperimentalEnabled: surfaceStyle === 'glass' || experimentalRefraction,
    webgl: webgl2,
    reducedTransparency,
    reducedMotion: false,
    advancedEffectsAllowed:
      activation === 'always' || surfaceStyle === 'glass' || experimentalRefraction,
    webglScopeAvailable,
    rendererHealthy: rendererHealthy && !forceFallback,
  })

  const optedOut =
    quality === 'disabled' || (activation === 'appearance' && surfaceStyle === 'solid')
  const intent: LensMaterialIntent = optedOut
    ? 'solid'
    : transmissionPreferred
      ? 'transmission-experimental'
      : 'refractive'

  return resolveLensBackend({
    source: descriptor,
    capability,
    intent,

    allowExperimentalTransmission: transmissionPreferred,
  })
}

export function resolveFluidGlassBackend(options: FluidGlassBackendOptions): FluidGlassBackend {
  return toLegacyBackend(resolveFluidGlassBackendResolution(options).backend)
}
