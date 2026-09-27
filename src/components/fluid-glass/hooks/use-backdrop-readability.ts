import { useEffect, useState } from 'react'
import {
  adaptEnvironmentSource,
  advanceReadability,
  initialReadabilityFor,
  probeImageReadability,
  sourceIdentity,
} from '../lens/backdrop-source'
import type { LensSourceReadability } from '../lens/backdrop-source'
import type { FluidGlassEnvironmentSource } from '../types'

export function useBackdropReadability(environment: FluidGlassEnvironmentSource) {
  const source = adaptEnvironmentSource(environment)
  const identity = sourceIdentity(source)
  const initial = initialReadabilityFor(source)
  const src = source.kind === 'image' ? source.src : null
  const [probe, setProbe] = useState<{ identity: string; readability: LensSourceReadability }>(
    () => ({ identity, readability: initial }),
  )
  useEffect(() => {
    setProbe({ identity, readability: initial })
    if (src === null) return
    let cancelled = false
    const pending = probeImageReadability(src, null)
    void pending.result.then((event) => {
      if (!cancelled) setProbe({ identity, readability: advanceReadability(initial, event) })
    })
    return () => {
      cancelled = true
      pending.cancel()
    }
  }, [identity, initial, src])

  return probe.identity === identity ? probe.readability : initial
}
