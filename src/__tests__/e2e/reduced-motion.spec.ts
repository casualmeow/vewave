import { expect, test } from '@playwright/test'
import { authenticateE2EUser } from './helpers/auth'

test.describe('reduced motion', () => {
  test('studio sidebar keeps explicit state without fluid navigation', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/studio/home')

    const sidebar = page.getByLabel('Studio navigation')
    const currentItem = sidebar.locator('[aria-current="page"]')

    await expect(sidebar).toBeVisible()
    await expect(sidebar).toHaveAttribute('data-design', 'glass')
    await expect(sidebar).toHaveAttribute('data-motion', 'soft')
    await expect(currentItem).toContainText('Home')
    await expect(currentItem).toContainText('Current')
  })

  test('landing product capture remains available with reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')

    await expect(
      page.getByRole('heading', {
        name: /Launch shared video spaces that feel ready from the first click/i,
        level: 1,
      }),
    ).toBeVisible()
    await expect(page.getByRole('img', { name: /Vewave dashboard settings screen/i })).toBeVisible()
  })

  test('app sidebar keeps explicit state without fluid navigation', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width: 1440, height: 900 })
    await authenticateE2EUser(page)
    await page.goto('/projects')

    const sidebar = page.getByLabel('App navigation')
    const currentItem = sidebar.locator('[aria-current="page"]')

    await expect(sidebar).toBeVisible()
    await expect(sidebar).toHaveAttribute('data-design', 'glass')
    await expect(sidebar).toHaveAttribute('data-motion', 'soft')
    await expect(sidebar).toHaveAttribute('data-fluid-preset', 'subtle')
    await expect(currentItem).toContainText('Rooms')
    await expect(currentItem).not.toContainText('Current')
  })
})
