import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const artifactRoot = join(process.cwd(), 'artifacts', 'lens-spike')
const screensRoot = join(artifactRoot, 'screens')

if (!existsSync(screensRoot)) {
  console.error(`No screenshots at ${screensRoot}.`)
  process.exit(1)
}

const mustDiffer = [
  ['controlled-image', 'sdf', 'solid'],
  ['controlled-image', 'transmission', 'solid'],
  ['controlled-image', 'sdf', 'css-approximation'],
  ['arbitrary-dom', 'native-svg', 'solid'],
  ['arbitrary-dom', 'css-approximation', 'solid'],
  ['transformed-target', 'coupled', 'stationary'],
  ['scope-sweep', 'sdf', 'css'],
]

const files = new Map()
for (const engineEntry of readdirSync(screensRoot, { withFileTypes: true })) {
  if (!engineEntry.isDirectory()) continue
  const engine = engineEntry.name
  for (const name of readdirSync(join(screensRoot, engine))) {
    if (!name.endsWith('.png')) continue
    const bytes = readFileSync(join(screensRoot, engine, name))
    files.set(`${engine}/${name}`, {
      engine,
      name,
      bytes: bytes.length,
      sha256: createHash('sha256').update(bytes).digest('hex').slice(0, 16),
    })
  }
}

const byEngineHash = new Map()
for (const [key, info] of files) {
  const groupKey = `${info.engine}|${info.sha256}`
  if (!byEngineHash.has(groupKey)) byEngineHash.set(groupKey, [])
  byEngineHash.get(groupKey).push(key)
}
const duplicateGroups = [...byEngineHash.values()].filter((group) => group.length > 1)

const comparisons = []
for (const engineEntry of readdirSync(screensRoot, { withFileTypes: true })) {
  if (!engineEntry.isDirectory()) continue
  const engine = engineEntry.name
  for (const [scenario, left, right] of mustDiffer) {
    const leftKey = `${engine}/${scenario}-${left}.png`
    const rightKey = `${engine}/${scenario}-${right}.png`
    const leftInfo = files.get(leftKey)
    const rightInfo = files.get(rightKey)
    if (!leftInfo || !rightInfo) {
      comparisons.push({ engine, scenario, left, right, result: 'missing-capture' })
      continue
    }
    comparisons.push({
      engine,
      scenario,
      left,
      right,
      leftSha: leftInfo.sha256,
      rightSha: rightInfo.sha256,
      leftBytes: leftInfo.bytes,
      rightBytes: rightInfo.bytes,
      result: leftInfo.sha256 === rightInfo.sha256 ? 'IDENTICAL' : 'distinct',
    })
  }
}

const lines = []
lines.push('# Lens spike — screenshot integrity', '')
lines.push(`${files.size} capture(s) hashed (sha256, first 16 hex chars).`, '')
lines.push(
  'Different filenames are not proof of different rendering; these are content hashes.',
  '',
)

lines.push('## Variants that must render differently', '')
lines.push(
  '| engine | scenario | a | b | result | a bytes | b bytes |',
  '| --- | --- | --- | --- | --- | --- | --- |',
)
for (const entry of comparisons) {
  lines.push(
    `| ${entry.engine} | ${entry.scenario} | ${entry.left} | ${entry.right} | ${entry.result} | ${entry.leftBytes ?? '—'} | ${entry.rightBytes ?? '—'} |`,
  )
}
lines.push('')

lines.push('## Identical captures within an engine', '')
if (duplicateGroups.length === 0) {
  lines.push('None — every capture is byte-distinct within its engine.', '')
} else {
  for (const group of duplicateGroups) {
    lines.push(
      `- \`${files.get(group[0]).sha256}\`: ${group.map((key) => `\`${key}\``).join(', ')}`,
    )
  }
  lines.push('')
}

lines.push('## All captures', '')
lines.push('| capture | bytes | sha256 |', '| --- | --- | --- |')
for (const key of [...files.keys()].sort()) {
  const info = files.get(key)
  lines.push(`| \`${key}\` | ${info.bytes} | \`${info.sha256}\` |`)
}
lines.push('')

writeFileSync(join(artifactRoot, 'screenshot-integrity.md'), `${lines.join('\n')}\n`)

const identical = comparisons.filter((entry) => entry.result === 'IDENTICAL')
const missing = comparisons.filter((entry) => entry.result === 'missing-capture')
console.log(`hashed ${files.size} capture(s)`)
console.log(
  `must-differ comparisons: ${comparisons.length}, identical: ${identical.length}, missing: ${missing.length}`,
)
console.log(`duplicate groups within an engine: ${duplicateGroups.length}`)
for (const entry of identical) {
  console.log(`  IDENTICAL: ${entry.engine} ${entry.scenario} ${entry.left} == ${entry.right}`)
}
console.log(`wrote ${join(artifactRoot, 'screenshot-integrity.md')}`)
