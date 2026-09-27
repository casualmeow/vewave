import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'

import { expect, test, type Locator, type Page } from '@playwright/test'
import { authenticateE2EUser } from './helpers/auth'

const artifacts = 'artifacts/phase-5-motion'
const frames = artifacts + '/frames'

const geometryTolerancePx = 2.5

test.use({ video: 'on' })

type MotionSample = {
  t: number

  rect: { x: number; y: number; width: number; height: number }

  scale: { x: number; y: number }
  radius: number
  opacity: number
  lensCount: number
  sameNode: boolean
  vars: Record<string, string>
  targetTransforms: Array<string>
  selectedBackground: string
}

async function openSettings(page: Page) {
  await authenticateE2EUser(page)
  await page.goto('/projects')

  await page.evaluate(() => {
    document.documentElement.dataset.surfaceStyle = 'glass'
    document.documentElement.classList.add('dark')
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
      { timeout: 4000, message: 'lens did not settle over ' + label },
    )
    .toBeLessThanOrEqual(geometryTolerancePx)
}

async function readBackend(nav: Locator) {
  const group = nav.locator('[data-fluid-glass-group]')
  await expect(group).toBeVisible()
  const attributes = await group.evaluate((element) =>
    Object.fromEntries(
      Array.from(element.attributes)
        .filter((attribute) => attribute.name.startsWith('data-fluid-glass'))
        .map((attribute) => [attribute.name, attribute.value]),
    ),
  )
  const lens = await nav.locator('[data-fluid-glass-fallback-lens]').evaluate((element) => ({
    lensBackend: element.getAttribute('data-fluid-glass-fallback-lens'),
    lensReason: element.getAttribute('data-fluid-glass-fallback-reason'),
  }))
  return {
    ...attributes,
    ...lens,
    resolvedBackend: attributes['data-fluid-glass-resolved-backend'],
  }
}

function traceRetarget(page: Page, toLabel: string, durationMs = 1200) {
  return page.evaluate(
    async ({ label, duration }) => {
      const scope = document.querySelector('.fluid-glass-settings-nav')
      if (!scope) throw new Error('settings nav scope not found')
      const lensSelector = '[data-fluid-glass-fallback-lens]'
      const firstLens = scope.querySelector<HTMLElement>(lensSelector)
      if (!firstLens) throw new Error('no fallback lens present before retarget')

      const buttons = () => Array.from(scope.querySelectorAll<HTMLElement>('button'))
      const destination = buttons().find((button) => button.textContent?.trim() === label)
      if (!destination) throw new Error('no settings tab labelled ' + label)

      const trackedVars = [
        '--lens-rim-angle',
        '--lens-rim-inset-alpha',
        '--lens-sheen-x',
        '--lens-sheen-y',
        '--lens-sheen-alpha',
        '--lens-shadow-x',
        '--lens-shadow-y',
        '--lens-shadow-alpha',
        '--lens-blur',
        '--lens-saturate',
        '--lens-body-angle',
        '--lens-inner-alpha',
      ]

      const sample = (t: number) => {
        const all = scope.querySelectorAll<HTMLElement>(lensSelector)
        const lens = all[0] ?? firstLens
        const computed = getComputedStyle(lens)
        const matrix = new DOMMatrixReadOnly(
          computed.transform === 'none' ? '' : computed.transform,
        )
        const rect = lens.getBoundingClientRect()
        const selected = buttons().find((button) => button.hasAttribute('aria-current'))
        return {
          t,
          rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
          scale: { x: matrix.a, y: matrix.d },
          radius: parseFloat(computed.borderTopLeftRadius) || 0,
          opacity: parseFloat(computed.opacity) || 0,
          lensCount: all.length,
          sameNode: lens === firstLens,
          vars: Object.fromEntries(
            trackedVars.map((name) => [name, computed.getPropertyValue(name).trim()]),
          ),
          targetTransforms: buttons().map((button) => getComputedStyle(button).transform),
          selectedBackground: selected ? getComputedStyle(selected).backgroundColor : 'none',
        }
      }

      const samples = [sample(-1)]
      destination.click()
      const start = performance.now()
      await new Promise<void>((resolve) => {
        const tick = (now: number) => {
          samples.push(sample(now - start))
          if (now - start >= duration) resolve()
          else requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      })
      samples.push(sample(duration + 1))
      return samples
    },
    { label: toLabel, duration: durationMs },
  )
}

function spread(values: Array<number>) {
  const finite = values.filter((value) => Number.isFinite(value))
  return finite.length ? Math.max(...finite) - Math.min(...finite) : 0
}

function varSeries(samples: Array<MotionSample>, name: string) {
  return samples.map((sample) => parseFloat(sample.vars[name] ?? '')).filter(Number.isFinite)
}

function deformationMetric(samples: Array<MotionSample>) {
  const first = samples[0]
  const last = samples[samples.length - 1]
  const sameSize =
    Math.abs(first.rect.width - last.rect.width) < 1.5 &&
    Math.abs(first.rect.height - last.rect.height) < 1.5
  const rest = {
    width: (first.rect.width + last.rect.width) / 2,
    height: (first.rect.height + last.rect.height) / 2,
  }
  const of = (sample: MotionSample) =>
    sameSize
      ? { x: sample.rect.width / rest.width, y: sample.rect.height / rest.height }
      : { x: sample.scale.x, y: sample.scale.y }
  return { of, mode: sameSize ? 'composited-rect' : 'transform-matrix', rest }
}

test.describe('css fluid motion in the real settings dialog', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'chromium evidence run')

  test('the lens travels as one continuous deforming body', async ({ page }) => {
    const nav = await openSettings(page)
    const backend = await readBackend(nav)
    console.log('RUNTIME_BACKEND ' + JSON.stringify(backend))
    expect(backend.resolvedBackend).toBe('css-approximation')

    await expectLensOverSelectedItem(page, 'Appearance')
    mkdirSync(frames, { recursive: true })

    await nav.screenshot({ path: frames + '/01-settled-start.png' })
    const tracePromise = traceRetarget(page, 'Watch history')
    await nav.screenshot({ path: frames + '/02-early.png' })
    await page.waitForTimeout(110)
    await nav.screenshot({ path: frames + '/03-middle.png' })
    await page.waitForTimeout(190)
    await nav.screenshot({ path: frames + '/04-late.png' })
    const samples = (await tracePromise) as Array<MotionSample>
    await expectLensOverSelectedItem(page, 'Watch history')
    await nav.screenshot({ path: frames + '/05-settled-destination.png' })

    const moving = samples.filter((sample) => sample.t >= 0 && sample.t <= 700)
    expect(samples.length, 'many frames, not just endpoints').toBeGreaterThan(20)

    expect(samples.every((sample) => sample.lensCount === 1)).toBe(true)
    expect(samples.every((sample) => sample.sameNode)).toBe(true)
    expect(Math.min(...samples.map((sample) => sample.opacity))).toBeGreaterThan(0.05)

    const ys = samples.map((sample) => sample.rect.y)
    const xs = samples.map((sample) => sample.rect.x)
    const travel = Math.max(spread(ys), spread(xs))
    expect(travel, 'the lens must actually travel').toBeGreaterThan(8)
    expect(new Set(ys.map((y) => y.toFixed(2))).size, 'interpolated, not switched').toBeGreaterThan(
      8,
    )
    const biggestStep = Math.max(
      ...moving.slice(1).map((sample, index) => Math.abs(sample.rect.y - moving[index].rect.y)),
    )
    expect(biggestStep / travel, 'no teleport between frames').toBeLessThan(0.5)

    const metric = deformationMetric(samples)
    console.log('DEFORMATION_MODE ' + metric.mode + ' rest=' + JSON.stringify(metric.rest))
    console.log(
      'SCALE_SPREAD ' +
        JSON.stringify({
          x: spread(samples.map((s) => s.scale.x)),
          y: spread(samples.map((s) => s.scale.y)),
        }),
    )
    const start = metric.of(samples[0])
    expect(Math.abs(start.x - 1), 'settled start is neutral').toBeLessThan(0.01)
    expect(Math.abs(start.y - 1), 'settled start is neutral').toBeLessThan(0.01)

    const peak = moving.reduce(
      (worst, sample) => {
        const deformation = metric.of(sample)
        const magnitude = Math.abs(deformation.x - 1) + Math.abs(deformation.y - 1)
        return magnitude > worst.magnitude ? { magnitude, deformation, t: sample.t } : worst
      },
      { magnitude: 0, deformation: { x: 1, y: 1 }, t: -1 },
    )
    console.log('DEFORMATION_PEAK ' + JSON.stringify(peak))
    expect(peak.magnitude, 'deformation must leave neutral during retarget').toBeGreaterThan(0.005)

    const dominantVertical = spread(ys) > spread(xs)
    console.log(
      'TRAVEL_AXIS ' +
        (dominantVertical ? 'y' : 'x') +
        ' ' +
        JSON.stringify({ x: spread(xs), y: spread(ys) }),
    )
    if (dominantVertical) {
      expect(peak.deformation.y, 'stretch follows the travel axis').toBeGreaterThan(1)
      expect(peak.deformation.x, 'cross axis must not inflate').toBeLessThanOrEqual(1.002)
    }

    const tailSamples = moving.filter((sample) => sample.t > peak.t)
    const tailPeak = Math.max(
      ...tailSamples.map((sample) => {
        const d = metric.of(sample)
        return Math.abs(d.x - 1) + Math.abs(d.y - 1)
      }),
      0,
    )
    console.log('ARRIVAL_TAIL_PEAK ' + tailPeak)

    const settled = metric.of(samples[samples.length - 1])
    console.log('SETTLED_DEFORMATION ' + JSON.stringify(settled))
    expect(Math.abs(settled.x - 1), 'returns to neutral').toBeLessThan(0.01)
    expect(Math.abs(settled.y - 1), 'returns to neutral').toBeLessThan(0.01)

    const radii = samples.map((sample) => sample.radius)
    console.log(
      'RADIUS ' +
        JSON.stringify({
          start: radii[0],
          end: radii[radii.length - 1],
          distinct: new Set(radii.map((r) => r.toFixed(2))).size,
        }),
    )
    if (Math.abs(radii[0] - radii[radii.length - 1]) > 0.5) {
      expect(new Set(radii.map((radius) => radius.toFixed(2))).size).toBeGreaterThan(4)
    }

    const material = {
      rim: Math.max(
        spread(varSeries(samples, '--lens-rim-angle')),
        spread(varSeries(samples, '--lens-rim-inset-alpha')),
      ),
      sheen: Math.max(
        spread(varSeries(samples, '--lens-sheen-x')),
        spread(varSeries(samples, '--lens-sheen-y')),
      ),
      shadow: Math.max(
        spread(varSeries(samples, '--lens-shadow-x')),
        spread(varSeries(samples, '--lens-shadow-y')),
      ),
      optics: Math.max(
        spread(varSeries(samples, '--lens-blur')),
        spread(varSeries(samples, '--lens-saturate')),
      ),
    }
    console.log('MATERIAL_TRAVEL ' + JSON.stringify(material))
    expect(material.rim, 'rim angle or intensity must move').toBeGreaterThan(0)
    expect(material.sheen, 'sheen must move').toBeGreaterThan(0)
    expect(material.shadow, 'shadow offset must move').toBeGreaterThan(0)
    expect(material.optics, 'blur or saturation must move').toBeGreaterThan(0)

    const transformed = samples.flatMap((sample) =>
      sample.targetTransforms.filter(
        (transform) => transform !== 'none' && transform !== 'matrix(1, 0, 0, 1, 0, 0)',
      ),
    )
    expect(transformed, 'semantic targets must never be transformed').toEqual([])

    const alphas = samples.map((sample) => {
      const match = sample.selectedBackground.match(/rgba?\(([^)]+)\)/)
      if (!match) return 0
      const parts = match[1].split(',').map((part) => parseFloat(part))
      return parts.length > 3 ? parts[3] : 1
    })
    console.log('SELECTED_BACKGROUND_ALPHA ' + Math.max(...alphas))
    expect(Math.max(...alphas), 'selected button must not carry its own fill').toBeLessThan(0.4)

    writeFileSync(
      artifacts + '/motion-trace.json',
      JSON.stringify({ backend, mode: metric.mode, peak, material, samples }, null, 1),
    )

    await page.getByRole('button', { name: 'Account' }).click()
    await page.waitForTimeout(800)
    await page.getByRole('button', { name: 'Appearance' }).click()
    await expectLensOverSelectedItem(page, 'Appearance')

    const video = page.video()
    await page.close()
    await video?.saveAs(artifacts + '/settings-retarget.webm')
  })
})

test.describe('reduced motion', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'chromium evidence run')
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
  })

  test('selection lands with no deformation and nothing left animating', async ({ page }) => {
    await openSettings(page)
    await expectLensOverSelectedItem(page, 'Appearance')

    const samples = (await traceRetarget(page, 'Watch history', 900)) as Array<MotionSample>
    const metric = deformationMetric(samples)
    const worst = Math.max(
      ...samples.map((sample) => {
        const d = metric.of(sample)
        return Math.abs(d.x - 1) + Math.abs(d.y - 1)
      }),
    )
    console.log('REDUCED_MOTION_MODE ' + metric.mode)
    console.log('REDUCED_MOTION_PEAK_DEFORMATION ' + worst)
    expect(worst, 'reduced motion must not stretch or compress').toBeLessThan(0.005)

    await expect(page.getByRole('button', { name: 'Watch history' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await expect(page.getByRole('heading', { name: 'Watch history' })).toBeVisible()
    await expectLensOverSelectedItem(page, 'Watch history')

    const tail = (await traceRetarget(page, 'Watch history', 400)) as Array<MotionSample>
    const residual = spread(tail.map((sample) => sample.rect.y))
    console.log('REDUCED_MOTION_RESIDUAL ' + residual)
    expect(residual).toBeLessThan(0.6)

    const video = page.video()
    await page.close()
    await video?.saveAs(artifacts + '/settings-reduced-motion.webm')
  })
})

test.describe('firefox css fallback smoke', () => {
  test.skip(({ browserName }) => browserName !== 'firefox', 'firefox smoke only')

  test('settings resolves to the css family and keeps one lens', async ({ page }) => {
    const nav = await openSettings(page)
    const backend = await readBackend(nav)
    console.log('FIREFOX_BACKEND ' + JSON.stringify(backend))

    expect(backend.resolvedBackend).toMatch(/^css-/)

    await expectLensOverSelectedItem(page, 'Appearance')
    await page.getByRole('button', { name: 'Account' }).click()
    await expectLensOverSelectedItem(page, 'Account')
    await expect(lensBody(page)).toHaveCount(1)
    await expect(page.getByRole('heading', { name: 'Account' })).toBeVisible()
  })
})

async function findRowMenuTrigger(page: Page) {
  const direct = page.locator('[aria-label^="Controls for"]')
  if (await direct.count()) return direct.first()

  const collapsed = page.locator('[aria-expanded="false"]')
  const total = await collapsed.count()
  for (let index = 0; index < Math.min(total, 8); index += 1) {
    await collapsed
      .nth(index)
      .click({ timeout: 2000 })
      .catch(() => {})
    if (await direct.count()) return direct.first()
  }
  await page.waitForTimeout(600)
  if (await direct.count()) return direct.first()

  const diagnostic = await page.evaluate(() =>
    Array.from(document.querySelectorAll('button, a[href]'))
      .slice(0, 40)
      .map((element) =>
        (element.getAttribute('aria-label') ?? element.textContent ?? '').trim().slice(0, 40),
      )
      .filter(Boolean),
  )
  console.log('SIDEBAR_DIAGNOSTIC ' + JSON.stringify(diagnostic))
  return null
}

test.describe('real pin/remove menu material', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'chromium evidence run')

  test('reads as glass over the real page in both themes', async ({ page }) => {
    await authenticateE2EUser(page)
    await page.goto('/projects')
    await page.evaluate(() => {
      document.documentElement.dataset.surfaceStyle = 'glass'
      document.documentElement.classList.add('dark')
    })
    await page.waitForTimeout(1200)

    const trigger = await findRowMenuTrigger(page)
    expect(trigger, 'the sidebar must expose a real resource row menu').not.toBeNull()
    if (!trigger) return
    mkdirSync(artifacts, { recursive: true })

    const capture = async (theme: 'dark' | 'light') => {
      await page.evaluate((mode) => {
        document.documentElement.classList.toggle('dark', mode === 'dark')
      }, theme)
      await trigger.click()
      const menu = page.getByRole('menu')
      await expect(menu).toBeVisible()
      await expect(page.getByRole('menuitem', { name: /^(Pin|Unpin)$/ })).toBeVisible()
      await expect(page.getByRole('menuitem', { name: 'Remove' })).toBeVisible()

      await page.keyboard.press('ArrowDown')
      const focusedRole = await page.evaluate(() => document.activeElement?.getAttribute('role'))
      expect(focusedRole, 'menu keeps roving focus on its items').toBe('menuitem')

      const box = await menu.boundingBox()
      if (!box) throw new Error('menu has no box')
      const pad = 56
      await page.screenshot({
        path: artifacts + '/menu-' + theme + '.png',
        clip: {
          x: Math.max(0, box.x - pad),
          y: Math.max(0, box.y - pad),
          width: box.width + pad * 2,
          height: box.height + pad * 2,
        },
      })

      const recipe = await menu.evaluate((element) => {
        const computed = getComputedStyle(element)
        const destructive = element.querySelector('[data-variant="destructive"]')
        return {
          background: computed.backgroundColor,
          backdropFilter:
            computed.backdropFilter || computed.getPropertyValue('-webkit-backdrop-filter'),
          border: computed.borderColor,
          shadow: computed.boxShadow.slice(0, 90),
          destructiveColor: destructive ? getComputedStyle(destructive).color : 'none',
        }
      })
      console.log('MENU_' + theme.toUpperCase() + ' ' + JSON.stringify(recipe))

      await page.keyboard.press('Escape')
      await expect(menu).toBeHidden()
      return recipe
    }

    const dark = await capture('dark')
    const light = await capture('light')

    for (const [theme, recipe] of [
      ['dark', dark],
      ['light', light],
    ] as const) {
      expect(recipe.backdropFilter, theme + ' menu must sample the page behind it').toContain(
        'blur',
      )
      const channels = recipe.background
        .match(/rgba?\(([^)]+)\)/)?.[1]
        .split(',')
        .map(Number)
      if (channels && channels.length > 3) {
        expect(channels[3], theme + ' menu must not be an opaque panel').toBeLessThan(0.95)
      }
    }
  })
})

test.describe('phase 5.2 evidence', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'chromium evidence run')

  test('evidence strip', async ({ page }) => {
    const plate = (file: string, label: string) => {
      const path = artifacts + '/' + file
      if (!existsSync(path))
        return '<figure><figcaption>' + label + ' - MISSING</figcaption></figure>'
      const data = readFileSync(path).toString('base64')
      return (
        '<figure><img src="data:image/png;base64,' +
        data +
        '"><figcaption>' +
        label +
        '</figcaption></figure>'
      )
    }
    const html =
      '<style>body{margin:0;padding:16px;background:#111418;color:#e8eaed;font:12px system-ui}' +
      'section{display:flex;gap:10px;align-items:flex-start;margin-bottom:18px}' +
      'figure{margin:0}img{display:block;border:1px solid #333}figcaption{padding-top:4px}' +
      'h2{font:600 13px system-ui;margin:0 0 6px}</style>' +
      '<h2>settings retarget - one continuous transition</h2><section>' +
      plate('frames/01-settled-start.png', '1 settled start') +
      plate('frames/02-early.png', '2 early') +
      plate('frames/03-middle.png', '3 middle') +
      plate('frames/04-late.png', '4 late') +
      plate('frames/05-settled-destination.png', '5 settled destination') +
      '</section><h2>real pin/remove menu</h2><section>' +
      plate('menu-dark.png', 'menu dark') +
      plate('menu-light.png', 'menu light') +
      '</section>'
    await page.setViewportSize({ width: 1500, height: 900 })
    await page.setContent(html)
    await page.screenshot({ path: artifacts + '/evidence-strip.png', fullPage: true })
  })
})
