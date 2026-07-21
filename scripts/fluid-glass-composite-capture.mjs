// Capture harness for the fluid-glass transmission composite pass.
// Usage: node scripts/fluid-glass-composite-capture.mjs <outputDir> <baseline|final> [baseUrl]
// Drives the /ui/showcase material lab against a running dev server and saves
// 1:1 browser-scale captures plus the displacement/luminance telemetry text.
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { chromium } from '@playwright/test'

const outputDir = process.argv[2] ?? 'artifacts/fluid-glass-transmission-composite'
const phase = process.argv[3] ?? 'final'
const baseUrl = process.argv[4] ?? 'http://localhost:3000'

mkdirSync(outputDir, { recursive: true })

const browser = await chromium.launch()
const context = await browser.newContext({
  viewport: { width: 1680, height: 1050 },
  deviceScaleFactor: 1,
})
const page = await context.newPage()

const consoleIssues = []
page.on('console', (message) => {
  if (message.type() === 'error' || message.type() === 'warning') {
    consoleIssues.push(`[${message.type()}] ${message.text()}`)
  }
})
page.on('pageerror', (error) => consoleIssues.push(`[pageerror] ${error.message}`))

await page.goto(`${baseUrl}/ui/showcase`, { waitUntil: 'networkidle' })
await page.waitForSelector('[data-fluid-glass-tab-comparison]', { timeout: 20_000 })
// The shader debug buttons live inside collapsed <details> panels.
await page.$$eval('details', (panels) => panels.forEach((panel) => (panel.open = true)))
await page.waitForTimeout(1_600)

const comparison = page.locator('[data-fluid-glass-tab-comparison]')
const sdfPane = comparison.locator(':scope > div.grid > div').nth(0)
const transmissionPane = comparison.locator(':scope > div.grid > div').nth(1)
const calibrationSection = page.locator('[data-fluid-glass-calibration]')
const calibrationSurface = page.locator('[data-fluid-glass-calibration-surface]')

async function shoot(locator, name) {
  await page.waitForTimeout(700)
  await locator.scrollIntoViewIfNeeded()
  await page.waitForTimeout(500)
  await locator.screenshot({ path: join(outputDir, name), animations: 'disabled' })
  console.log(`captured ${name}`)
}

async function clickButton(name) {
  await page.getByRole('button', { name, exact: true }).first().click()
  await page.waitForTimeout(650)
}

async function setDebugView(label) {
  await clickButton(label)
}

async function telemetryText() {
  const block = calibrationSection.locator('.font-mono').first()
  return (await block.innerText()).replace(/\s+·\s+/g, ' · ')
}

const prefix = phase === 'baseline' ? 'baseline' : 'pass'
const telemetryLog = []

// "quad" phase: only the four acceptance captures (side-by-side, expressive
// tab, light field, dark field) for fast tuning iterations.
if (phase === 'quad') {
  await shoot(comparison, '14-sdf-transmission-side-by-side.png')
  await shoot(transmissionPane, '10-final-expressive-tab.png')
  await shoot(calibrationSurface, '13-final-dark-field.png')
  await clickButton('light field')
  await shoot(calibrationSurface, '12-final-light-field.png')
  writeFileSync(
    join(outputDir, 'quad-console.txt'),
    consoleIssues.length ? consoleIssues.join('\n') : 'no console errors or warnings',
  )
  await browser.close()
  process.exit(0)
}

// Tab comparison: SDF vs Transmission, selected tab, side by side.
await shoot(sdfPane, phase === 'baseline' ? '01-baseline-sdf.png' : '11-final-production-tab-sdf-pane.png')
if (phase === 'baseline') {
  await shoot(transmissionPane, '02-baseline-transmission.png')
  await shoot(comparison, '00-baseline-side-by-side.png')
} else {
  await shoot(transmissionPane, '10-final-expressive-tab.png')
  await shoot(comparison, '14-sdf-transmission-side-by-side.png')
}

// Calibration: background difference view (identical-environment check).
await clickButton('fbo difference')
await shoot(calibrationSurface, phase === 'baseline' ? 'baseline-fbo-difference.png' : '03-identical-background-difference.png')
await clickButton('transmission')

// Transmission-only isolation (all support layers off).
await setDebugView('Transmission only')
telemetryLog.push(`--- transmission-only dark field (${phase})`, await telemetryText())
await shoot(calibrationSurface, phase === 'baseline' ? 'baseline-transmission-only.png' : '04-transmission-only.png')

// Displacement telemetry panel for the profile record.
await shoot(calibrationSection.locator('.font-mono').first(), phase === 'baseline' ? 'baseline-displacement-profile.png' : '05-displacement-profile.png')

if (phase === 'final') {
  // Per-channel transmitted samples + combined dispersion.
  await setDebugView('Red transmitted sample')
  await shoot(calibrationSurface, '06-red-sample.png')
  await setDebugView('Green transmitted sample')
  await shoot(calibrationSurface, '07-green-sample.png')
  await setDebugView('Blue transmitted sample')
  await shoot(calibrationSurface, '08-blue-sample.png')
  await setDebugView('Final dispersion')
  await shoot(calibrationSurface, '09-combined-dispersion.png')
}

// Final complete material, dark + light fields.
await setDebugView('Final complete')
telemetryLog.push(`--- final dark field (${phase})`, await telemetryText())
await shoot(calibrationSurface, phase === 'baseline' ? 'baseline-dark-field.png' : '13-final-dark-field.png')
await clickButton('light field')
telemetryLog.push(`--- final light field (${phase})`, await telemetryText())
await shoot(calibrationSurface, phase === 'baseline' ? 'baseline-light-field.png' : '12-final-light-field.png')
await clickButton('dark field')

if (phase === 'final') {
  // Production preset transmission tab pane.
  await page.getByLabel('Material preset').selectOption('production')
  await page.waitForTimeout(900)
  await shoot(transmissionPane, '11-final-production-tab.png')
  await page.getByLabel('Material preset').selectOption('expressive')
}

writeFileSync(join(outputDir, `${prefix}-telemetry.txt`), telemetryLog.join('\n\n'))
writeFileSync(
  join(outputDir, `${prefix}-console.txt`),
  consoleIssues.length ? consoleIssues.join('\n') : 'no console errors or warnings',
)
console.log(`telemetry + console log written to ${outputDir}`)

await browser.close()
