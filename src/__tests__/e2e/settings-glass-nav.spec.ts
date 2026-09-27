import { expect, test, type Page } from '@playwright/test'
import { authenticateE2EUser } from './helpers/auth'

const artifacts = 'artifacts/phase-5'

const geometryToleranceP = 2.5

async function openSettings(page: Page) {
  await authenticateE2EUser(page)
  await page.goto('/projects')

  await page.evaluate(() => {
    document.documentElement.dataset.surfaceStyle = 'glass'
  })
  await page.getByRole('button', { name: 'Settings', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  return page.getByRole('navigation', { name: 'Settings sections' })
}

function lensBody(page: Page) {
  return page.locator('.fluid-glass-settings-nav [data-fluid-glass-fallback-lens]')
}

async function expectLensOverSelectedItem(page: Page, label: string) {
  const selected = page.getByRole('button', { name: label }).and(page.locator('[aria-current]'))
  await expect(selected).toHaveAttribute('aria-current', 'page')

  await expect
    .poll(
      async () => {
        const lens = await lensBody(page).boundingBox()
        const item = await selected.boundingBox()
        if (!lens || !item) return Number.POSITIVE_INFINITY
        return Math.max(
          Math.abs(lens.x - item.x),
          Math.abs(lens.y - item.y),
          Math.abs(lens.width - item.width),
          Math.abs(lens.height - item.height),
        )
      },
      { timeout: 4_000, message: `lens did not settle over "${label}"` },
    )
    .toBeLessThanOrEqual(geometryToleranceP)
}

test.describe('settings navigation glass pilot', () => {
  test('lens follows click selection and stays over the selected item', async ({ page }) => {
    const nav = await openSettings(page)

    const group = nav.locator('[data-fluid-glass-group]')
    await expect(group).toHaveAttribute('data-fluid-glass-resolved-backend', 'css-approximation')
    await expect(group).toHaveAttribute('data-fluid-glass-source', 'arbitrary-dom')

    await expectLensOverSelectedItem(page, 'Appearance')

    await page.getByRole('button', { name: 'Watch history' }).click()
    await expectLensOverSelectedItem(page, 'Watch history')

    await expect(page.getByRole('heading', { name: 'Watch history' })).toBeVisible()
  })

  test('lens follows keyboard selection', async ({ page }) => {
    const page1 = await openSettings(page)
    await expect(page1).toBeVisible()

    await page.getByRole('button', { name: 'Appearance' }).focus()
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
    await expectLensOverSelectedItem(page, 'Pinned items')

    await expect(page.getByRole('button', { name: 'Pinned items' })).toBeFocused()

    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
    await expectLensOverSelectedItem(page, 'Watch history')
  })

  test('geometry survives resize and container scroll', async ({ page }) => {
    await openSettings(page)
    await page.getByRole('button', { name: 'Account' }).click()
    await expectLensOverSelectedItem(page, 'Account')

    await page.setViewportSize({ width: 900, height: 700 })
    await expectLensOverSelectedItem(page, 'Account')

    await page.setViewportSize({ width: 1280, height: 720 })
    await expectLensOverSelectedItem(page, 'Account')

    await page.mouse.wheel(0, 240)
    await expectLensOverSelectedItem(page, 'Account')
  })

  test('narrow layout keeps the lens on the horizontal rail', async ({ page }) => {
    await page.setViewportSize({ width: 420, height: 820 })
    await openSettings(page)
    await expectLensOverSelectedItem(page, 'Appearance')

    await page.getByRole('button', { name: 'Account' }).click()
    await expectLensOverSelectedItem(page, 'Account')
  })

  test('reduced transparency downgrades to a usable solid fallback', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.addInitScript(() => {
      const original = window.matchMedia.bind(window)
      window.matchMedia = (query: string) => {
        const result = original(query)
        if (!query.includes('prefers-reduced-transparency')) return result
        return { ...result, matches: true, media: query }
      }
    })

    const nav = await openSettings(page)
    const group = nav.locator('[data-fluid-glass-group]')
    await expect(group).toHaveAttribute('data-fluid-glass-resolved-backend', 'solid')
    await expect(group).toHaveAttribute('data-fluid-glass-accessibility-enforced', 'true')

    await page.getByRole('button', { name: 'Watch history' }).click()
    await expect(page.getByRole('button', { name: 'Watch history' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await expect(page.getByRole('heading', { name: 'Watch history' })).toBeVisible()
    await page
      .getByRole('dialog')
      .screenshot({ path: `${artifacts}/settings-reduced-transparency.png` })
  })

  test('captures real settings evidence', async ({ page }) => {
    const nav = await openSettings(page)
    const dialog = page.getByRole('dialog')

    await page.evaluate(() => document.documentElement.classList.add('dark'))
    await expectLensOverSelectedItem(page, 'Appearance')
    await dialog.screenshot({ path: `${artifacts}/settings-dark-appearance.png` })
    await nav.screenshot({ path: `${artifacts}/settings-dark-nav-appearance.png` })

    await page.getByRole('button', { name: 'Watch history' }).click()
    await expectLensOverSelectedItem(page, 'Watch history')
    await dialog.screenshot({ path: `${artifacts}/settings-dark-history.png` })

    await page.evaluate(() => document.documentElement.classList.remove('dark'))
    await expectLensOverSelectedItem(page, 'Watch history')
    await dialog.screenshot({ path: `${artifacts}/settings-light-history.png` })

    await page.setViewportSize({ width: 420, height: 820 })
    await page.evaluate(() => document.documentElement.classList.add('dark'))
    await expectLensOverSelectedItem(page, 'Watch history')
    await dialog.screenshot({ path: `${artifacts}/settings-narrow-history.png` })
  })
})
