import { Component, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { instrumentationSnapshot } from './spike-runtime'
import {
  RUNNER_COMMAND,
  applyEvidenceToMetrics,
  classifySpikeEvidence,
  formatSpikeMetric,
  requirementFor,
} from './spike-evidence'
import { spikeScenarioDefinitions, spikeScenarios } from './scenarios'
import type { ErrorInfo, ReactNode } from 'react'
import type { SpikeEvidence, SpikeEvidenceClass } from './spike-evidence'
import type { SpikeMetricValue, SpikeMode, SpikeStatus } from './types'
import { cn } from '@/shared/lib/utils'

class ScenarioBoundary extends Component<
  { onError: (error: Error) => void; children: ReactNode },
  { failed: boolean; message: string }
> {
  state = { failed: false, message: '' }

  static getDerivedStateFromError(error: Error) {
    return { failed: true, message: error.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    void info
    this.props.onError(error)
  }

  render() {
    if (this.state.failed) {
      return (
        <p
          data-lens-spike-scenario-error
          className="rounded-md border border-destructive/50 bg-destructive/5 px-3 py-2 text-xs"
        >
          Scenario module failed to load: {this.state.message}
        </p>
      )
    }
    return this.props.children
  }
}

type HarnessSelection = {
  scenario: string | null
  variant: string
  mode: SpikeMode
  amount: number
}

function readSelection(): HarnessSelection {
  if (typeof window === 'undefined') {
    return { scenario: null, variant: 'default', mode: 'measure', amount: 1 }
  }
  const params = new URLSearchParams(window.location.search)
  const mode = params.get('mode') === 'capture' ? 'capture' : 'measure'
  const amount = Number(params.get('amount'))
  return {
    scenario: params.get('scenario'),
    variant: params.get('variant') ?? 'default',
    mode,
    amount: Number.isFinite(amount) && amount > 0 ? amount : 1,
  }
}

const evidenceTone: Record<SpikeEvidenceClass, string> = {
  observed: 'border-emerald-500/50 bg-emerald-500/5',
  degraded: 'border-amber-500/50 bg-amber-500/5',
  incomplete: 'border-amber-500/50 bg-amber-500/5',
  'manual-preview': 'border-sky-500/50 bg-sky-500/5',
  unavailable: 'border-border/70 bg-muted/40',
  'legacy-deferred': 'border-violet-500/50 bg-violet-500/5',
  error: 'border-destructive/50 bg-destructive/5',
}

function EvidenceBanner({
  evidence,
  scenarioReady,
  spikeComplete,
}: {
  evidence: SpikeEvidence
  scenarioReady: boolean
  spikeComplete: boolean
}) {
  const needsRunner =
    !evidence.prerequisitesReady &&
    (evidence.evidenceClass === 'manual-preview' || evidence.evidenceClass === 'incomplete')

  const blankedMetrics = [
    ...new Set([...evidence.suppressedMetrics, ...evidence.unmeasuredMetrics]),
  ]

  return (
    <section
      data-lens-spike-banner
      data-lens-spike-evidence={evidence.evidenceClass}
      data-lens-spike-evidence-valid={evidence.evidenceValid}
      data-lens-spike-preview-telemetry={evidence.previewTelemetry}
      className={cn(
        'mb-5 grid gap-2 rounded-lg border px-3 py-2.5',
        evidenceTone[evidence.evidenceClass],
      )}
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span data-lens-spike-headline className="text-xs font-semibold tracking-tight">
          {evidence.headline}
        </span>
        <span className="font-mono text-[11px] text-muted-foreground">
          mode: <b data-lens-spike-execution-mode>{evidence.executionMode}</b> · prerequisites:{' '}
          <b>{evidence.prerequisitesReady ? 'ready' : 'missing'}</b> · ready:{' '}
          <b>{scenarioReady ? 'yes' : 'no'}</b> · complete: <b>{spikeComplete ? 'yes' : 'no'}</b> ·
          evidence: <b>{evidence.evidenceValid ? 'valid' : 'invalid'}</b>
        </span>
      </div>

      {needsRunner ? (
        <p
          data-lens-spike-runner-required
          data-lens-spike-runner-state={
            evidence.evidenceClass === 'incomplete' ? 'attempted-unverified' : 'not-executed'
          }
          className="text-xs"
        >
          {evidence.runnerMessage}{' '}
          <span className="text-muted-foreground">
            Run it through <code>{RUNNER_COMMAND}</code>
            {evidence.runnerDependency ? ` — it performs: ${evidence.runnerDependency}.` : '.'}
          </span>
        </p>
      ) : null}

      {evidence.reason ? (
        <p data-lens-spike-evidence-reason className="text-[11px] text-muted-foreground">
          {evidence.reason}
        </p>
      ) : null}

      {evidence.previewTelemetry && !evidence.evidenceValid ? (
        <p data-lens-spike-telemetry-disclaimer className="text-[11px] text-muted-foreground">
          Any values shown below are preview telemetry, not evidence: they describe this ad-hoc page
          view, and no acceptance claim may be based on them.
        </p>
      ) : null}

      {evidence.legacy ? (
        <ul data-lens-spike-legacy className="grid gap-0.5 text-[11px] text-muted-foreground">
          {evidence.legacy.detail.map((line) => (
            <li key={line}>· {line}</li>
          ))}
        </ul>
      ) : null}

      {blankedMetrics.length > 0 && evidence.suppressionMessage ? (
        <p
          data-lens-spike-suppression
          data-lens-spike-suppression-reason={evidence.suppressionReason ?? ''}
          className="text-[11px] text-muted-foreground"
        >
          {evidence.suppressionMessage} Blanked: <code>{blankedMetrics.join(', ')}</code>.
        </p>
      ) : null}
    </section>
  )
}

export function LensSpikePage() {
  const [selection, setSelection] = useState<HarnessSelection>(readSelection)
  const [metrics, setMetrics] = useState<Record<string, SpikeMetricValue>>({})
  const [rawStatus, setRawStatus] = useState<SpikeStatus>('observed')
  const [notes, setNotes] = useState<Array<string>>([])
  const [ready, setReady] = useState(false)
  const [complete, setComplete] = useState(false)
  const instrumentationReady = Boolean(instrumentationSnapshot().instrumentationReady)
  const spikeConfig = typeof window === 'undefined' ? {} : (window.__lensSpikeConfig ?? {})
  const activeDefinition = spikeScenarioDefinitions.find((item) => item.id === selection.scenario)
  const Scenario = selection.scenario ? spikeScenarios[selection.scenario] : undefined

  const scenarioKey = `${selection.scenario}:${selection.variant}:${selection.mode}:${selection.amount}`
  const publishedRef = useRef<Record<string, SpikeMetricValue>>({})

  const publish = useCallback((next: Record<string, SpikeMetricValue>) => {
    publishedRef.current = { ...publishedRef.current, ...next }
    setMetrics(publishedRef.current)
  }, [])

  const note = useCallback((message: string) => {
    setNotes((current) => (current.includes(message) ? current : [...current, message]))
  }, [])

  const handleReady = useCallback(() => setReady(true), [])
  const handleComplete = useCallback(() => setComplete(true), [])
  const handleScenarioError = useCallback(
    (error: Error) => {
      setRawStatus('error')
      note(`Scenario module failed to load: ${error.message}`)
      publish({ scenarioModuleLoaded: false, scenarioLoadError: error.message })
      setReady(true)
      setComplete(true)
    },
    [note, publish],
  )

  useEffect(() => {
    publishedRef.current = {}
    setMetrics({})
    setNotes([])
    setRawStatus('observed')
    setReady(false)
    setComplete(false)
  }, [scenarioKey])

  useEffect(() => {
    const handlePopState = () => setSelection(readSelection())
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const evidence = useMemo(
    () =>
      classifySpikeEvidence({
        scenarioId: selection.scenario,
        variant: selection.variant,
        mode: selection.mode,
        scenarioReady: ready,
        spikeComplete: complete,
        instrumentationReady,
        config: spikeConfig,
        rawStatus,
        metrics,
      }),
    [complete, instrumentationReady, metrics, ready, rawStatus, selection, spikeConfig],
  )

  const report = useMemo(
    () => ({
      scenarioId: selection.scenario ?? 'none',
      variant: selection.variant,
      mode: selection.mode,
      status: evidence.evidenceClass,

      internalScenarioState: rawStatus,
      rawStatus,
      evidenceValid: evidence.evidenceValid,
      evidenceReason: evidence.reason,
      evidenceHeadline: evidence.headline,
      runnerMessage: evidence.runnerMessage,
      suppressionReason: evidence.suppressionReason,
      previewTelemetry: evidence.previewTelemetry,
      previewOnly: evidence.previewOnly,
      executionMode: evidence.executionMode,
      prerequisitesReady: evidence.prerequisitesReady,
      scenarioReady: ready,
      spikeComplete: complete,
      metrics: applyEvidenceToMetrics({ instrumentationReady, ...metrics }, evidence),
      notes,
    }),
    [complete, evidence, instrumentationReady, metrics, notes, ready, rawStatus, selection],
  )

  const metricEntries = Object.entries(report.metrics)
  const requirement = requirementFor(selection.scenario, selection.variant)
  const blockedFromMounting = Boolean(requirement?.legacy)

  useEffect(() => {
    window.__lensSpikeReport = report
  }, [report])

  return (
    <div
      data-lens-spike
      data-lens-spike-mode={selection.mode}
      className={cn(
        'min-h-screen bg-background p-6 text-foreground',

        selection.mode === 'capture' && '[&_*]:!animate-none',
      )}
    >
      <header className="mb-5 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h1 className="text-lg font-semibold tracking-tight">Lens spike harness</h1>
        <p className="text-xs text-muted-foreground">
          Phase 2 measurement only — measures the current implementation, repairs nothing.
        </p>
      </header>

      {selection.scenario ? (
        <EvidenceBanner evidence={evidence} scenarioReady={ready} spikeComplete={complete} />
      ) : null}

      <dl className="mb-5 grid grid-cols-2 gap-x-6 gap-y-1 font-mono text-[11px] sm:grid-cols-4">
        <SpikeMetric name="instrumentationReady" value={instrumentationReady} />
        <SpikeMetric name="executionMode" value={evidence.executionMode} />
        <SpikeMetric name="scenarioId" value={report.scenarioId} />
        <SpikeMetric name="variant" value={report.variant} />
        <SpikeMetric name="mode" value={report.mode} />
        <SpikeMetric name="amount" value={selection.amount} />
        <SpikeMetric name="scenarioReady" value={ready} />
        <SpikeMetric name="spikeComplete" value={complete} />
        <SpikeMetric name="spikeStatus" value={evidence.evidenceClass} />
        <SpikeMetric name="evidenceValid" value={evidence.evidenceValid} />
        <SpikeMetric name="prerequisitesReady" value={evidence.prerequisitesReady} />
        <SpikeMetric name="previewTelemetry" value={evidence.previewTelemetry} />
      </dl>

      {!Scenario ? (
        <nav className="grid gap-2 text-sm">
          <p className="text-muted-foreground">
            Append <code>?scenario=&lt;id&gt;&amp;variant=&lt;v&gt;&amp;mode=measure|capture</code>.
          </p>
          {spikeScenarioDefinitions.map((definition) => (
            <a
              key={definition.id}
              href={`?scenario=${definition.id}&variant=${definition.variants[0]}&mode=measure`}
              className="rounded-md border border-border/70 px-3 py-2 hover:border-ring/60"
            >
              <span className="font-medium">{definition.id}</span>
              <span className="ml-2 text-xs text-muted-foreground">
                {definition.blocking.join(', ')} — {definition.description}
              </span>
            </a>
          ))}
        </nav>
      ) : (
        <section
          key={scenarioKey}
          data-lens-spike-scenario={selection.scenario}
          data-lens-spike-variant={selection.variant}
          className="grid gap-4"
        >
          <h2 className="text-sm font-semibold">{activeDefinition?.title ?? selection.scenario}</h2>
          {blockedFromMounting ? (
            <p className="rounded-md border border-dashed border-border/70 px-3 py-2 text-xs text-muted-foreground">
              This historical variant is not mounted. Coupled synchronisation is out of scope for
              the Lens-only pilot and was not re-run.
            </p>
          ) : (
            <ScenarioBoundary onError={handleScenarioError}>
              <Suspense
                fallback={<p className="text-xs text-muted-foreground">loading scenario…</p>}
              >
                <Scenario
                  variant={selection.variant}
                  mode={selection.mode}
                  amount={selection.amount}
                  onReady={handleReady}
                  publish={publish}
                  setStatus={setRawStatus}
                  note={note}
                  complete={handleComplete}
                />
              </Suspense>
            </ScenarioBoundary>
          )}
        </section>
      )}

      {selection.scenario ? (
        <details className="mt-6" open>
          <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Metrics &amp; diagnostics
          </summary>
          <dl className="mt-2 grid grid-cols-1 gap-x-6 gap-y-0.5 font-mono text-[11px] sm:grid-cols-2 lg:grid-cols-3">
            <SpikeMetric name="internalScenarioState" value={rawStatus} />
            {metricEntries.map(([name, value]) => (
              <SpikeMetric key={name} name={name} value={value} />
            ))}
          </dl>
        </details>
      ) : null}

      {notes.length > 0 ? (
        <ul data-lens-spike-notes className="mt-4 grid gap-1 text-[11px] text-muted-foreground">
          {notes.map((message) => (
            <li key={message}>· {message}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

export function SpikeMetric({ name, value }: { name: string; value: SpikeMetricValue }) {
  return (
    <div className="flex justify-between gap-3 border-b border-border/40 py-0.5">
      <dt className="truncate text-muted-foreground">{name}</dt>
      <dd data-lens-spike-metric={name} className="shrink-0 text-foreground">
        {formatSpikeMetric(value)}
      </dd>
    </div>
  )
}
