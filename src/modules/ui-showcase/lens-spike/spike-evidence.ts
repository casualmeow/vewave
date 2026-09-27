import type { SpikeMetricValue, SpikeMode, SpikeStatus } from './types'

export type SpikeEvidenceClass =
  | 'observed'
  | 'manual-preview'
  | 'incomplete'
  | 'unavailable'
  | 'degraded'
  | 'error'
  | 'legacy-deferred'

export type SpikeExecutionMode = 'manual' | 'runner'

export const RUNNER_REQUIRED_MESSAGE =
  'This scenario requires the automated spike runner and has not been executed.'

export const RUNNER_UNVERIFIED_MESSAGE =
  'This scenario was attempted outside the automated spike runner, but its outcome could not be verified.'

export const RUNNER_COMMAND = 'npm run spike:lens'

export const NOT_MEASURED = 'not measured'

export type SpikeSuppressionReason = 'trigger-not-run' | 'operation-unverified'

export const SUPPRESSION_REASON_MESSAGE: Record<SpikeSuppressionReason, string> = {
  'trigger-not-run': 'Outcome metrics were blanked because the trigger was not executed.',
  'operation-unverified':
    'Outcome metrics were blanked because the operation could not be verified.',
}

export const PREVIEW_HEADLINE_WITHOUT_TELEMETRY =
  'Manual preview — the measurement was not executed.'
export const PREVIEW_HEADLINE_WITH_TELEMETRY =
  'Manual preview — preview telemetry was collected, but no valid evidence was produced.'

const STATIC_HEADLINES: Record<Exclude<SpikeEvidenceClass, 'manual-preview'>, string> = {
  observed: 'Observed — valid measurement evidence',
  degraded: 'Degraded — measured, with a recorded caveat',
  incomplete: 'Incomplete — attempted, but not verified; this run is not evidence',
  unavailable: 'Unavailable — the required capability is missing',
  'legacy-deferred': 'Legacy / deferred experiment — not current acceptance',
  error: 'Error — the scenario failed',
}

const NON_TELEMETRY_METRICS = new Set([
  'instrumentationReady',
  'previewRendered',
  'previewOnly',
  'scenarioModuleLoaded',
  'scenarioLoadError',
  'container',
])

export function hasPreviewTelemetry(metrics: Record<string, SpikeMetricValue>) {
  return Object.entries(metrics).some(
    ([name, value]) =>
      !NON_TELEMETRY_METRICS.has(name) && value !== null && value !== undefined && value !== '',
  )
}

export function formatSpikeMetric(value: SpikeMetricValue) {
  if (value === null || value === undefined) return NOT_MEASURED
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  return String(value)
}

type Requirement = {
  requiresInitScript: boolean

  requiresConfigFlag?: 'forceWebglFailure' | 'forceNativeSvgUnavailable'

  runnerDependency: string | null

  requiredMetrics: ReadonlyArray<string>

  outcomeMetrics?: ReadonlyArray<string>
  legacy?: { summary: string; detail: ReadonlyArray<string> }
}

const DEFAULT_REQUIREMENT: Requirement = {
  requiresInitScript: true,
  runnerDependency: null,
  requiredMetrics: ['resolvedBackend'],
}

const COUPLED_LEGACY: Requirement['legacy'] = {
  summary: 'Historical/deferred experiment — not current production acceptance.',
  detail: [
    'Current pilot policy is Lens-only; the Coupled transform path remains disabled.',
    'This route captured zero geometry samples against a WebGL lens, and zero samples do not prove zero drift.',
    'Retained as Phase 2 history only. Coupled synchronisation is not implemented and is out of scope.',
  ],
}

const scenarioRequirements: Record<string, Requirement> = {
  'arbitrary-dom': DEFAULT_REQUIREMENT,
  'controlled-image': DEFAULT_REQUIREMENT,
  'fallback-edges': {
    requiresInitScript: true,
    runnerDependency: null,
    requiredMetrics: ['resolvedBackend', 'edge'],
  },
  'transformed-target': {
    requiresInitScript: true,
    runnerDependency: 'per-frame geometry sampling window',
    requiredMetrics: ['resolvedBackend', 'samples'],
  },
  teardown: {
    requiresInitScript: true,
    runnerDependency: 'repeated mount/unmount cycles plus the instrumented settling window',
    requiredMetrics: [
      'cyclesWithCanvasObserved',
      'canvasesRemainingAfterUnmount',
      'rafPendingAfterSettle',
    ],
    outcomeMetrics: [
      'rafPendingAfterSettle',
      'canvasesRemainingAfterUnmount',
      'usedJsHeapBytesAfter',
    ],
  },
  'context-loss': {
    requiresInitScript: true,
    runnerDependency: 'WEBGL_lose_context injection and the restore wait window',
    requiredMetrics: [
      'lossObserved',
      'restoreObserved',
      'rendererRecovered',
      'backendAfterRestore',
    ],
    outcomeMetrics: ['backendAfterLoss', 'backendAfterRestore', 'rendererRecovered'],
  },
  'scope-sweep': {
    requiresInitScript: true,
    runnerDependency: 'scope-sweep orchestration across 1/2/4/8 groups',
    requiredMetrics: [
      'groupsRequested',
      'backendsResolved',
      'liveCanvasCount',
      'coldMountToAllReadyMs',
    ],
    outcomeMetrics: ['frameIntervalMedianMs', 'frameIntervalP95Ms', 'usedJsHeapBytes'],
  },
  'scroll-and-portal': {
    requiresInitScript: true,
    runnerDependency: 'scripted scroll / portal movement',
    requiredMetrics: ['deltaBeforeScrollX', 'deltaAfterScrollX', 'scrollDriftX', 'scrollDriftY'],
    outcomeMetrics: ['scrollDriftX', 'scrollDriftY', 'deltaAfterScrollX', 'deltaAfterScrollY'],
  },
}

export const RUNNER_ONLY_SCENARIOS: ReadonlyArray<string> = ['scope-sweep']

export function shouldRenderPreviewOnly(scenarioId: string | null, instrumentationReady: boolean) {
  if (!scenarioId) return false
  return !instrumentationReady && RUNNER_ONLY_SCENARIOS.includes(scenarioId)
}

export function requirementFor(scenarioId: string | null, variant: string): Requirement | null {
  if (!scenarioId) return null
  const base = scenarioRequirements[scenarioId]
  if (!base) return null
  if (scenarioId === 'transformed-target' && variant.startsWith('coupled')) {
    return { ...base, legacy: COUPLED_LEGACY }
  }
  if (scenarioId === 'fallback-edges' && variant === 'webgl-creation-failure') {
    return {
      ...base,
      requiresConfigFlag: 'forceWebglFailure',
      runnerDependency: 'getContext("webgl2") forced to null before application JS ran',
      outcomeMetrics: ['resolvedBackend', 'nativeRefractionSupported'],
    }
  }
  if (scenarioId === 'fallback-edges' && variant === 'native-displacement-unavailable') {
    return {
      ...base,
      requiresConfigFlag: 'forceNativeSvgUnavailable',
      runnerDependency:
        'CSS.supports(backdrop-filter:url()) forced false before application JS ran',
      outcomeMetrics: ['nativeRefractionSupported'],
    }
  }
  return base
}

const metricRenames: Record<string, Record<string, string>> = {
  'context-loss': { readinessConfirmed: 'rendererReadyAtInspection' },
}

export const CONTEXT_LOSS_CONCLUSIONS: ReadonlyArray<string> = [
  'backendAfterLoss',
  'backendAfterRestore',
  'fallbackObserved',
  'backendUnchangedAfterRestore',
  'rendererRecovered',
]

export function unverifiedConclusions(
  scenarioId: string | null,
  metrics: Record<string, SpikeMetricValue>,
): ReadonlyArray<string> {
  if (scenarioId !== 'context-loss') return []
  const witnessed = metrics.lossObserved === true && metrics.restoreObserved === true
  return witnessed ? [] : CONTEXT_LOSS_CONCLUSIONS
}

const capabilityAbsence: Record<
  string,
  (metrics: Record<string, SpikeMetricValue>) => string | null
> = {
  'context-loss': (metrics) =>
    metrics.extensionAvailable === false
      ? 'WEBGL_lose_context is not exposed for this configuration, so a context loss cannot be simulated at all.'
      : null,

  'scroll-and-portal': (metrics) =>
    metrics.geometryChannelAvailable === false
      ? 'No geometry channel is exposed for this configuration, so lens/target offsets cannot be read.'
      : null,
}

const operationAttempted: Record<string, (metrics: Record<string, SpikeMetricValue>) => boolean> = {
  'context-loss': (metrics) =>
    metrics.restoreRequested === true ||
    metrics.lossObserved === true ||
    metrics.backendAfterLoss !== undefined,

  'scroll-and-portal': (metrics) =>
    metrics.scrollOperationPerformed === true ||
    (metrics.container !== undefined && metrics.container !== 'portal'),
}

export type SpikeEvidenceInput = {
  scenarioId: string | null
  variant: string
  mode: SpikeMode
  scenarioReady: boolean
  spikeComplete: boolean
  instrumentationReady: boolean

  config: Record<string, unknown>

  rawStatus: SpikeStatus
  metrics: Record<string, SpikeMetricValue>
}

export type SpikeEvidence = {
  evidenceClass: SpikeEvidenceClass

  evidenceValid: boolean

  headline: string

  runnerMessage: string
  executionMode: SpikeExecutionMode
  prerequisitesReady: boolean

  previewTelemetry: boolean

  previewOnly: boolean
  reason: string | null
  missingMetrics: ReadonlyArray<string>

  suppressedMetrics: ReadonlyArray<string>

  unmeasuredMetrics: ReadonlyArray<string>

  suppressionReason: SpikeSuppressionReason | null
  suppressionMessage: string | null
  renamedMetrics: Readonly<Record<string, string>>
  runnerDependency: string | null
  legacy: Requirement['legacy'] | null
}

function isMissing(metrics: Record<string, SpikeMetricValue>, name: string) {
  const value = metrics[name]
  return value === undefined || value === null || value === ''
}

function scopeSweepShortfall(metrics: Record<string, SpikeMetricValue>) {
  const requested = Number(metrics.groupsRequested ?? 0)
  if (!Number.isFinite(requested) || requested <= 0) return 'group count was never established'
  const resolved = String(metrics.backendsResolved ?? 'none')
  const resolvedCount =
    resolved === 'none' || resolved === '' ? 0 : resolved.split(',').filter(Boolean).length
  if (resolvedCount < requested) {
    return `only ${resolvedCount} of ${requested} group backend(s) resolved`
  }
  const canvases = Number(metrics.liveCanvasCount ?? 0)
  if (String(metrics.backendsResolved).includes('sdf') && canvases < requested) {
    return `only ${canvases} of ${requested} canvas(es) were live when metrics were captured`
  }
  return null
}

export function isRecoveryClaimCoherent(metrics: Record<string, SpikeMetricValue>) {
  if (metrics.rendererRecovered !== true) return true
  const readyAfterwards =
    metrics.rendererReadyAtInspection === true || metrics.readinessConfirmed === true
  return metrics.lossObserved === true && metrics.restoreObserved === true && readyAfterwards
}

export function classifySpikeEvidence(input: SpikeEvidenceInput): SpikeEvidence {
  const requirement = requirementFor(input.scenarioId, input.variant)
  const executionMode: SpikeExecutionMode = input.instrumentationReady ? 'runner' : 'manual'
  const configFlagSatisfied = requirement?.requiresConfigFlag
    ? input.config[requirement.requiresConfigFlag] === true
    : true
  const initScriptSatisfied = requirement?.requiresInitScript ? input.instrumentationReady : true
  const prerequisitesReady = initScriptSatisfied && configFlagSatisfied
  const previewTelemetry = hasPreviewTelemetry(input.metrics)
  const previewOnly = shouldRenderPreviewOnly(input.scenarioId, input.instrumentationReady)

  const base = {
    executionMode,
    prerequisitesReady,
    previewTelemetry,
    previewOnly,
    missingMetrics: [] as ReadonlyArray<string>,
    suppressedMetrics: [] as ReadonlyArray<string>,
    unmeasuredMetrics: unverifiedConclusions(input.scenarioId, input.metrics),
    renamedMetrics: (input.scenarioId ? (metricRenames[input.scenarioId] ?? {}) : {}) as Readonly<
      Record<string, string>
    >,
    runnerDependency: requirement?.runnerDependency ?? null,
    legacy: requirement?.legacy ?? null,
  }

  const settle = (
    evidenceClass: SpikeEvidenceClass,
    reason: string | null,
    extra: Partial<SpikeEvidence> = {},
  ): SpikeEvidence => {
    const suppressedMetrics = extra.suppressedMetrics ?? base.suppressedMetrics
    const unmeasuredMetrics = extra.unmeasuredMetrics ?? base.unmeasuredMetrics

    const suppressionReason: SpikeSuppressionReason | null =
      suppressedMetrics.length === 0 && unmeasuredMetrics.length === 0
        ? null
        : evidenceClass === 'incomplete' || suppressedMetrics.length === 0
          ? 'operation-unverified'
          : 'trigger-not-run'

    return {
      ...base,
      ...extra,
      suppressedMetrics,
      unmeasuredMetrics,
      evidenceClass,
      evidenceValid: evidenceClass === 'observed',
      headline:
        evidenceClass === 'manual-preview'
          ? previewTelemetry
            ? PREVIEW_HEADLINE_WITH_TELEMETRY
            : PREVIEW_HEADLINE_WITHOUT_TELEMETRY
          : STATIC_HEADLINES[evidenceClass],
      runnerMessage:
        evidenceClass === 'incomplete' ? RUNNER_UNVERIFIED_MESSAGE : RUNNER_REQUIRED_MESSAGE,
      suppressionReason,
      suppressionMessage: suppressionReason ? SUPPRESSION_REASON_MESSAGE[suppressionReason] : null,
      reason,
    }
  }

  if (!input.scenarioId || !requirement) {
    return settle(
      'manual-preview',
      input.scenarioId ? 'Unknown scenario id.' : 'No scenario selected — harness index only.',
    )
  }

  if (requirement.legacy) {
    return settle('legacy-deferred', requirement.legacy.summary)
  }

  if (input.rawStatus === 'error') {
    return settle('error', 'Scenario reported an error.')
  }

  if (input.rawStatus === 'unavailable') {
    const probe = input.scenarioId ? capabilityAbsence[input.scenarioId] : undefined
    const absence = probe ? probe(input.metrics) : null
    const suppressed = { suppressedMetrics: requirement.outcomeMetrics ?? [] }

    if (!probe) {
      return settle(
        'unavailable',
        'The capability this scenario needs is not available in this engine or configuration.',
        suppressed,
      )
    }
    if (absence) {
      return settle('unavailable', absence, suppressed)
    }

    const attempted = operationAttempted[input.scenarioId]?.(input.metrics) ?? false
    return attempted
      ? settle(
          'incomplete',
          `The required capability is present, but the operation could not be verified without the runner instrumentation (${RUNNER_COMMAND}). What happened during the operation is unknown; nothing about it is confirmed.`,
          {
            ...suppressed,

            unmeasuredMetrics: [
              ...new Set([...(requirement.outcomeMetrics ?? []), ...base.unmeasuredMetrics]),
            ],
          },
        )
      : settle(
          'manual-preview',
          `${RUNNER_REQUIRED_MESSAGE} The capability is present; the scripted trigger was never attempted.`,
          suppressed,
        )
  }

  if (previewOnly) {
    return settle(
      'manual-preview',
      `${RUNNER_REQUIRED_MESSAGE} The visual preview was rendered; frame sampling, orchestration and completion were deliberately not started, so this route holds no results.`,
      { suppressedMetrics: requirement.outcomeMetrics ?? [] },
    )
  }

  if (!prerequisitesReady) {
    return settle(
      'manual-preview',
      !initScriptSatisfied
        ? `${RUNNER_REQUIRED_MESSAGE} The pre-page instrumentation (${RUNNER_COMMAND}) was not installed.`
        : `${RUNNER_REQUIRED_MESSAGE} The required init-script flag \`${requirement.requiresConfigFlag}\` was not set, so the edge was never forced.`,
      { suppressedMetrics: requirement.outcomeMetrics ?? [] },
    )
  }

  if (!input.scenarioReady || !input.spikeComplete) {
    return settle(
      'incomplete',
      !input.scenarioReady
        ? 'Scenario never reported ready.'
        : 'Scenario reported ready but never completed.',
    )
  }

  if (!isRecoveryClaimCoherent(input.metrics)) {
    return settle(
      'incomplete',
      'rendererRecovered was claimed without an observed context loss, an observed restore and confirmed readiness afterwards; recovery cannot be asserted.',
      { suppressedMetrics: requirement.outcomeMetrics ?? [] },
    )
  }

  if (input.scenarioId === 'scope-sweep') {
    const shortfall = scopeSweepShortfall(input.metrics)
    if (shortfall) return settle('incomplete', `Scope sweep ${shortfall}.`)
  }

  const missingMetrics = requirement.requiredMetrics.filter((name) =>
    isMissing(input.metrics, name),
  )
  if (missingMetrics.length > 0) {
    return settle(
      'incomplete',
      `Required metric(s) were never collected: ${missingMetrics.join(', ')}.`,
      {
        missingMetrics,
      },
    )
  }

  if (input.metrics.samples !== undefined && Number(input.metrics.samples) === 0) {
    return settle(
      'incomplete',
      'Zero samples were captured; this is an absence of measurement, not a zero result.',
    )
  }

  if (input.rawStatus === 'degraded') {
    return settle(
      'degraded',
      'Measured, but the scenario recorded a degraded observation — see notes.',
    )
  }

  return settle('observed', null)
}

export function applyEvidenceToMetrics(
  metrics: Record<string, SpikeMetricValue>,
  evidence: SpikeEvidence,
): Record<string, SpikeMetricValue> {
  const renames = Object.entries(evidence.renamedMetrics)
  if (
    renames.length === 0 &&
    evidence.suppressedMetrics.length === 0 &&
    evidence.unmeasuredMetrics.length === 0
  ) {
    return metrics
  }

  const next: Record<string, SpikeMetricValue> = {}
  for (const [name, value] of Object.entries(metrics)) {
    next[evidence.renamedMetrics[name] ?? name] = value
  }
  for (const name of evidence.suppressedMetrics) {
    const target = evidence.renamedMetrics[name] ?? name
    if (target in next) next[target] = null
  }

  for (const name of evidence.unmeasuredMetrics) {
    next[evidence.renamedMetrics[name] ?? name] = null
  }
  return next
}
