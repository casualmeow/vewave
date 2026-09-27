import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

import { expect, test } from '@playwright/test'

import { cellId, cellTitle, lensSpikeMatrix } from '../../../scripts/lens-spike-matrix.mjs'

const artifactRoot = join(process.cwd(), 'artifacts', 'lens-spike')
const instrumentPath = join(process.cwd(), 'scripts', 'lens-spike-instrument.js')

test.describe.configure({ mode: 'serial' })

function writeFile(path: string, contents: string) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, contents)
}

for (const cell of lensSpikeMatrix) {
  test(cellTitle(cell), async ({ page }, testInfo) => {
    test.setTimeout(180_000)
    const engine = testInfo.project.name
    const id = cellId(cell)
    const consoleLines: Array<string> = []

    await page.addInitScript((config) => {
      window.__lensSpikeConfig = config
    }, cell.config ?? {})
    await page.addInitScript({ path: instrumentPath })

    page.on('console', (message) => {
      if (message.type() === 'error' || message.type() === 'warning') {
        consoleLines.push(`[${message.type()}] ${message.text()}`)
      }
    })
    page.on('pageerror', (error) => consoleLines.push(`[pageerror] ${error.message}`))

    await page.setViewportSize({ width: 1280, height: 900 })

    const search = new URLSearchParams({
      scenario: cell.scenarioId,
      variant: cell.variant,
      mode: cell.mode,
      amount: String(cell.amount),
    })

    let status:
      | 'observed'
      | 'degraded'
      | 'unavailable'
      | 'error'
      | 'manual-preview'
      | 'incomplete'
      | 'legacy-deferred' = 'observed'
    const notes: Array<string> = []
    let metrics: Record<string, number | string | boolean | null> = {}

    try {
      await page.goto(`/ui/showcase/lens-spike?${search.toString()}`, { waitUntil: 'load' })

      await expect(
        page.locator('[data-lens-spike-metric="instrumentationReady"]').first(),
      ).toHaveText('true', { timeout: 20_000 })
      await expect(page.locator('[data-lens-spike-metric="scenarioReady"]').first()).toHaveText(
        'true',
        { timeout: 60_000 },
      )
      await expect(page.locator('[data-lens-spike-metric="spikeComplete"]').first()).toHaveText(
        'true',
        { timeout: 150_000 },
      )

      await page.waitForFunction(
        () => {
          const report = window.__lensSpikeReport
          if (!report) return false
          return (
            Object.keys(report.metrics).filter((key) => key !== 'instrumentationReady').length > 0
          )
        },
        undefined,
        { timeout: 15_000 },
      )

      const report = await page.evaluate(() => window.__lensSpikeReport)
      metrics = report?.metrics ?? {}
      status = report?.status ?? 'error'
      notes.push(...(report?.notes ?? []))
    } catch (error) {
      status = 'error'
      notes.push(`Scenario did not complete: ${(error as Error).message}`)
    }

    if (cell.mode === 'capture' && cell.visual) {
      const screenshotPath = join(
        artifactRoot,
        'screens',
        engine,
        `${cell.scenarioId}-${cell.variant}.png`,
      )
      mkdirSync(dirname(screenshotPath), { recursive: true })
      const scenario = page.locator(`[data-lens-spike-scenario="${cell.scenarioId}"]`)
      const target = (await scenario.count()) > 0 ? scenario : page.locator('body')
      await target.screenshot({ path: screenshotPath, animations: 'disabled' })
      metrics.screenshot = `screens/${engine}/${cell.scenarioId}-${cell.variant}.png`
    }

    const record = {
      scenarioId: cell.scenarioId,
      engine,
      engineVersion: page.context().browser()?.version() ?? 'unknown',
      variant: cell.variant,
      mode: cell.mode,
      metrics: { ...metrics, amount: cell.amount, blocking: cell.blocking.join(',') },
      status,
      notes,
    }

    writeFile(join(artifactRoot, 'raw', engine, `${id}.json`), JSON.stringify(record, null, 2))
    if (consoleLines.length > 0) {
      writeFile(join(artifactRoot, 'raw', engine, 'console', `${id}.log`), consoleLines.join('\n'))
    }

    expect(['observed', 'degraded', 'unavailable', 'error']).toContain(status)
  })
}
