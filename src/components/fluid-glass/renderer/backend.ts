import type { FluidGlassBackend, FluidGlassEnvironmentSource } from '../types'

let cachedWebGl2Support: boolean | undefined

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
}

export function supportsWebGl2() {
  if (typeof document === 'undefined') return false
  if (cachedWebGl2Support !== undefined) return cachedWebGl2Support

  try {
    const context = document.createElement('canvas').getContext('webgl2')
    const supported = Boolean(context)
    context?.getExtension('WEBGL_lose_context')?.loseContext()
    cachedWebGl2Support = supported
    return cachedWebGl2Support
  } catch {
    cachedWebGl2Support = false
    return false
  }
}

export function resolveFluidGlassBackend({
  activation,
  environment,
  experimentalRefraction,
  forceFallback,
  quality,
  reducedTransparency,
  surfaceStyle,
  webgl2,
  transmissionPreferred = false,
}: FluidGlassBackendOptions): FluidGlassBackend {
  if (activation === 'appearance' && surfaceStyle === 'solid') return 'css'

  const appearanceAllowsGpu = activation === 'always' || experimentalRefraction

  if (
    !environment ||
    !appearanceAllowsGpu ||
    forceFallback ||
    quality === 'disabled' ||
    reducedTransparency ||
    !webgl2
  ) {
    return 'css'
  }

  return transmissionPreferred ? 'transmission' : 'sdf'
}
