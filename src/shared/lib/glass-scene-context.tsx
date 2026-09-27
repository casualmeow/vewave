import { createContext, useCallback, useContext, useEffect, useId, useState } from 'react'
import type { ResolvedGlassMaterial } from './glass-material'

export type GlassSceneRegistry = {
  register: (
    id: string,
    element: HTMLElement,
    material: ResolvedGlassMaterial,
    onReady: (ready: boolean) => void,
  ) => () => void
}

export const GlassSceneContext = createContext<GlassSceneRegistry | null>(null)

export function useGlassScenePane({
  enabled,
  material,
}: {
  enabled: boolean
  material: ResolvedGlassMaterial
}) {
  const registry = useContext(GlassSceneContext)
  const id = useId()
  const [element, setElement] = useState<HTMLElement | null>(null)
  const [ready, setReady] = useState(false)
  const ref = useCallback((node: HTMLElement | null) => setElement(node), [])
  useEffect(() => {
    if (!enabled || !element || !registry) return
    return registry.register(id, element, material, setReady)
  }, [enabled, element, id, material, registry])
  return { ref, ready: Boolean(enabled && element && registry && ready) }
}
