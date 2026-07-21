// Visual verification matrix for the glass surface system:
// light/dark × solid/glass, plus reduced-transparency and a no-backdrop-filter
// engine fallback. Screenshots land in scripts/matrix-*.png.
import { chromium } from '@playwright/test'
import { preview } from 'vite'

const appearance = (mode, surfaceStyle) =>
  JSON.stringify({
    version: 1,
    mode,
    preset: 'default',
    logoStrategy: 'auto',
    glassIntensity: 'balanced',
    surfaceStyle,
    experimentalRefraction: false,
    customTheme: { enabled: false, overrides: { light: {}, dark: {} } },
  })

const server = await preview({ preview: { port: 4173, strictPort: true } })

async function capture(
  browser,
  name,
  mode,
  surfaceStyle,
  { forceFallback = false, reducedTransparency = false } = {},
) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })

  await context.addInitScript(
    ({ forceFallback: shouldForceFallback, value }) => {
      window.localStorage.setItem('vewave:appearance', value)

      if (shouldForceFallback) {
        document.documentElement.dataset.glassCapability = 'fallback'
      }
    },
    { forceFallback, value: appearance(mode, surfaceStyle) },
  )

  const page = await context.newPage()

  if (reducedTransparency) {
    const cdp = await context.newCDPSession(page)
    await cdp.send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-transparency', value: 'reduce' }],
    })
  }

  await page.goto('http://localhost:4173/healthcheck', { waitUntil: 'networkidle' })
  await page.waitForTimeout(700)
  await page.getByRole('button', { name: 'Settings' }).first().click()
  await page.waitForTimeout(600)

  const support = await page.evaluate(() => CSS.supports('backdrop-filter', 'blur(1px)'))

  await page.screenshot({ path: `scripts/matrix-${name}.png` })
  console.log(`${name}: backdrop-filter supported=${support}, forced fallback=${forceFallback}`)
  await context.close()
}

const browser = await chromium.launch()
await capture(browser, 'light-solid', 'light', 'solid')
await capture(browser, 'light-glass', 'light', 'glass')
await capture(browser, 'dark-solid', 'dark', 'solid')
await capture(browser, 'dark-glass', 'dark', 'glass')
await capture(browser, 'reduced-transparency', 'light', 'glass', { reducedTransparency: true })
await capture(browser, 'no-backdrop-filter', 'light', 'glass', { forceFallback: true })
await browser.close()

await server.close()
console.log('done')
