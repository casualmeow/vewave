import { expect, type Locator, type Page, test } from '@playwright/test'
import { authenticateE2EUser } from './helpers/auth'

test.describe('keyboard focus', () => {
  test('studio current navigation item is reachable and visibly focused', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/studio/home')

    const navigation = page.getByLabel('Studio navigation')
    const currentItem = navigation.locator('[aria-current="page"]')

    await expect(navigation).toBeVisible()
    await expect(currentItem).toContainText('Home')
    await expect(currentItem).toContainText('Current')

    await tabUntilFocused(page, currentItem)
    await expect(currentItem).toBeFocused()

    const hasVisibleFocusTreatment = await currentItem.evaluate((element) => {
      const computed = window.getComputedStyle(element)
      const hasBoxShadow = computed.boxShadow !== 'none'
      const hasOutline = computed.outlineStyle !== 'none' && computed.outlineWidth !== '0px'

      return hasBoxShadow || hasOutline
    })

    expect(hasVisibleFocusTreatment).toBe(true)
  })

  test('landing primary action is reachable by keyboard', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')

    const primaryAction = page.locator('#overview').getByRole('link', { name: /Create room/i })

    await expect(primaryAction).toBeVisible()
    await tabUntilFocused(page, primaryAction)
    await expect(primaryAction).toBeFocused()
  })

  test('app current navigation item is reachable and visibly focused', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await authenticateE2EUser(page)
    await page.goto('/projects')

    const navigation = page.getByLabel('App navigation')
    const currentItem = navigation.locator('[aria-current="page"]')

    await expect(navigation).toBeVisible()
    await expect(currentItem).toContainText('Rooms')
    await expect(currentItem).not.toContainText('Current')

    await tabUntilFocused(page, currentItem)
    await expect(currentItem).toBeFocused()

    const hasVisibleFocusTreatment = await currentItem.evaluate((element) => {
      const computed = window.getComputedStyle(element)
      const hasBoxShadow = computed.boxShadow !== 'none'
      const hasOutline = computed.outlineStyle !== 'none' && computed.outlineWidth !== '0px'

      return hasBoxShadow || hasOutline
    })

    expect(hasVisibleFocusTreatment).toBe(true)
  })
})

async function tabUntilFocused(page: Page, locator: Locator, maxTabs = 24) {
  for (let tabIndex = 0; tabIndex < maxTabs; tabIndex += 1) {
    if (await isFocused(locator)) {
      return
    }

    await page.keyboard.press('Tab')
  }

  if (await isFocused(locator)) {
    return
  }

  throw new Error(`Expected element to receive focus within ${maxTabs} Tab presses.`)
}

async function isFocused(locator: Locator) {
  return locator.evaluate((element) => element === document.activeElement).catch(() => false)
}
