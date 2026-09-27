export const PILOT_MAX_ACTIVE_WEBGL_SCOPES = 1

export type LensScopeOwnershipClass = 'production' | 'laboratory'

export type LensScopeDenialReason = 'scope-limit-reached' | 'disposed'

export type LensScopeAcquisition = {
  granted: boolean
  ownerId: string | null
  reason: 'acquired' | 'already-owner' | LensScopeDenialReason
}

export type LensScopeListener = (ownerId: string | null) => void

export class WebGlScopePilotGuard {
  private owners: Array<string> = []
  private readonly listeners = new Set<LensScopeListener>()

  constructor(
    readonly maxActiveScopes: number = PILOT_MAX_ACTIVE_WEBGL_SCOPES,
    readonly ownershipClass: LensScopeOwnershipClass = 'production',
  ) {}

  get ownerId(): string | null {
    return this.owners[0] ?? null
  }

  get activeCount(): number {
    return this.owners.length
  }

  get ownerIds(): ReadonlyArray<string> {
    return this.owners
  }

  isOwnedBy(scopeId: string): boolean {
    return this.owners.includes(scopeId)
  }

  canAcquire(scopeId: string): boolean {
    return this.owners.length < this.maxActiveScopes || this.isOwnedBy(scopeId)
  }

  acquire(scopeId: string): LensScopeAcquisition {
    if (this.isOwnedBy(scopeId)) {
      return { granted: true, ownerId: scopeId, reason: 'already-owner' }
    }
    if (this.owners.length >= this.maxActiveScopes) {
      return { granted: false, ownerId: this.ownerId, reason: 'scope-limit-reached' }
    }
    this.owners.push(scopeId)
    this.notify()
    return { granted: true, ownerId: scopeId, reason: 'acquired' }
  }

  release(scopeId: string): boolean {
    const index = this.owners.indexOf(scopeId)
    if (index === -1) return false
    this.owners.splice(index, 1)
    this.notify()
    return true
  }

  subscribe(listener: LensScopeListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  reset(): void {
    this.owners = []
    this.notify()
  }

  private notify(): void {
    const ownerId = this.ownerId
    for (const listener of this.listeners) listener(ownerId)
  }
}

export const lensWebGlScopeGuard = new WebGlScopePilotGuard(PILOT_MAX_ACTIVE_WEBGL_SCOPES)
