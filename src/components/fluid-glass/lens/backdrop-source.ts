import type { FluidGlassEnvironmentSource } from '../types'

export type LensBackdropSourceKind =
  | 'auto-dom'
  | 'theme'
  | 'image'
  | 'canvas'
  | 'video'
  | 'renderer-texture'
  | 'controlled-surface'
  | 'unavailable'

export type LensSourceCategory =
  | 'arbitrary-dom'
  | 'controlled-readable'
  | 'controlled-unreadable'
  | 'synthetic-environment'
  | 'unavailable'

export type LensSourceLifecycle = 'static' | 'event-driven' | 'per-frame' | 'externally-managed'

export type LensSourceReadability = 'unknown' | 'readable' | 'unreadable' | 'failed' | 'unavailable'

export type LensCrossOrigin = 'anonymous' | 'use-credentials' | null

export type LensBackdropSource =
  | { kind: 'auto-dom' }
  | { kind: 'theme'; pattern?: 'calm' | 'grid'; tone?: 'auto' | 'light' | 'dark' }
  | { kind: 'image'; src: string; crossOrigin?: LensCrossOrigin }
  | { kind: 'canvas'; canvas: HTMLCanvasElement | null }
  | {
      kind: 'video'
      src?: string
      crossOrigin?: LensCrossOrigin
      element?: HTMLVideoElement | null
    }
  | { kind: 'renderer-texture'; textureId: string }
  | { kind: 'controlled-surface'; surfaceId: string }
  | { kind: 'unavailable'; reason?: string }

type SourceTraits = {
  category: LensSourceCategory
  lifecycle: LensSourceLifecycle
  initialReadability: LensSourceReadability

  implemented: boolean

  knownReadable: boolean
}

const sourceTraits: Record<LensBackdropSourceKind, SourceTraits> = {
  'auto-dom': {
    category: 'arbitrary-dom',
    lifecycle: 'event-driven',
    initialReadability: 'unreadable',
    implemented: true,
    knownReadable: false,
  },
  theme: {
    category: 'synthetic-environment',
    lifecycle: 'static',
    initialReadability: 'readable',
    implemented: true,
    knownReadable: true,
  },
  image: {
    category: 'controlled-readable',
    lifecycle: 'static',
    initialReadability: 'unknown',
    implemented: true,
    knownReadable: false,
  },
  canvas: {
    category: 'controlled-readable',
    lifecycle: 'per-frame',
    initialReadability: 'unknown',
    implemented: false,
    knownReadable: false,
  },
  video: {
    category: 'controlled-readable',
    lifecycle: 'per-frame',
    initialReadability: 'unknown',
    implemented: false,
    knownReadable: false,
  },
  'renderer-texture': {
    category: 'controlled-readable',
    lifecycle: 'externally-managed',
    initialReadability: 'unknown',
    implemented: false,
    knownReadable: false,
  },
  'controlled-surface': {
    category: 'controlled-readable',
    lifecycle: 'event-driven',
    initialReadability: 'unknown',
    implemented: false,
    knownReadable: false,
  },
  unavailable: {
    category: 'unavailable',
    lifecycle: 'static',
    initialReadability: 'unavailable',
    implemented: true,
    knownReadable: false,
  },
}

export type LensSourceDescriptor = {
  kind: LensBackdropSourceKind
  category: LensSourceCategory
  lifecycle: LensSourceLifecycle
  readability: LensSourceReadability

  textureEligible: boolean

  corsEligible: boolean
  implemented: boolean
}

export function getSourceTraits(kind: LensBackdropSourceKind): SourceTraits {
  return sourceTraits[kind]
}

export function initialReadabilityFor(source: LensBackdropSource): LensSourceReadability {
  return sourceTraits[source.kind].initialReadability
}

export function isCorsEligible(source: LensBackdropSource): boolean {
  if (source.kind === 'image' || source.kind === 'video') {
    const src = 'src' in source ? source.src : undefined
    if (!src) return source.kind === 'video'
    if (source.crossOrigin === 'anonymous' || source.crossOrigin === 'use-credentials') return true
    if (src.startsWith('data:') || src.startsWith('blob:')) return true
    if (src.startsWith('/') || src.startsWith('./') || src.startsWith('../')) return true
    if (typeof window === 'undefined') return !/^https?:\/\//.test(src)
    try {
      return new URL(src, window.location.href).origin === window.location.origin
    } catch {
      return false
    }
  }
  return sourceTraits[source.kind].category !== 'arbitrary-dom'
}

export function describeBackdropSource(
  source: LensBackdropSource,
  readability: LensSourceReadability = initialReadabilityFor(source),
): LensSourceDescriptor {
  const traits = sourceTraits[source.kind]
  const corsEligible = isCorsEligible(source)

  let category = traits.category
  if (readability === 'unavailable') category = 'unavailable'
  else if (
    traits.category === 'controlled-readable' &&
    (readability === 'unreadable' || readability === 'failed' || !corsEligible)
  ) {
    category = 'controlled-unreadable'
  }

  const confirmedReadable =
    (traits.knownReadable && category === 'synthetic-environment') ||
    (category === 'controlled-readable' && readability === 'readable' && corsEligible)

  return {
    kind: source.kind,
    category,
    lifecycle: traits.lifecycle,
    readability,
    textureEligible: confirmedReadable && traits.implemented,
    corsEligible,
    implemented: traits.implemented,
  }
}

export type LensReadabilityEvent =
  | 'probe-readable'
  | 'probe-unreadable'
  | 'load-failed'
  | 'source-removed'
  | 'reset'

const readabilityTransitions: Record<
  LensSourceReadability,
  Partial<Record<LensReadabilityEvent, LensSourceReadability>>
> = {
  unknown: {
    'probe-readable': 'readable',
    'probe-unreadable': 'unreadable',
    'load-failed': 'failed',
    'source-removed': 'unavailable',
  },
  readable: {
    'probe-unreadable': 'unreadable',
    'load-failed': 'failed',
    'source-removed': 'unavailable',
    reset: 'unknown',
  },
  unreadable: {
    'probe-readable': 'readable',
    'load-failed': 'failed',
    'source-removed': 'unavailable',
    reset: 'unknown',
  },

  failed: { 'source-removed': 'unavailable', reset: 'unknown' },
  unavailable: { reset: 'unknown' },
}

export function advanceReadability(
  current: LensSourceReadability,
  event: LensReadabilityEvent,
): LensSourceReadability {
  return readabilityTransitions[current][event] ?? current
}

export function sourceIdentity(source: LensBackdropSource): string {
  switch (source.kind) {
    case 'image':
      return `image:${source.src}:${source.crossOrigin ?? 'none'}`
    case 'video':
      return `video:${source.src ?? 'element'}:${source.crossOrigin ?? 'none'}`
    case 'theme':
      return `theme:${source.pattern ?? 'calm'}:${source.tone ?? 'auto'}`
    case 'renderer-texture':
      return `renderer-texture:${source.textureId}`
    case 'controlled-surface':
      return `controlled-surface:${source.surfaceId}`
    default:
      return source.kind
  }
}

export type LensReadabilityProbe = {
  result: Promise<LensReadabilityEvent>

  cancel: () => void
}

export function probeImageReadability(
  src: string,
  crossOrigin: LensCrossOrigin = null,
): LensReadabilityProbe {
  if (typeof document === 'undefined' || typeof Image === 'undefined') {
    return { result: Promise.resolve('probe-unreadable'), cancel: () => undefined }
  }

  const image = new Image()
  let settle: (event: LensReadabilityEvent) => void = () => undefined
  let settled = false

  const result = new Promise<LensReadabilityEvent>((resolve) => {
    settle = (event) => {
      if (settled) return
      settled = true
      resolve(event)
    }
  })

  const detach = () => {
    image.onload = null
    image.onerror = null
  }

  image.onload = () => {
    detach()
    try {
      const canvas = document.createElement('canvas')
      canvas.width = 1
      canvas.height = 1
      const context = canvas.getContext('2d', { willReadFrequently: true })
      if (!context) {
        settle('probe-unreadable')
        return
      }
      context.drawImage(image, 0, 0, 1, 1)

      context.getImageData(0, 0, 1, 1)
      settle('probe-readable')
    } catch {
      settle('probe-unreadable')
    }
  }
  image.onerror = () => {
    detach()
    settle('load-failed')
  }

  if (crossOrigin) image.crossOrigin = crossOrigin
  image.src = src

  return {
    result,
    cancel: () => {
      detach()
      settle('probe-unreadable')
    },
  }
}

export function adaptEnvironmentSource(
  environment: FluidGlassEnvironmentSource | undefined,
): LensBackdropSource {
  if (!environment) return { kind: 'unavailable', reason: 'no environment configured' }
  if (environment.type === 'auto-dom') return { kind: 'auto-dom' }
  if (environment.type === 'image') return { kind: 'image', src: environment.src }
  return { kind: 'theme', pattern: environment.pattern, tone: environment.tone }
}
