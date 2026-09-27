import { fileURLToPath } from 'node:url'

import { expect, test } from '@playwright/test'

const HARNESS = '/ui/showcase/lens-spike'
const instrumentPath = fileURLToPath(
  new URL('../../../scripts/lens-spike-instrument.js', import.meta.url),
)

test('manual open of a runner-dependent route reports manual-preview, not observed', async ({
  page,
}) => {
  await page.goto(`${HARNESS}?scenario=context-loss&variant=default&mode=measure`)

  const banner = page.locator('[data-lens-spike-banner]')
  await expect(banner).toBeVisible()

  const evidenceClass = await banner.getAttribute('data-lens-spike-evidence')
  expect(['manual-preview', 'unavailable', 'incomplete']).toContain(evidenceClass)
  await expect(banner).toHaveAttribute('data-lens-spike-evidence-valid', 'false')
  await expect(page.locator('[data-lens-spike-execution-mode]')).toHaveText('manual')
  await expect(page.locator('[data-lens-spike-metric="spikeStatus"]')).not.toHaveText('observed')

  if (evidenceClass !== 'incomplete') {
    await expect(page.locator('[data-lens-spike-runner-required]')).toContainText(
      'requires the automated spike runner and has not been executed',
    )
  }

  const recovered = page.locator('[data-lens-spike-metric="rendererRecovered"]')
  if (await recovered.count()) {
    await expect(recovered).not.toHaveText('true')
  }
})

test('legacy Coupled route is marked deferred and is not acceptance evidence', async ({ page }) => {
  await page.goto(`${HARNESS}?scenario=transformed-target&variant=coupled&mode=measure`)

  const banner = page.locator('[data-lens-spike-banner]')
  await expect(banner).toHaveAttribute('data-lens-spike-evidence', 'legacy-deferred')
  await expect(page.locator('[data-lens-spike-legacy]')).toContainText('Lens-only')
  await expect(page.locator('[data-lens-spike-legacy]')).toContainText(
    'zero samples do not prove zero drift',
  )
})

test('runner-driven scope sweep reaches a complete, self-consistent record', async ({ page }) => {
  await page.addInitScript({ path: instrumentPath })
  await page.goto(`${HARNESS}?scenario=scope-sweep&variant=css&mode=measure&amount=1`)

  await expect(page.locator('[data-lens-spike-execution-mode]')).toHaveText('runner')
  await expect(page.locator('[data-lens-spike-metric="spikeComplete"]')).toHaveText('true', {
    timeout: 30_000,
  })

  const report = await page.evaluate(() => window.__lensSpikeReport)
  expect(report?.executionMode).toBe('runner')
  expect(report?.prerequisitesReady).toBe(true)
  expect(report?.spikeComplete).toBe(true)

  if (report?.status === 'observed') {
    expect(report.evidenceValid).toBe(true)
    expect(report.metrics.coldMountToAllReadyMs).not.toBeNull()
    expect(report.metrics.backendsResolved).not.toBe('none')
  } else {
    expect(report?.evidenceValid).toBe(false)
    expect(report?.evidenceReason).toBeTruthy()
  }
})
