import type { LensCapabilitySnapshot } from './capability'
import type { LensSourceDescriptor } from './backdrop-source'
import type { FluidGlassBackend } from '../types'

export type LensBackend =
  | 'solid'
  | 'css-glass'
  | 'css-approximation'
  | 'native-svg'
  | 'sdf'
  | 'transmission-experimental'

export type LensBackendReason =
  | 'reduced-transparency'
  | 'renderer-failure'
  | 'source-unavailable'
  | 'source-unreadable'
  | 'source-readability-unknown'
  | 'advanced-effects-denied'
  | 'arbitrary-dom-pilot-policy'
  | 'arbitrary-dom-cannot-use-webgl'
  | 'native-svg-experimental-opt-in'
  | 'no-webgl'
  | 'webgl-scope-unavailable'
  | 'intent-solid'
  | 'intent-css'
  | 'transmission-not-allowed'
  | 'transmission-experimental-opt-in'
  | 'eligible-controlled-source'

export type LensResolutionPrecedence =
  | 'accessibility'
  | 'failure'
  | 'permission'
  | 'capability'
  | 'intent'
  | 'scope'

export type LensMaterialIntent = 'solid' | 'css' | 'refractive' | 'transmission-experimental'

export type LensBackendResolution = {
  backend: LensBackend
  reason: LensBackendReason
  precedence: LensResolutionPrecedence

  degraded: boolean

  accessibilityEnforced: boolean
  sourceCategory: LensSourceDescriptor['category']
}

export type LensBackendInput = {
  source: LensSourceDescriptor
  capability: LensCapabilitySnapshot
  intent: LensMaterialIntent

  allowExperimentalTransmission?: boolean
}

function fallbackChain(capability: LensCapabilitySnapshot): LensBackend {
  if (capability.reducedTransparency) return 'solid'
  if (!capability.cssBackdropBlur) return 'css-glass'
  return 'css-approximation'
}

type ResolutionFlags = { degraded: boolean; accessibilityEnforced?: boolean }

function resolution(
  backend: LensBackend,
  reason: LensBackendReason,
  precedence: LensResolutionPrecedence,
  source: LensSourceDescriptor,
  { degraded, accessibilityEnforced = false }: ResolutionFlags,
): LensBackendResolution {
  return {
    backend,
    reason,
    precedence,
    degraded,
    accessibilityEnforced,
    sourceCategory: source.category,
  }
}

function wantedRefraction(intent: LensMaterialIntent): boolean {
  return intent === 'refractive' || intent === 'transmission-experimental'
}

export function resolveLensBackend({
  source,
  capability,
  intent,
  allowExperimentalTransmission = false,
}: LensBackendInput): LensBackendResolution {
  if (capability.reducedTransparency) {
    return resolution('solid', 'reduced-transparency', 'accessibility', source, {
      degraded: false,
      accessibilityEnforced: true,
    })
  }

  if (intent === 'solid') {
    return resolution('solid', 'intent-solid', 'intent', source, { degraded: false })
  }

  if (!capability.rendererHealthy) {
    return resolution(fallbackChain(capability), 'renderer-failure', 'failure', source, {
      degraded: wantedRefraction(intent),
    })
  }
  if (source.category === 'unavailable') {
    return resolution(fallbackChain(capability), 'source-unavailable', 'failure', source, {
      degraded: wantedRefraction(intent),
    })
  }

  if (source.category === 'arbitrary-dom') {
    if (wantedRefraction(intent)) {
      if (capability.nativeSvgRefraction && capability.advancedEffectsAllowed) {
        return resolution('native-svg', 'native-svg-experimental-opt-in', 'capability', source, {
          degraded: false,
        })
      }
      return resolution(
        fallbackChain(capability),
        'arbitrary-dom-cannot-use-webgl',
        'capability',
        source,
        { degraded: true },
      )
    }

    return resolution(fallbackChain(capability), 'arbitrary-dom-pilot-policy', 'intent', source, {
      degraded: false,
    })
  }

  if (intent === 'css') {
    return resolution(fallbackChain(capability), 'intent-css', 'intent', source, {
      degraded: false,
    })
  }

  if (!source.textureEligible) {
    return resolution(
      fallbackChain(capability),
      source.readability === 'unknown' ? 'source-readability-unknown' : 'source-unreadable',
      'capability',
      source,
      { degraded: true },
    )
  }

  if (intent === 'transmission-experimental') {
    if (!allowExperimentalTransmission) {
      return resolution(
        fallbackChain(capability),
        'transmission-not-allowed',
        'permission',
        source,
        { degraded: true },
      )
    }
    if (!capability.webgl) {
      return resolution(fallbackChain(capability), 'no-webgl', 'capability', source, {
        degraded: true,
      })
    }
    if (!capability.advancedEffectsAllowed) {
      return resolution(
        fallbackChain(capability),
        'advanced-effects-denied',
        'permission',
        source,
        {
          degraded: true,
        },
      )
    }
    if (!capability.webglScopeAvailable) {
      return resolution(fallbackChain(capability), 'webgl-scope-unavailable', 'scope', source, {
        degraded: true,
      })
    }

    return resolution(
      'transmission-experimental',
      'transmission-experimental-opt-in',
      'intent',
      source,
      { degraded: false },
    )
  }

  if (!capability.advancedEffectsAllowed) {
    return resolution(fallbackChain(capability), 'advanced-effects-denied', 'permission', source, {
      degraded: true,
    })
  }
  if (!capability.webgl) {
    return resolution(fallbackChain(capability), 'no-webgl', 'capability', source, {
      degraded: true,
    })
  }
  if (!capability.webglScopeAvailable) {
    return resolution(fallbackChain(capability), 'webgl-scope-unavailable', 'scope', source, {
      degraded: true,
    })
  }

  return resolution('sdf', 'eligible-controlled-source', 'capability', source, { degraded: false })
}

export function toLegacyBackend(backend: LensBackend): FluidGlassBackend {
  if (backend === 'sdf') return 'sdf'
  if (backend === 'transmission-experimental') return 'transmission'
  return 'css'
}

export function isWebglBackend(backend: LensBackend): boolean {
  return backend === 'sdf' || backend === 'transmission-experimental'
}
