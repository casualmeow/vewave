import { describe, expect, it } from 'vitest'

import type { SpikeEvidenceInput } from '@/modules/ui-showcase/lens-spike/spike-evidence'
import type { SpikeMetricValue } from '@/modules/ui-showcase/lens-spike/types'
import {
  PREVIEW_HEADLINE_WITHOUT_TELEMETRY,
  PREVIEW_HEADLINE_WITH_TELEMETRY,
  applyEvidenceToMetrics,
  classifySpikeEvidence,
  isRecoveryClaimCoherent,
  shouldRenderPreviewOnly,
} from '@/modules/ui-showcase/lens-spike/spike-evidence'

function manualRecord(overrides: Partial<SpikeEvidenceInput> = {}): SpikeEvidenceInput {
  return {
    scenarioId: 'scope-sweep',
    variant: 'default',
    mode: 'measure',
    scenarioReady: true,
    spikeComplete: true,
    instrumentationReady: false,
    config: {},
    rawStatus: 'observed',
    metrics: {},
    ...overrides,
  }
}

describe('preview telemetry is never evidence', () => {
  it('does not claim "nothing was measured" when the preview produced numbers', () => {
    const evidence = classifySpikeEvidence(
      manualRecord({
        metrics: {
          frameSampleCount: 119,
          frameSampleWindowMs: 1984.5,
          frameIntervalMaxMs: 41.2,
          coldMountToAllReadyMs: 612.4,
          liveCanvasCount: 4,
        },
      }),
    )

    expect(evidence.previewTelemetry).toBe(true)
    expect(evidence.headline).toBe(PREVIEW_HEADLINE_WITH_TELEMETRY)
    expect(evidence.evidenceClass).toBe('manual-preview')
    expect(evidence.evidenceValid).toBe(false)
  })

  it('says the measurement was not executed only when there is nothing to show', () => {
    const evidence = classifySpikeEvidence(manualRecord({ metrics: { previewRendered: true } }))

    expect(evidence.previewTelemetry).toBe(false)
    expect(evidence.headline).toBe(PREVIEW_HEADLINE_WITHOUT_TELEMETRY)
  })

  it('cannot be promoted to observed by scenario ready/complete signals', () => {
    const evidence = classifySpikeEvidence(
      manualRecord({
        scenarioReady: true,
        spikeComplete: true,
        metrics: {
          groupsRequested: 4,
          backendsResolved: 'sdf,sdf,sdf,sdf',
          liveCanvasCount: 4,
          coldMountToAllReadyMs: 500,
          frameIntervalMedianMs: 16.7,
        },
      }),
    )

    expect(evidence.evidenceValid).toBe(false)
    expect(evidence.evidenceClass).not.toBe('observed')

    expect(evidence.suppressedMetrics).toContain('frameIntervalMedianMs')
  })
})

describe('runner-only scenarios preview instead of measuring', () => {
  it('gates scope sweep on the runner, and only on the runner', () => {
    expect(shouldRenderPreviewOnly('scope-sweep', false)).toBe(true)
    expect(shouldRenderPreviewOnly('scope-sweep', true)).toBe(false)
    expect(shouldRenderPreviewOnly('arbitrary-dom', false)).toBe(false)
    expect(shouldRenderPreviewOnly(null, false)).toBe(false)
  })

  it('states that sampling, orchestration and completion were deliberately skipped', () => {
    const evidence = classifySpikeEvidence(manualRecord({ metrics: { previewRendered: true } }))

    expect(evidence.previewOnly).toBe(true)
    expect(evidence.evidenceClass).toBe('manual-preview')
    expect(evidence.reason).toMatch(/frame sampling, orchestration and completion/)
  })

  it('leaves the automated runner path untouched', () => {
    const evidence = classifySpikeEvidence(
      manualRecord({
        instrumentationReady: true,
        metrics: {
          groupsRequested: 2,
          backendsResolved: 'sdf,sdf',
          liveCanvasCount: 2,
          coldMountToAllReadyMs: 480,
        },
      }),
    )

    expect(evidence.previewOnly).toBe(false)
    expect(evidence.evidenceClass).toBe('observed')
    expect(evidence.evidenceValid).toBe(true)
  })
})

describe('unavailable is reserved for a genuinely absent capability', () => {
  const manualContextLoss = {
    extensionAvailable: true,
    canvasFound: true,
    lossObserved: false,
    restoreObserved: false,
    restoreRequested: true,
    backendBefore: 'sdf',
  } satisfies Record<string, SpikeMetricValue>

  it('classifies extension-present + no instrumentation as incomplete, not unavailable', () => {
    const evidence = classifySpikeEvidence(
      manualRecord({
        scenarioId: 'context-loss',
        rawStatus: 'unavailable',
        metrics: manualContextLoss,
      }),
    )

    expect(evidence.evidenceClass).toBe('incomplete')
    expect(evidence.reason).toMatch(/capability is present/)
    expect(evidence.reason).toMatch(/could not be verified/)
  })

  it('classifies an untried trigger as manual-preview rather than unavailable', () => {
    const evidence = classifySpikeEvidence(
      manualRecord({
        scenarioId: 'context-loss',
        rawStatus: 'unavailable',
        metrics: { extensionAvailable: true, canvasFound: true },
      }),
    )

    expect(evidence.evidenceClass).toBe('manual-preview')
    expect(evidence.reason).toMatch(/never attempted/)
  })

  it('uses unavailable when the capability itself is absent', () => {
    const evidence = classifySpikeEvidence(
      manualRecord({
        scenarioId: 'context-loss',
        rawStatus: 'unavailable',
        metrics: { extensionAvailable: false, canvasFound: false },
      }),
    )

    expect(evidence.evidenceClass).toBe('unavailable')
    expect(evidence.reason).toMatch(/WEBGL_lose_context is not exposed/)
  })
})

describe('recovery is never confirmed without an observed loss', () => {
  it('rejects a recovery claim with no witnessed loss or restore', () => {
    expect(
      isRecoveryClaimCoherent({
        rendererRecovered: true,
        lossObserved: false,
        restoreObserved: false,
      }),
    ).toBe(false)
  })

  it('rejects a recovery claim backed only by readiness at inspection', () => {
    expect(
      isRecoveryClaimCoherent({
        rendererRecovered: true,
        lossObserved: false,
        restoreObserved: false,
        rendererReadyAtInspection: true,
      }),
    ).toBe(false)
  })

  it('accepts recovery only with loss, restore and readiness afterwards', () => {
    expect(
      isRecoveryClaimCoherent({
        rendererRecovered: true,
        lossObserved: true,
        restoreObserved: true,
        rendererReadyAtInspection: true,
      }),
    ).toBe(true)
  })

  it('downgrades an incoherent recovery record to incomplete', () => {
    const evidence = classifySpikeEvidence(
      manualRecord({
        scenarioId: 'context-loss',
        instrumentationReady: true,
        metrics: {
          extensionAvailable: true,
          lossObserved: false,
          restoreObserved: false,
          rendererRecovered: true,
          backendAfterRestore: 'sdf',
        },
      }),
    )

    expect(evidence.evidenceClass).toBe('incomplete')
    expect(evidence.suppressedMetrics).toContain('rendererRecovered')
  })

  it('renames readiness so it cannot be read as proof of recovery', () => {
    const evidence = classifySpikeEvidence(
      manualRecord({ scenarioId: 'context-loss', metrics: { readinessConfirmed: true } }),
    )
    const published = applyEvidenceToMetrics({ readinessConfirmed: true }, evidence)

    expect(published.rendererReadyAtInspection).toBe(true)
    expect(published).not.toHaveProperty('readinessConfirmed')
  })
})

describe('scroll and portal: missing movement is not a missing capability', () => {
  it('reports manual-preview when the scripted movement never ran', () => {
    const evidence = classifySpikeEvidence(
      manualRecord({
        scenarioId: 'scroll-and-portal',
        variant: 'portal',
        rawStatus: 'unavailable',
        metrics: { container: 'portal', resolvedBackend: 'css' },
      }),
    )

    expect(evidence.evidenceClass).toBe('manual-preview')
    expect(evidence.evidenceClass).not.toBe('unavailable')
  })

  it('reports incomplete when movement ran but geometry could not be observed', () => {
    const evidence = classifySpikeEvidence(
      manualRecord({
        scenarioId: 'scroll-and-portal',
        variant: 'vertical-scroll',
        rawStatus: 'unavailable',
        metrics: {
          container: 'vertical-scroll',
          deltaBeforeScrollX: null,
          deltaAfterScrollX: null,
          scrollDriftX: null,
          scrollDriftY: null,
        },
      }),
    )

    expect(evidence.evidenceClass).toBe('incomplete')
  })

  it('keeps unmeasured drift metrics blank instead of zero', () => {
    const evidence = classifySpikeEvidence(
      manualRecord({
        scenarioId: 'scroll-and-portal',
        variant: 'vertical-scroll',
        rawStatus: 'unavailable',
        metrics: { container: 'vertical-scroll', scrollDriftX: 0, scrollDriftY: 0 },
      }),
    )
    const published = applyEvidenceToMetrics({ scrollDriftX: 0, scrollDriftY: 0 }, evidence)

    expect(published.scrollDriftX).toBeNull()
    expect(published.scrollDriftY).toBeNull()
  })

  it('still reports unavailable when the geometry channel is genuinely absent', () => {
    const evidence = classifySpikeEvidence(
      manualRecord({
        scenarioId: 'scroll-and-portal',
        variant: 'vertical-scroll',
        rawStatus: 'unavailable',
        metrics: { container: 'vertical-scroll', geometryChannelAvailable: false },
      }),
    )

    expect(evidence.evidenceClass).toBe('unavailable')
  })
})
