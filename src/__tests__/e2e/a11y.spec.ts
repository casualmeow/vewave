import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { authenticateE2EUser } from './helpers/auth'

test.describe('accessibility smoke', () => {
  test('landing has no automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('main')).toBeVisible()
    await expect(
      page.getByRole('heading', {
        name: /Launch shared video spaces that feel ready from the first click/i,
        level: 1,
      }),
    ).toBeVisible()

    const results = await new AxeBuilder({ page }).analyze()

    expect(results.violations).toEqual([])
  })

  test('studio sidebar has no automatically detectable accessibility issues', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/studio/home')

    await expect(page.getByLabel('Studio navigation')).toBeVisible()

    const results = await new AxeBuilder({ page })
      .include('[aria-label="Studio navigation"]')
      .analyze()

    expect(results.violations).toEqual([])
  })

  test('app sidebar has no automatically detectable accessibility issues', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await authenticateE2EUser(page)
    await page.goto('/projects')

    await expect(page.getByLabel('App navigation')).toBeVisible()

    const results = await new AxeBuilder({ page })
      .include('[aria-label="App navigation"]')
      .analyze()

    expect(results.violations).toEqual([])
  })
})
