import { spawnSync } from 'node:child_process'
import { existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'

import { engines as allEngines } from './lens-spike-matrix.mjs'

const requested = process.argv.slice(2).filter((argument) => allEngines.includes(argument))
const engines = requested.length > 0 ? requested : allEngines
const specPath = 'src/__tests__/e2e/lens-spike.spec.ts'
const rawRoot = join(process.cwd(), 'artifacts', 'lens-spike', 'raw')

if (existsSync(rawRoot)) {
  rmSync(rawRoot, { recursive: true, force: true })
  console.log(`cleaned ${rawRoot}`)
}

const failures = []
for (const engine of engines) {
  console.log(`\n=== lens spike · ${engine} ===`)
  const result = spawnSync(
    'npx',
    ['playwright', 'test', specPath, `--project=${engine}`, '--workers=1', '--reporter=list'],
    { stdio: 'inherit', shell: true },
  )
  if (result.status !== 0) {
    failures.push(`${engine} (exit ${result.status})`)
  }
}

console.log('\n=== merging shards ===')
const report = spawnSync('node', ['scripts/lens-spike-report.mjs'], {
  stdio: 'inherit',
  shell: true,
})

if (failures.length > 0) {
  console.warn(`\nEngines with a non-zero Playwright exit: ${failures.join(', ')}`)
  console.warn('Check artifacts/lens-spike/results.md for missing cells.')
}

process.exit(report.status ?? 1)
