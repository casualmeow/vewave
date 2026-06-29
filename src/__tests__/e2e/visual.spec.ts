import { expect, test } from '@playwright/test'

const landingViewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
] as const

const studioRoutes = [
  { path: '/studio/home', label: 'Home' },
  { path: '/studio/content-manager', label: 'Content manager' },
  { path: '/studio/channel-settings', label: 'Channel Settings' },
] as const

const appRoutes = [{ path: '/projects', label: 'Projects' }] as const

test.describe('visual smoke', () => {
  for (const viewport of landingViewports) {
    test(`landing renders product capture at ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await page.goto('/')

      await expect(
        page.getByRole('heading', {
          name: /Launch shared video spaces that feel ready from the first click/i,
        }),
      ).toBeVisible()

      const productCapture = page.getByRole('img', {
        name: /Vewave dashboard settings screen/i,
      })

      await expect(productCapture).toBeVisible()
      await expect
        .poll(() =>
          productCapture.evaluate((image) => {
            if (!(image instanceof HTMLImageElement)) {
              return false
            }

            return image.complete && image.naturalWidth >= 1000 && image.naturalHeight >= 700
          }),
        )
        .toBe(true)

      const screenshot = await page.screenshot({ fullPage: true, animations: 'disabled' })

      expect(screenshot.length).toBeGreaterThan(50_000)
    })
  }

  test('landing logo and favicon follow custom brand colors', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.addInitScript(
      (appearanceSettings) => {
        window.localStorage.setItem('vewave:appearance', JSON.stringify(appearanceSettings))
      },
      {
        version: 1,
        mode: 'light',
        preset: 'default',
        logoStrategy: 'auto',
        glassIntensity: 'balanced',
        customTheme: {
          enabled: true,
          overrides: {
            light: { primary: '#0F9F6E', accent: '#F59E0B' },
            dark: {},
          },
        },
      },
    )

    await page.goto('/')

    const headerLogoLink = page.locator(
      '[data-slot="premium-header-logo"] a[data-slot="header-logo"]',
    )
    const headerLogoMark = headerLogoLink.locator('[data-vewave-logo-mark]')

    await expect(headerLogoLink).toHaveAccessibleName('Vewave')
    await expect(headerLogoMark).toHaveAttribute('data-logo-tone', 'dark')
    await expect(headerLogoMark.locator('[fill="var(--logo-dark)"]')).toHaveCount(1)
    await expect(headerLogoMark.locator('[fill="var(--logo-accent)"]')).toHaveCount(1)
    await expect
      .poll(() =>
        page.evaluate(() => {
          const styles = getComputedStyle(document.documentElement)
          const href =
            document.querySelector<HTMLLinkElement>('link[rel="icon"]')?.getAttribute('href') ?? ''
          const prefix = 'data:image/svg+xml,'
          const svg = href.startsWith(prefix) ? decodeURIComponent(href.slice(prefix.length)) : ''

          return {
            logoDark: styles.getPropertyValue('--logo-dark').trim(),
            logoLight: styles.getPropertyValue('--logo-light').trim(),
            logoAccent: styles.getPropertyValue('--logo-accent').trim(),
            faviconHasPrimary: svg.includes('fill="#0F9F6E"'),
            faviconHasAccent: svg.includes('fill="#F59E0B"'),
          }
        }),
      )
      .toEqual({
        logoDark: '#0F9F6E',
        logoLight: '#0F9F6E',
        logoAccent: '#F59E0B',
        faviconHasPrimary: true,
        faviconHasAccent: true,
      })
  })

  for (const route of studioRoutes) {
    test(`studio navigation is explicit on ${route.path}`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 })
      await page.goto(route.path)

      const navigation = page.getByLabel('Studio navigation')
      const currentItem = navigation.locator('[aria-current="page"]')

      await expect(navigation).toBeVisible()
      await expect(currentItem).toContainText(route.label)
      await expect(currentItem).toContainText('Current')

      const screenshot = await page.screenshot({ fullPage: true, animations: 'disabled' })

      expect(screenshot.length).toBeGreaterThan(25_000)
    })
  }

  for (const route of appRoutes) {
    test(`app navigation is explicit on ${route.path}`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 })
      await page.addInitScript(() => {
        window.localStorage.setItem(
          'vewave:saved-rooms:v1:guest',
          JSON.stringify([
            {
              code: 'REAL1',
              title: 'Saved guest room',
              role: 'owner',
              status: 'active',
              visibility: 'unlisted',
              provider: 'youtube',
              createdAt: '2026-05-19T12:00:00.000Z',
              lastOpenedAt: new Date().toISOString(),
            },
          ]),
        )
      })
      await page.goto(route.path)

      const navigation = page.getByLabel('App navigation')
      const currentItem = navigation.locator('[aria-current="page"]')

      await expect(navigation).toBeVisible()
      await expect(currentItem).toContainText(route.label)
      await expect(currentItem).not.toContainText('Current')
      await expect(navigation).toContainText('Saved guest room')
      await expect(navigation).not.toContainText('Friday watch room')
      await expect(navigation).not.toContainText('Healthcheck')
      await expect(navigation).not.toContainText('Appearance')

      const screenshot = await page.screenshot({ fullPage: true, animations: 'disabled' })

      expect(screenshot.length).toBeGreaterThan(50_000)
    })
  }
})
