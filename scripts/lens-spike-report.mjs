import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { blockingEvidence, cellId, engines, lensSpikeMatrix } from './lens-spike-matrix.mjs'

const artifactRoot = join(process.cwd(), 'artifacts', 'lens-spike')
const rawRoot = join(artifactRoot, 'raw')

const requiredFields = [
  'scenarioId',
  'engine',
  'engineVersion',
  'variant',
  'mode',
  'metrics',
  'status',
  'notes',
]
const validStatuses = new Set(['observed', 'degraded', 'unavailable', 'error'])

const records = []
const invalid = []
const enginesSeen = new Set()

if (!existsSync(rawRoot)) {
  console.error(`No shards found at ${rawRoot}. Run "npm run spike:lens" first.`)
  process.exit(1)
}

for (const engine of readdirSync(rawRoot, { withFileTypes: true })) {
  if (!engine.isDirectory()) continue
  enginesSeen.add(engine.name)
  const engineDir = join(rawRoot, engine.name)
  for (const entry of readdirSync(engineDir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.json')) continue
    const path = join(engineDir, entry.name)
    let parsed
    try {
      parsed = JSON.parse(readFileSync(path, 'utf8'))
    } catch (error) {
      invalid.push(`${path}: unparseable (${error.message})`)
      continue
    }
    const missingFields = requiredFields.filter((field) => !(field in parsed))
    if (missingFields.length > 0) {
      invalid.push(`${path}: missing ${missingFields.join(', ')}`)
      continue
    }
    if (!validStatuses.has(parsed.status)) {
      invalid.push(`${path}: invalid status "${parsed.status}"`)
      continue
    }

    const payloadKeys = Object.keys(parsed.metrics ?? {}).filter(
      (key) => !['instrumentationReady', 'amount', 'blocking'].includes(key),
    )
    if (payloadKeys.length === 0 && parsed.status !== 'unavailable') {
      parsed.status = 'error'
      parsed.notes = [
        ...(parsed.notes ?? []),
        'No scenario metrics were captured; status downgraded to error by the report script.',
      ]
    }
    records.push(parsed)
  }
}

records.sort((left, right) => {
  const key = (record) =>
    `${record.scenarioId}|${record.variant}|${record.mode}|${String(record.metrics?.amount ?? 1).padStart(3, '0')}|${record.engine}`
  return key(left) < key(right) ? -1 : key(left) > key(right) ? 1 : 0
})

const ranEngines = engines.filter((engine) => enginesSeen.has(engine))
const missingEngines = engines.filter((engine) => !enginesSeen.has(engine))
const found = new Set(records.map((record) => `${record.engine}|${cellIdOf(record)}`))
const missingCells = []

function cellIdOf(record) {
  const amount = Number(record.metrics?.amount ?? 1)
  const amountPart = amount > 1 ? `-x${amount}` : ''
  return `${record.scenarioId}-${record.variant}${amountPart}-${record.mode}`
}

for (const engine of ranEngines) {
  for (const cell of lensSpikeMatrix) {
    if (!found.has(`${engine}|${cellId(cell)}`)) {
      missingCells.push({ engine, cell: cellId(cell), blocking: cell.blocking.join(',') })
    }
  }
}

function statusCounts(filter) {
  const counts = { observed: 0, degraded: 0, unavailable: 0, error: 0 }
  for (const record of records.filter(filter)) counts[record.status] += 1
  return counts
}

function formatCounts(counts, expected) {
  const total = counts.observed + counts.degraded + counts.unavailable + counts.error
  if (total === 0) return expected > 0 ? `missing (0/${expected})` : '—'
  const parts = Object.entries(counts)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => `${value} ${name}`)
  const suffix = total < expected ? ` · ${expected - total} missing` : ''
  return `${parts.join(', ')}${suffix}`
}

const blockingRows = Object.entries(blockingEvidence).map(([id, description]) => {
  const cells = lensSpikeMatrix.filter((cell) => cell.blocking.includes(id))
  const cellIds = new Set(cells.map((cell) => cellId(cell)))
  const row = { id, description, engines: {} }
  for (const engine of ranEngines) {
    const counts = statusCounts(
      (record) => record.engine === engine && cellIds.has(cellIdOf(record)),
    )
    row.engines[engine] = formatCounts(counts, cellIds.size)
  }
  return row
})

const highlightMetrics = {
  'arbitrary-dom': [
    'nativeRefractionSupported',
    'nativeRefractionActive',
    'lensMechanism',
    'frameIntervalMedianMs',
  ],
  'controlled-image': [
    'resolvedBackend',
    'telemetryFrames',
    'frameIntervalMedianMs',
    'frameIntervalP95Ms',
  ],
  'fallback-edges': [
    'resolvedBackend',
    'edgeMechanism',
    'spikeCanvasTaintObserved',
    'reducedTransparencyMechanism',
  ],
  'transformed-target': [
    'geometryChannel',
    'samples',
    'maxDeltaX',
    'maxDeltaY',
    'maxDeltaWidth',
    'meanDeltaMagnitude',
  ],
  teardown: [
    'cyclesRequested',
    'webglContextsCreated',
    'canvasesRemainingAfterUnmount',
    'resizeObserversConstructed',
    'resizeObserversDisconnected',
    'resizeObserversLive',
    'rafPendingAfterSettle',
    'usedJsHeapBytesBefore',
    'usedJsHeapBytesAfter',
  ],
  'context-loss': [
    'extensionAvailable',
    'lossObserved',
    'fallbackObserved',
    'restoreObserved',
    'rendererRecovered',
    'backendBefore',
    'backendAfterLoss',
    'backendAfterRestore',
  ],
  'scope-sweep': [
    'groupsRequested',
    'webglContextsCreated',
    'liveCanvasCount',
    'webglContextCreationMsMax',
    'coldMountToAllReadyMs',
    'frameIntervalMedianMs',
    'frameIntervalP95Ms',
    'webglContextLost',
    'usedJsHeapBytes',
  ],
  'scroll-and-portal': [
    'resolvedBackend',
    'deltaBeforeScrollX',
    'deltaAfterScrollX',
    'scrollDriftX',
    'scrollDriftY',
  ],
}

function renderValue(value) {
  if (value === undefined || value === null) return '`null`'
  if (typeof value === 'boolean') return value ? '`true`' : '`false`'
  return `\`${String(value)}\``
}

mkdirSync(artifactRoot, { recursive: true })

const merged = {
  generatedAt: new Date().toISOString(),
  enginesRun: ranEngines,
  enginesMissing: missingEngines,
  recordCount: records.length,
  invalidShards: invalid,
  missingCells,
  records,
}

writeFileSync(join(artifactRoot, 'results.json'), `${JSON.stringify(merged, null, 2)}\n`)

for (const engine of ranEngines) {
  const consoleDir = join(rawRoot, engine, 'console')
  if (!existsSync(consoleDir)) continue
  const lines = []
  for (const entry of readdirSync(consoleDir).sort()) {
    lines.push(
      `### ${entry.replace(/\.log$/, '')}`,
      readFileSync(join(consoleDir, entry), 'utf8'),
      '',
    )
  }
  writeFileSync(join(rawRoot, engine, 'console.log'), lines.join('\n'))
}

const lines = []
lines.push('# Lens spike — Phase 2 evidence', '')
lines.push(`Generated ${merged.generatedAt}.`, '')
lines.push(
  '> Passing Playwright WebKit does not certify desktop Safari or iOS Safari.',
  '',
  'Raw observations only. No thresholds, budgets or viability verdicts are recorded here —',
  'selecting those is Phase 3. Results showing a leak, a failed recovery or a geometry',
  'desync are the intended deliverable of this phase, not defects introduced by it.',
  '',
)

if (missingEngines.length > 0) {
  lines.push(`**Engines with no shards:** ${missingEngines.join(', ')}.`, '')
}
if (invalid.length > 0) {
  lines.push('**Invalid shards:**', '', ...invalid.map((entry) => `- ${entry}`), '')
}

lines.push('## Blocking evidence matrix', '')
lines.push(`| ID | Evidence | ${ranEngines.join(' | ')} |`)
lines.push(`| --- | --- | ${ranEngines.map(() => '---').join(' | ')} |`)
for (const row of blockingRows) {
  lines.push(
    `| ${row.id} | ${row.description} | ${ranEngines.map((engine) => row.engines[engine] ?? '—').join(' | ')} |`,
  )
}
lines.push('')

lines.push('## Missing cells', '')
if (missingCells.length === 0) {
  lines.push('None — every matrix cell produced a record for every engine that ran.', '')
} else {
  lines.push('| Engine | Cell | Blocking |', '| --- | --- | --- |')
  for (const entry of missingCells) {
    lines.push(`| ${entry.engine} | \`${entry.cell}\` | ${entry.blocking} |`)
  }
  lines.push('')
}

const unavailableRecords = records.filter((record) => record.status === 'unavailable')
lines.push('## Unavailable cells and the production seam each would require', '')
if (unavailableRecords.length === 0) {
  lines.push('None.', '')
} else {
  for (const record of unavailableRecords) {
    lines.push(
      `- **${record.scenarioId} · ${record.variant} · ${record.engine}** — ${record.notes.join(' ') || 'no explanation recorded'}`,
    )
  }
  lines.push('')
}

lines.push('## Records by scenario', '')
const scenarioIds = [...new Set(lensSpikeMatrix.map((cell) => cell.scenarioId))]
for (const scenarioId of scenarioIds) {
  const scenarioRecords = records.filter((record) => record.scenarioId === scenarioId)
  if (scenarioRecords.length === 0) continue
  const columns = highlightMetrics[scenarioId] ?? []
  lines.push(`### ${scenarioId}`, '')
  lines.push(`| variant | mode | engine | status | ${columns.join(' | ')} |`)
  lines.push(`| --- | --- | --- | --- | ${columns.map(() => '---').join(' | ')} |`)
  for (const record of scenarioRecords) {
    const amount = Number(record.metrics?.amount ?? 1)
    const variantLabel = amount > 1 ? `${record.variant} ×${amount}` : record.variant
    lines.push(
      `| ${variantLabel} | ${record.mode} | ${record.engine} | ${record.status} | ${columns
        .map((column) => renderValue(record.metrics?.[column]))
        .join(' | ')} |`,
    )
  }
  lines.push('')
}

const allNotes = new Map()
for (const record of records) {
  for (const note of record.notes) {
    const key = note
    if (!allNotes.has(key)) allNotes.set(key, new Set())
    allNotes.get(key).add(`${record.engine}/${record.scenarioId}·${record.variant}`)
  }
}
lines.push('## Notes', '')
if (allNotes.size === 0) {
  lines.push('None.', '')
} else {
  for (const [note, sources] of [...allNotes.entries()].sort()) {
    lines.push(`- ${note}`, `  <sub>${[...sources].sort().join(', ')}</sub>`)
  }
  lines.push('')
}

lines.push('## Screenshots', '')
const screenshotRecords = records.filter((record) => record.metrics?.screenshot)
if (screenshotRecords.length === 0) {
  lines.push('None captured.', '')
} else {
  lines.push(`${screenshotRecords.length} deterministic captures under \`screens/\`.`, '')
  lines.push('| scenario | variant | engine | path |', '| --- | --- | --- | --- |')
  for (const record of screenshotRecords) {
    lines.push(
      `| ${record.scenarioId} | ${record.variant} | ${record.engine} | \`${record.metrics.screenshot}\` |`,
    )
  }
  lines.push('')
}

writeFileSync(join(artifactRoot, 'results.md'), `${lines.join('\n')}\n`)

console.log(
  `merged ${records.length} record(s) across ${ranEngines.length} engine(s); ` +
    `${missingCells.length} missing cell(s); ${invalid.length} invalid shard(s)`,
)
console.log(`wrote ${join(artifactRoot, 'results.json')}`)
console.log(`wrote ${join(artifactRoot, 'results.md')}`)
