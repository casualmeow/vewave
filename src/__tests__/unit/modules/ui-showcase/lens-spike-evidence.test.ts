import { describe, expect, it } from 'vitest'

import type { SpikeEvidenceInput } from '@/modules/ui-showcase/lens-spike/spike-evidence'
import {
  NOT_MEASURED,
  classifySpikeEvidence,
  formatSpikeMetric,
  isRecoveryClaimCoherent,
} from '@/modules/ui-showcase/lens-spike/spike-evidence'

function input(overrides: Partial<SpikeEvidenceInput> = {}): SpikeEvidenceInput {
  return {
    scenarioId: 'controlled-image',
    variant: 'sdf',
    mode: 'measure',
    scenarioReady: true,
    spikeComplete: true,
    instrumentationReady: true,
    config: {},
    rawStatus: 'observed',
    metrics: { resolvedBackend: 'sdf' },
    ...overrides,
  }
}

describe('lens-spike evidence classification', () => {
  it('grants observed only when every prerequisite is satisfied', () => {
    const evidence = classifySpikeEvidence(input())
    expect(evidence.evidenceClass).toBe('observed')
    expect(evidence.evidenceValid).toBe(true)
    expect(evidence.executionMode).toBe('runner')
  })

  it('never lets an incomplete run become observed', () => {
    expect(classifySpikeEvidence(input({ spikeComplete: false })).evidenceClass).toBe('incomplete')
    expect(classifySpikeEvidence(input({ scenarioReady: false })).evidenceClass).toBe('incomplete')

    const noMetrics = classifySpikeEvidence(input({ metrics: {} }))
    expect(noMetrics.evidenceClass).toBe('incomplete')
    expect(noMetrics.missingMetrics).toContain('resolvedBackend')
    expect(noMetrics.evidenceValid).toBe(false)
  })

  it('keeps a run without the init script as a manual preview, not observed', () => {
    const evidence = classifySpikeEvidence(input({ instrumentationReady: false }))
    expect(evidence.evidenceClass).toBe('manual-preview')
    expect(evidence.executionMode).toBe('manual')
    expect(evidence.prerequisitesReady).toBe(false)
    expect(evidence.reason).toContain('requires the automated spike runner')
  })

  it('does not present pre-trigger backend state as a forced-edge result', () => {
    const evidence = classifySpikeEvidence(
      input({
        scenarioId: 'fallback-edges',
        variant: 'webgl-creation-failure',
        metrics: { resolvedBackend: 'sdf', edge: 'webgl-creation-failure' },

        config: {},
      }),
    )
    expect(evidence.evidenceClass).toBe('manual-preview')
    expect(evidence.suppressedMetrics).toContain('resolvedBackend')
    expect(evidence.reason).toContain('forceWebglFailure')
  })

  it('requires an observed loss and restore before recovery can be claimed', () => {
    const metrics = {
      lossObserved: false,
      restoreObserved: false,
      rendererRecovered: true,
      backendAfterRestore: 'sdf',
    }
    expect(isRecoveryClaimCoherent(metrics)).toBe(false)

    const evidence = classifySpikeEvidence(
      input({ scenarioId: 'context-loss', variant: 'default', metrics }),
    )
    expect(evidence.evidenceClass).toBe('incomplete')
    expect(evidence.reason).toContain('rendererRecovered')

    expect(
      isRecoveryClaimCoherent({
        ...metrics,
        lossObserved: true,
        restoreObserved: true,
        rendererReadyAtInspection: true,
      }),
    ).toBe(true)
  })

  it('classifies a missing WEBGL_lose_context extension as unavailable', () => {
    const evidence = classifySpikeEvidence(
      input({
        scenarioId: 'context-loss',
        variant: 'default',
        rawStatus: 'unavailable',
        metrics: { extensionAvailable: false, canvasFound: true },
      }),
    )
    expect(evidence.evidenceClass).toBe('unavailable')
    expect(evidence.evidenceValid).toBe(false)
  })

  it('holds a scope-sweep cell incomplete until every group resolved', () => {
    const partial = classifySpikeEvidence(
      input({
        scenarioId: 'scope-sweep',
        variant: 'sdf',
        metrics: {
          groupsRequested: 4,
          backendsResolved: 'sdf,sdf',
          liveCanvasCount: 2,
          coldMountToAllReadyMs: null,
        },
      }),
    )
    expect(partial.evidenceClass).toBe('incomplete')
    expect(partial.reason).toContain('2 of 4')

    const mountedButUnmeasured = classifySpikeEvidence(
      input({
        scenarioId: 'scope-sweep',
        variant: 'sdf',
        metrics: {
          groupsRequested: 2,
          backendsResolved: 'sdf,sdf',
          liveCanvasCount: 2,
          coldMountToAllReadyMs: null,
        },
      }),
    )
    expect(mountedButUnmeasured.evidenceClass).toBe('incomplete')
    expect(mountedButUnmeasured.missingMetrics).toContain('coldMountToAllReadyMs')
  })

  it('marks the transformed-target Coupled route as legacy/deferred', () => {
    for (const variant of ['coupled', 'coupled-sdf']) {
      const evidence = classifySpikeEvidence(
        input({
          scenarioId: 'transformed-target',
          variant,
          metrics: { resolvedBackend: 'css', samples: 0 },
        }),
      )
      expect(evidence.evidenceClass).toBe('legacy-deferred')
      expect(evidence.evidenceValid).toBe(false)
      expect(evidence.legacy?.detail.join(' ')).toContain('Lens-only')
      expect(evidence.legacy?.detail.join(' ')).toContain('zero samples do not prove zero drift')
    }
  })

  it('treats zero samples as an absence of measurement, not a zero result', () => {
    const evidence = classifySpikeEvidence(
      input({
        scenarioId: 'transformed-target',
        variant: 'stationary',
        metrics: { resolvedBackend: 'css', samples: 0 },
      }),
    )
    expect(evidence.evidenceClass).toBe('incomplete')
    expect(evidence.reason).toContain('not a zero result')
  })
})

describe('metric formatting', () => {
  it('renders uncollected metrics as "not measured" and genuine zeros as 0', () => {
    expect(formatSpikeMetric(null)).toBe(NOT_MEASURED)
    expect(formatSpikeMetric(0)).toBe('0')
    expect(formatSpikeMetric(false)).toBe('false')
    expect(formatSpikeMetric('css')).toBe('css')
  })
})
