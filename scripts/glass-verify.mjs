// Visual verification for the experimental refraction prototype (shell header).
// Injects high-contrast stripes under the header edge and compares refraction
// off vs. on. Acceptance criterion: stripes visibly displaced near the edges.
import { chromium } from '@playwright/test'
import { preview } from 'vite'

const appearance = (experimentalRefraction) =>
  JSON.stringify({
    version: 1,
    mode: 'light',
    preset: 'default',
    logoStrategy: 'auto',
    glassIntensity: 'balanced',
    surfaceStyle: 'glass',
    experimentalRefraction,
    customTheme: { enabled: false, overrides: { light: {}, dark: {} } },
  })

const server = await preview({ preview: { port: 4173, strictPort: true } })
const browser = await chromium.launch()
const shots = {}

for (const refraction of [false, true]) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2,
  })

  await context.addInitScript((value) => {
    window.localStorage.setItem('vewave:appearance', value)
  }, appearance(refraction))

  const page = await context.newPage()

  await page.goto('http://localhost:4173/healthcheck', { waitUntil: 'networkidle' })
  await page.waitForTimeout(900)

  const state = await page.evaluate(() => {
    const main = document.querySelector('main')
    if (main) {
      const stripes = document.createElement('div')
      stripes.style.cssText = [
        'height: 480px',
        'margin: 0 24px',
        'background: repeating-linear-gradient(90deg, #111 0 14px, #fff 14px 28px)',
      ].join(';')
      main.prepend(stripes)
      main.scrollTop = 220
    }
    const header = document.querySelector('[data-glass-shell-header]')
    return {
      backdropFilter: header ? getComputedStyle(header).backdropFilter : 'no header',
    }
  })

  await page.waitForTimeout(500)
  console.log(`refraction=${refraction} backdrop-filter: ${state.backdropFilter}`)

  const suffix = refraction ? 'on' : 'off'
  const path = `scripts/glass-header-${suffix}.png`
  // Header occupies y 16..80 (p-4 shell offset); capture across its bottom edge.
  await page.screenshot({ path, clip: { x: 300, y: 10, width: 520, height: 110 } })
  shots[suffix] = await page.screenshot({ clip: { x: 300, y: 10, width: 520, height: 110 } })
  await context.close()
}

const identical = Buffer.compare(shots.on, shots.off) === 0
console.log(identical ? 'FAIL: screenshots are pixel-identical' : 'OK: screenshots differ')

await browser.close()
await server.close()
