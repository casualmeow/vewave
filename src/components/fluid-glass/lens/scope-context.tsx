import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'

import { lensWebGlScopeGuard, WebGlScopePilotGuard } from './webgl-scope-guard'

const LensScopeGuardContext = createContext<WebGlScopePilotGuard>(lensWebGlScopeGuard)

export function useLensScopeGuard(): WebGlScopePilotGuard {
  return useContext(LensScopeGuardContext)
}

export function LensLaboratoryScopeProvider({
  children,
  simultaneousRenderers,
}: {
  children: ReactNode

  simultaneousRenderers?: number
}) {
  const guard = useMemo(
    () =>
      new WebGlScopePilotGuard(
        simultaneousRenderers === undefined
          ? Number.POSITIVE_INFINITY
          : Math.max(1, simultaneousRenderers),
        'laboratory',
      ),
    [simultaneousRenderers],
  )

  useEffect(() => () => guard.reset(), [guard])

  return <LensScopeGuardContext.Provider value={guard}>{children}</LensScopeGuardContext.Provider>
}

export function LensScopeGuardProvider({
  children,
  guard,
}: {
  children: ReactNode
  guard: WebGlScopePilotGuard
}) {
  return <LensScopeGuardContext.Provider value={guard}>{children}</LensScopeGuardContext.Provider>
}
