export type LensRecoveryPhase = 'healthy' | 'lost' | 'recovering' | 'terminal'

export type LensRecoveryReason =
  | 'none'
  | 'context-lost'
  | 'renderer-error'
  | 'recovery-failed'
  | 'attempts-exhausted'

export type LensRecoverySnapshot = {
  phase: LensRecoveryPhase
  attempts: number
  maxAttempts: number
  reason: LensRecoveryReason

  rendererHealthy: boolean
}

export type LensRecoveryListener = (snapshot: LensRecoverySnapshot) => void

export const DEFAULT_RECOVERY_ATTEMPTS = 2

export class ContextRecoveryController {
  private phase: LensRecoveryPhase = 'healthy'
  private attempts = 0
  private reason: LensRecoveryReason = 'none'
  private readonly listeners = new Set<LensRecoveryListener>()
  private disposed = false

  constructor(private readonly maxAttempts: number = DEFAULT_RECOVERY_ATTEMPTS) {}

  get snapshot(): LensRecoverySnapshot {
    return {
      phase: this.phase,
      attempts: this.attempts,
      maxAttempts: this.maxAttempts,
      reason: this.reason,
      rendererHealthy: this.phase === 'healthy',
    }
  }

  subscribe(listener: LensRecoveryListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  notifyContextLost(reason: LensRecoveryReason = 'context-lost'): LensRecoverySnapshot {
    if (this.disposed || this.phase === 'terminal') return this.snapshot
    if (this.attempts >= this.maxAttempts) return this.set('terminal', 'attempts-exhausted')
    return this.set('lost', reason)
  }

  beginRecovery(): LensRecoverySnapshot {
    if (this.disposed || this.phase === 'terminal' || this.phase === 'healthy') return this.snapshot
    if (this.attempts >= this.maxAttempts) return this.set('terminal', 'attempts-exhausted')
    this.attempts += 1
    return this.set('recovering', this.reason)
  }

  notifyRestored(): LensRecoverySnapshot {
    if (this.disposed || this.phase === 'terminal') return this.snapshot
    this.attempts = 0
    return this.set('healthy', 'none')
  }

  notifyRecoveryFailed(): LensRecoverySnapshot {
    if (this.disposed || this.phase === 'terminal') return this.snapshot
    if (this.attempts >= this.maxAttempts) return this.set('terminal', 'attempts-exhausted')
    return this.set('lost', 'recovery-failed')
  }

  notifyTerminal(reason: LensRecoveryReason = 'renderer-error'): LensRecoverySnapshot {
    if (this.disposed) return this.snapshot
    return this.set('terminal', reason)
  }

  get canAttemptRecovery(): boolean {
    return this.phase !== 'terminal' && this.attempts < this.maxAttempts
  }

  reset(): LensRecoverySnapshot {
    this.attempts = 0
    return this.set('healthy', 'none')
  }

  dispose(): void {
    this.disposed = true
    this.listeners.clear()
  }

  private set(phase: LensRecoveryPhase, reason: LensRecoveryReason): LensRecoverySnapshot {
    this.phase = phase
    this.reason = reason
    const snapshot = this.snapshot
    for (const listener of this.listeners) listener(snapshot)
    return snapshot
  }
}
