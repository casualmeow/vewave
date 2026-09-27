import { supportsLiquidGlassRefraction } from '@/shared/lib/liquid-glass'

export type LensCapabilityInputs = {
  cssBackdropFilter: boolean
  nativeSvgRefraction: boolean
  webgl: boolean
  reducedMotion: boolean
  reducedTransparency: boolean

  advancedEffectsAllowed: boolean

  webglScopeAvailable: boolean

  rendererHealthy: boolean

  nativeSvgExperimentalEnabled: boolean
}

export type LensCapabilityNote =
  | 'reduced-transparency'
  | 'reduced-motion'
  | 'advanced-effects-denied'
  | 'no-webgl'
  | 'no-css-backdrop-filter'
  | 'no-native-svg-refraction'
  | 'native-svg-not-opted-in'
  | 'webgl-scope-taken'
  | 'renderer-unhealthy'

export type LensCapabilitySnapshot = {
  cssBackdropBlur: boolean

  nativeSvgRefraction: boolean

  webgl: boolean
  reducedMotion: boolean
  reducedTransparency: boolean
  advancedEffectsAllowed: boolean
  webglScopeAvailable: boolean
  rendererHealthy: boolean

  webglUsable: boolean
  notes: ReadonlyArray<LensCapabilityNote>
}

const defaultInputs: LensCapabilityInputs = {
  cssBackdropFilter: false,
  nativeSvgRefraction: false,
  webgl: false,
  reducedMotion: false,
  reducedTransparency: false,
  advancedEffectsAllowed: true,
  webglScopeAvailable: true,
  rendererHealthy: true,
  nativeSvgExperimentalEnabled: false,
}

export function resolveLensCapabilities(
  overrides: Partial<LensCapabilityInputs> = {},
): LensCapabilitySnapshot {
  const inputs = { ...defaultInputs, ...overrides }
  const notes: Array<LensCapabilityNote> = []

  if (inputs.reducedTransparency) notes.push('reduced-transparency')
  if (inputs.reducedMotion) notes.push('reduced-motion')
  if (!inputs.advancedEffectsAllowed) notes.push('advanced-effects-denied')
  if (!inputs.cssBackdropFilter) notes.push('no-css-backdrop-filter')
  if (!inputs.webgl) notes.push('no-webgl')
  if (!inputs.nativeSvgRefraction) notes.push('no-native-svg-refraction')
  else if (!inputs.nativeSvgExperimentalEnabled) notes.push('native-svg-not-opted-in')
  if (!inputs.webglScopeAvailable) notes.push('webgl-scope-taken')
  if (!inputs.rendererHealthy) notes.push('renderer-unhealthy')

  return {
    cssBackdropBlur: inputs.cssBackdropFilter,

    nativeSvgRefraction: inputs.nativeSvgRefraction && inputs.nativeSvgExperimentalEnabled,
    webgl: inputs.webgl,
    reducedMotion: inputs.reducedMotion,
    reducedTransparency: inputs.reducedTransparency,
    advancedEffectsAllowed: inputs.advancedEffectsAllowed,
    webglScopeAvailable: inputs.webglScopeAvailable,
    rendererHealthy: inputs.rendererHealthy,
    webglUsable:
      inputs.webgl &&
      inputs.advancedEffectsAllowed &&
      !inputs.reducedTransparency &&
      inputs.rendererHealthy &&
      inputs.webglScopeAvailable,
    notes,
  }
}

let cachedWebglProbe: boolean | undefined
let cachedBackdropFilterProbe: boolean | undefined

export function probeWebglSupport(): boolean {
  if (typeof document === 'undefined') return false
  if (cachedWebglProbe !== undefined) return cachedWebglProbe

  try {
    const context = document.createElement('canvas').getContext('webgl2')
    cachedWebglProbe = Boolean(context)

    context?.getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    cachedWebglProbe = false
  }
  return cachedWebglProbe
}

export function probeCssBackdropFilterSupport(): boolean {
  if (cachedBackdropFilterProbe !== undefined) return cachedBackdropFilterProbe
  if (typeof CSS === 'undefined' || typeof CSS.supports !== 'function') {
    cachedBackdropFilterProbe = false
    return false
  }
  cachedBackdropFilterProbe =
    CSS.supports('backdrop-filter', 'blur(4px)') ||
    CSS.supports('-webkit-backdrop-filter', 'blur(4px)')
  return cachedBackdropFilterProbe
}

export function probeNativeSvgRefractionSupport(): boolean {
  return supportsLiquidGlassRefraction()
}

export function resetCapabilityProbeCache() {
  cachedWebglProbe = undefined
  cachedBackdropFilterProbe = undefined
}

export type LensEnvironmentProbe = Pick<
  LensCapabilityInputs,
  'cssBackdropFilter' | 'nativeSvgRefraction' | 'webgl'
>

export function probeLensEnvironment(): LensEnvironmentProbe {
  return {
    cssBackdropFilter: probeCssBackdropFilterSupport(),
    nativeSvgRefraction: probeNativeSvgRefractionSupport(),
    webgl: probeWebglSupport(),
  }
}
