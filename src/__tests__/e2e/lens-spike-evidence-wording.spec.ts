import { expect, test } from '@playwright/test'

import type { Page } from '@playwright/test'

const HARNESS = '/ui/showcase/lens-spike'
const NOT_MEASURED = 'not measured'
const NEVER_EXECUTED = 'has not been executed'
const ATTEMPTED_UNVERIFIED = 'was attempted outside the automated spike runner'

async function metricText(page: Page, name: string) {
  const cell = page.locator(`[data-lens-spike-metric="${name}"]`)
  if ((await cell.count()) === 0) return null
  return (await cell.first().innerText()).trim()
}

async function expectNotMeasured(page: Page, names: ReadonlyArray<string>) {
  for (const name of names) {
    expect(await metricText(page, name), `${name} must read "${NOT_MEASURED}"`).toBe(NOT_MEASURED)
  }
}

async function openManually(page: Page, query: string) {
  await page.goto(`${HARNESS}?${query}`)
  await expect(page.locator('[data-lens-spike-banner]')).toBeVisible()

  await expect(page.locator('[data-lens-spike-execution-mode]')).toHaveText('manual')
}

test('manual scope sweep is an unexecuted preview, not a measurement', async ({ page }) => {
  await openManually(page, 'scenario=scope-sweep&variant=css&mode=measure&amount=1')

  const banner = page.locator('[data-lens-spike-banner]')
  await expect(banner).toHaveAttribute('data-lens-spike-evidence', 'manual-preview')
  await expect(page.locator('[data-lens-spike-metric="spikeComplete"]')).toHaveText('false')

  await expect(page.locator('[data-lens-spike-scenario="scope-sweep"]')).toBeVisible()
  const report = await page.evaluate(() => window.__lensSpikeReport)
  expect(report?.previewOnly).toBe(true)
  expect(report?.evidenceValid).toBe(false)

  for (const name of ['frameIntervalMedianMs', 'frameIntervalP95Ms', 'usedJsHeapBytes']) {
    expect([null, NOT_MEASURED], `${name} must not carry a sampled value`).toContain(
      await metricText(page, name),
    )
  }

  const runner = page.locator('[data-lens-spike-runner-required]')
  await expect(runner).toContainText(NEVER_EXECUTED)
  await expect(runner).toHaveAttribute('data-lens-spike-runner-state', 'not-executed')
  await expect(page.locator('[data-lens-spike-suppression]')).toHaveAttribute(
    'data-lens-spike-suppression-reason',
    'trigger-not-run',
  )
})

test('manual context loss reads as attempted-but-unverified, and claims no recovery', async ({
  page,
}) => {
  await openManually(page, 'scenario=context-loss&variant=default&mode=measure')

  const banner = page.locator('[data-lens-spike-banner]')
  await expect(banner).toHaveAttribute('data-lens-spike-evidence', 'incomplete')

  const runner = page.locator('[data-lens-spike-runner-required]')
  await expect(runner).toContainText(ATTEMPTED_UNVERIFIED)
  await expect(runner).toHaveAttribute('data-lens-spike-runner-state', 'attempted-unverified')
  await expect(banner).not.toContainText(NEVER_EXECUTED)

  await expect(page.locator('[data-lens-spike-suppression]')).toHaveAttribute(
    'data-lens-spike-suppression-reason',
    'operation-unverified',
  )

  await expectNotMeasured(page, [
    'backendAfterLoss',
    'backendAfterRestore',
    'fallbackObserved',
    'backendUnchangedAfterRestore',
    'rendererRecovered',
  ])

  expect(await metricText(page, 'lossObserved')).not.toBeNull()
  expect(await metricText(page, 'restoreObserved')).not.toBeNull()
})

test('manual vertical scroll is unverified, not unavailable', async ({ page }) => {
  const candidates = ['vertical', 'default', 'scroller']
  let matched: string | null = null

  for (const variant of candidates) {
    await openManually(page, `scenario=scroll-and-portal&variant=${variant}&mode=measure`)
    const container = await metricText(page, 'container')
    if (container !== null && container !== 'portal') {
      matched = variant
      break
    }
  }

  expect(matched, `no non-portal scroll variant among ${candidates.join(', ')}`).not.toBeNull()

  const banner = page.locator('[data-lens-spike-banner]')
  await expect(banner).toHaveAttribute('data-lens-spike-evidence', 'incomplete')
  await expect(banner).not.toHaveAttribute('data-lens-spike-evidence', 'unavailable')

  const runner = page.locator('[data-lens-spike-runner-required]')
  await expect(runner).toContainText(ATTEMPTED_UNVERIFIED)
  await expect(banner).not.toContainText(NEVER_EXECUTED)

  await expect(page.locator('[data-lens-spike-suppression]')).toHaveAttribute(
    'data-lens-spike-suppression-reason',
    'operation-unverified',
  )

  await expectNotMeasured(page, [
    'scrollDriftX',
    'scrollDriftY',
    'deltaAfterScrollX',
    'deltaAfterScrollY',
  ])
})
