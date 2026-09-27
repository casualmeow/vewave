import { lazy } from 'react'
import type { ComponentType } from 'react'

import type { SpikeScenarioProps } from '../types'

export { spikeScenarioDefinitions } from './definitions'

type LazyScenario = ComponentType<SpikeScenarioProps>

export const spikeScenarios: Record<string, LazyScenario> = {
  'arbitrary-dom': lazy(async () => ({
    default: (await import('./arbitrary-dom-scenario')).ArbitraryDomScenario,
  })),
  'controlled-image': lazy(async () => ({
    default: (await import('./visual-scenarios')).ControlledImageScenario,
  })),
  'transformed-target': lazy(async () => ({
    default: (await import('./visual-scenarios')).TransformedTargetScenario,
  })),
  'scroll-and-portal': lazy(async () => ({
    default: (await import('./visual-scenarios')).ScrollAndPortalScenario,
  })),
  'fallback-edges': lazy(async () => ({
    default: (await import('./lifecycle-scenarios')).FallbackEdgesScenario,
  })),
  teardown: lazy(async () => ({
    default: (await import('./lifecycle-scenarios')).TeardownScenario,
  })),
  'context-loss': lazy(async () => ({
    default: (await import('./lifecycle-scenarios')).ContextLossScenario,
  })),
  'scope-sweep': lazy(async () => ({
    default: (await import('./lifecycle-scenarios')).ScopeSweepScenario,
  })),
}
