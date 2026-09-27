import { createContext, useContext } from 'react'

import type { LensSourceCategory, LensSourceReadability } from './backdrop-source'
import type { LensBackend, LensBackendReason } from './backend-resolution'
import type { LensRecoveryPhase } from './context-recovery'
import type { LensRendererLifecycleState } from './renderer-lifecycle'
import type { LensScopeDenialReason, LensScopeOwnershipClass } from './webgl-scope-guard'
import type { FluidGlassBackend, FluidGlassRendererSelection } from '../types'

export type LensPaneDebugSnapshot = {
  requestedRenderer: FluidGlassRendererSelection

  resolvedBackend: LensBackend
  legacyBackend: FluidGlassBackend
  reason: LensBackendReason
  degraded: boolean
  accessibilityEnforced: boolean
  sourceCategory: LensSourceCategory
  sourceReadability: LensSourceReadability
  scopeId: string

  ownsScope: boolean

  scopeDenialReason: LensScopeDenialReason | null

  scopeOwnerId: string | null

  ownershipClass: LensScopeOwnershipClass
  lifecycleState: LensRendererLifecycleState
  recoveryPhase: LensRecoveryPhase
}

export const LensPaneDebugContext = createContext<LensPaneDebugSnapshot | null>(null)

export function useLensPaneDebug(): LensPaneDebugSnapshot | null {
  return useContext(LensPaneDebugContext)
}

export function formatLensPaneDebug(snapshot: LensPaneDebugSnapshot): string {
  const lines = [
    `requested: ${snapshot.requestedRenderer}`,
    `resolved: ${snapshot.legacyBackend}`,
    `reason: ${snapshot.reason}`,
  ]
  if (snapshot.scopeDenialReason || snapshot.ownsScope) {
    lines.push(`scope: ${snapshot.ownsScope ? 'owned' : snapshot.scopeDenialReason}`)
  }
  lines.push(`readability: ${snapshot.sourceReadability}`)
  lines.push(`coordinator: ${snapshot.ownershipClass}`)
  return lines.join('\n')
}
