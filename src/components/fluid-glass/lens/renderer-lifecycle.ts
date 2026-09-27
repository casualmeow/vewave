export type LensRendererLifecycleState =
  | 'idle'
  | 'creating'
  | 'ready'
  | 'context-lost'
  | 'recovering'
  | 'terminal-fallback'
  | 'disposed'

export const LENS_RENDERER_TRANSITIONS: Readonly<
  Record<LensRendererLifecycleState, ReadonlyArray<LensRendererLifecycleState>>
> = {
  idle: ['creating', 'disposed'],
  creating: ['ready', 'context-lost', 'terminal-fallback', 'disposed'],
  ready: ['context-lost', 'terminal-fallback', 'disposed'],
  'context-lost': ['recovering', 'terminal-fallback', 'disposed'],
  recovering: ['ready', 'context-lost', 'terminal-fallback', 'disposed'],
  'terminal-fallback': ['disposed'],
  disposed: [],
}

export function canTransition(
  from: LensRendererLifecycleState,
  to: LensRendererLifecycleState,
): boolean {
  return LENS_RENDERER_TRANSITIONS[from].includes(to)
}

export function isRendererHealthy(state: LensRendererLifecycleState): boolean {
  return state === 'creating' || state === 'ready'
}

export type LensDisposalKind = 'listener' | 'resource' | 'canvas' | 'scope'

export type LensDisposalReport = Readonly<Record<LensDisposalKind, number>>

export type LensRendererLifecycleListener = (
  state: LensRendererLifecycleState,
  reason: string,
) => void

export class RendererLifecycleController {
  private currentState: LensRendererLifecycleState = 'idle'
  private lastReason = 'initial'
  private readonly listeners = new Set<LensRendererLifecycleListener>()
  private readonly teardowns = new Map<LensDisposalKind, Array<() => void>>()
  private released: LensDisposalReport = {
    listener: 0,
    resource: 0,
    canvas: 0,
    scope: 0,
  }

  get state(): LensRendererLifecycleState {
    return this.currentState
  }

  get reason(): string {
    return this.lastReason
  }

  get disposed(): boolean {
    return this.currentState === 'disposed'
  }

  get healthy(): boolean {
    return isRendererHealthy(this.currentState)
  }

  get disposalReport(): LensDisposalReport {
    return this.released
  }

  subscribe(listener: LensRendererLifecycleListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  register(kind: LensDisposalKind, teardown: () => void): void {
    if (this.disposed) {
      teardown()
      return
    }
    const bucket = this.teardowns.get(kind)
    if (bucket) bucket.push(teardown)
    else this.teardowns.set(kind, [teardown])
  }

  transition(next: LensRendererLifecycleState, reason: string): boolean {
    if (next === this.currentState) return true
    if (!canTransition(this.currentState, next)) return false
    this.currentState = next
    this.lastReason = reason
    for (const listener of this.listeners) listener(next, reason)
    return true
  }

  dispose(reason = 'renderer disposed'): void {
    if (this.disposed) return

    const report = { ...this.released }
    for (const [kind, bucket] of this.teardowns) {
      for (const teardown of bucket) {
        try {
          teardown()
        } catch {}
        report[kind] += 1
      }
    }
    this.teardowns.clear()
    this.released = report

    this.currentState = 'disposed'
    this.lastReason = reason
    for (const listener of this.listeners) listener('disposed', reason)
    this.listeners.clear()
  }
}

export function forceContextLossForDebug(canvas: HTMLCanvasElement | null): boolean {
  if (!canvas) return false
  try {
    const gl = canvas.getContext('webgl2')
    const extension = gl?.getExtension('WEBGL_lose_context')
    if (!extension) return false
    extension.loseContext()
    return true
  } catch {
    return false
  }
}
