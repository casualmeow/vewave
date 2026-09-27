import { expect, test, type Page } from '@playwright/test'

const acceptanceRoute = '/ui/showcase?optical-acceptance=1'

type Region = { id: string; x: number; y: number; width: number; height: number }

type RegionStats = {
  id: string
  mean: number
  stdev: number

  signature: string
}

const panes = [
  { id: 'acceptance-main-sdf', expects: 'sdf', controlledSource: false },
  { id: 'acceptance-comparison-sdf', expects: 'sdf', controlledSource: true },
  { id: 'acceptance-stock', expects: 'transmission', controlledSource: true },
  { id: 'acceptance-patched', expects: 'transmission', controlledSource: true },
  { id: 'acceptance-css', expects: 'css', controlledSource: false },
] as const

async function webglAvailable(page: Page) {
  return page.evaluate(() => {
    try {
      const canvas = document.createElement('canvas')
      return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
    } catch {
      return false
    }
  })
}

async function measure(page: Page, png: Buffer, regions: Array<Region>) {
  return page.evaluate<Array<RegionStats>, { base64: string; regions: Array<Region> }>(
    async ({ base64, regions: crops }) => {
      const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0))
      const bitmap = await createImageBitmap(new Blob([bytes], { type: 'image/png' }))
      const canvas = document.createElement('canvas')
      canvas.width = bitmap.width
      canvas.height = bitmap.height
      const context = canvas.getContext('2d')
      if (!context) throw new Error('no 2d context')
      context.drawImage(bitmap, 0, 0)

      const scale = bitmap.width / document.documentElement.clientWidth

      return crops.map((crop) => {
        const { data } = context.getImageData(
          Math.round(crop.x * scale),
          Math.round(crop.y * scale),
          Math.max(1, Math.round(crop.width * scale)),
          Math.max(1, Math.round(crop.height * scale)),
        )
        let total = 0
        let totalSquares = 0
        const pixels = data.length / 4
        const buckets = new Array<number>(16).fill(0)
        for (let index = 0; index < data.length; index += 4) {
          const luminance =
            (0.2126 * data[index] + 0.7152 * data[index + 1] + 0.0722 * data[index + 2]) / 255
          total += luminance
          totalSquares += luminance * luminance
          buckets[Math.min(15, Math.floor(luminance * 16))] += 1
        }
        const mean = total / pixels
        return {
          id: crop.id,
          mean,
          stdev: Math.sqrt(Math.max(0, totalSquares / pixels - mean * mean)),
          signature: buckets.map((count) => Math.round((count / pixels) * 999)).join('.'),
        }
      })
    },
    { base64: png.toString('base64'), regions },
  )
}

test.describe('Phase 4.3 optical acceptance', () => {
  test('the lens family resolves truthfully and stays optically readable', async ({ page }) => {
    await page.goto(acceptanceRoute)
    test.skip(!(await webglAvailable(page)), 'no WebGL context in this environment')

    const scene = page.locator('[data-fluid-glass-acceptance-scene]')
    await expect(scene).toBeVisible()

    for (const pane of panes) {
      const group = page.locator(
        `[data-fluid-glass-validation="${pane.id}"] [data-fluid-glass-backend]`,
      )
      await expect
        .poll(async () => group.getAttribute('data-fluid-glass-backend'), { timeout: 20_000 })
        .toBe(pane.expects)

      await expect(group).not.toHaveAttribute('data-fluid-glass-scope-denial', /.+/)

      if (pane.controlledSource) {
        await expect(group).toHaveAttribute('data-fluid-glass-readability', 'readable')
      }

      await expect(
        page.locator(`[data-fluid-glass-validation="${pane.id}"] [aria-selected="true"]`),
      ).toHaveCount(1)
    }

    await expect(scene.locator('canvas')).toHaveCount(4)
    await page.waitForTimeout(800)

    const regions: Array<Region> = []
    const targetCenters: Record<string, { x: number; y: number }> = {}
    for (const pane of panes) {
      const root = page.locator(`[data-fluid-glass-validation="${pane.id}"]`)
      const group = root.locator('[data-fluid-glass-backend]').first()
      const target = root.locator('[aria-selected="true"]').first()
      const targetBox = await target.boundingBox()
      const groupBox = await group.boundingBox()
      if (!targetBox || !groupBox) throw new Error(`no lens target for ${pane.id}`)

      targetCenters[pane.id] = {
        x: targetBox.x + targetBox.width / 2,
        y: targetBox.y + targetBox.height / 2,
      }
      regions.push({ id: `${pane.id}:lens`, ...targetBox })

      regions.push({
        id: `${pane.id}:background`,
        x: groupBox.x + 4,
        y: groupBox.y + 4,
        width: Math.max(8, targetBox.x - groupBox.x - 8),
        height: groupBox.height - 8,
      })
    }

    const capture = await page.screenshot({ path: 'test-results/phase-4-3-acceptance.png' })
    const stats = await measure(page, capture, regions)
    const byId = new Map(stats.map((entry) => [entry.id, entry]))
    const stat = (id: string) => {
      const found = byId.get(id)
      if (!found) throw new Error(`missing region ${id}`)
      return found
    }

    for (const pane of panes) {
      expect(
        stat(`${pane.id}:lens`).signature,
        `${pane.id} lens differs from its own backdrop`,
      ).not.toBe(stat(`${pane.id}:background`).signature)
    }

    const distinct = new Set(
      ['acceptance-comparison-sdf', 'acceptance-stock', 'acceptance-patched', 'acceptance-css'].map(
        (id) => stat(`${id}:lens`).signature,
      ),
    )
    expect(distinct.size).toBe(4)
    expect(stat('acceptance-patched:lens').signature).not.toBe(
      stat('acceptance-stock:lens').signature,
    )

    for (const pane of panes) {
      const lens = stat(`${pane.id}:lens`)
      const backdrop = stat(`${pane.id}:background`)
      expect(lens.stdev, `${pane.id} retains background variance`).toBeGreaterThan(0.015)

      const meanDeltaLimit =
        pane.expects === 'transmission' ? 0.14 : pane.expects === 'sdf' ? 0.11 : 0.1
      const delta = lens.mean - backdrop.mean
      expect(
        delta,
        `${pane.id} (${pane.expects}) washes out its backdrop: Δ${delta.toFixed(5)} vs ${meanDeltaLimit}`,
      ).toBeLessThan(meanDeltaLimit)
      expect(
        -delta,
        `${pane.id} (${pane.expects}) darkens its backdrop: Δ${(-delta).toFixed(5)} vs ${meanDeltaLimit}`,
      ).toBeLessThan(meanDeltaLimit)

      expect(lens.mean, `${pane.id} is not solid black`).toBeGreaterThan(0.05)
      expect(lens.mean, `${pane.id} is not solid white`).toBeLessThan(0.985)
    }

    const cssLens = await page
      .locator('[data-fluid-glass-validation="acceptance-css"] [data-fluid-glass-fallback-lens]')
      .boundingBox()
    if (!cssLens) throw new Error('no CSS fallback lens element')
    const cssTarget = targetCenters['acceptance-css']
    expect(Math.abs(cssLens.x + cssLens.width / 2 - cssTarget.x)).toBeLessThanOrEqual(1)
    expect(Math.abs(cssLens.y + cssLens.height / 2 - cssTarget.y)).toBeLessThanOrEqual(1)

    expect(await scene.locator('[data-fluid-glass-backend="sdf"]').count()).toBe(2)
    expect(await scene.locator('[data-fluid-glass-backend="transmission"]').count()).toBe(2)
  })

  test('laboratory ownership is released and production is untouched', async ({ page }) => {
    await page.goto(acceptanceRoute)
    test.skip(!(await webglAvailable(page)), 'no WebGL context in this environment')
    await expect(page.locator('[data-fluid-glass-acceptance-scene]')).toBeVisible()

    await page.goto('/')
    await expect(page.locator('[data-fluid-glass-acceptance-scene]')).toHaveCount(0)
    const productionWebgl = await page
      .locator('[data-fluid-glass-backend="sdf"], [data-fluid-glass-backend="transmission"]')
      .count()
    expect(productionWebgl).toBeLessThanOrEqual(1)
  })
})
