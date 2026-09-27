export type LensGeometryPolicy = 'lens-only' | 'coupled'

export const ACTIVE_LENS_GEOMETRY_POLICY: LensGeometryPolicy = 'lens-only'

export const COUPLED_GEOMETRY_ENABLED = false

export type LensGeometryPolicyResolution = {
  policy: LensGeometryPolicy
  requested: LensGeometryPolicy

  downgraded: boolean
  reason: 'pilot-lens-only' | 'coupled-disabled' | 'requested'
}

export function resolveGeometryPolicy(
  requested: LensGeometryPolicy = ACTIVE_LENS_GEOMETRY_POLICY,
): LensGeometryPolicyResolution {
  if (requested === 'coupled' && !COUPLED_GEOMETRY_ENABLED) {
    return {
      policy: ACTIVE_LENS_GEOMETRY_POLICY,
      requested,
      downgraded: true,
      reason: 'coupled-disabled',
    }
  }
  return {
    policy: requested,
    requested,
    downgraded: false,
    reason: requested === 'lens-only' ? 'pilot-lens-only' : 'requested',
  }
}

export function targetGeometryIsAuthoritative(policy: LensGeometryPolicy): boolean {
  return policy === 'lens-only'
}

export type LensMotionOwner = string

export class LensMotionOwnershipRegistry {
  private readonly owners = new Map<string, LensMotionOwner>()

  claim(targetId: string, owner: LensMotionOwner): boolean {
    const existing = this.owners.get(targetId)
    if (existing && existing !== owner) return false
    this.owners.set(targetId, owner)
    return true
  }

  release(targetId: string, owner: LensMotionOwner): void {
    if (this.owners.get(targetId) === owner) this.owners.delete(targetId)
  }

  ownerOf(targetId: string): LensMotionOwner | null {
    return this.owners.get(targetId) ?? null
  }

  clear(): void {
    this.owners.clear()
  }
}
