// Visual verification: settings dialog material in glass vs solid style.
import { chromium } from '@playwright/test'
import { preview } from 'vite'

const appearance = (surfaceStyle) =>
  JSON.stringify({
    version: 1,
    mode: 'light',
    preset: 'default',
    logoStrategy: 'auto',
    glassIntensity: 'balanced',
    surfaceStyle,
    experimentalRefraction: false,
    customTheme: { enabled: false, overrides: { light: {}, dark: {} } },
  })

const server = await preview({ preview: { port: 4173, strictPort: true } })
const browser = await chromium.launch()

for (const surfaceStyle of ['solid', 'glass']) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })

  await context.addInitScript((value) => {
    window.localStorage.setItem('vewave:appearance', value)
  }, appearance(surfaceStyle))

  const page = await context.newPage()

  await page.goto('http://localhost:4173/healthcheck', { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  await page.getByRole('button', { name: 'Settings' }).first().click()
  await page.waitForTimeout(700)
  await page.screenshot({ path: `scripts/settings-dialog-${surfaceStyle}.png` })
  await context.close()
}

await browser.close()
await server.close()
console.log('done')
