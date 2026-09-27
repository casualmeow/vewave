import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { expect, test, type Page } from '@playwright/test'
import { authenticateE2EUser } from './helpers/auth'

const artifacts = 'artifacts/phase-5-fluid-body'
const carrierSelector = '.fluid-glass-settings-nav [data-fluid-glass-fallback-lens]'
const bodySelector = '[data-fluid-glass-material-body]'

test.use({
  viewport: { width: 1280, height: 720 },
  video: { mode: 'on', size: { width: 1280, height: 720 } },
})

type Sample = {
  t: number
  carrier: {
    a: number
    d: number
    tx: number
    ty: number
    x: number
    y: number
    w: number
    h: number
  }
  body: { a: number; d: number; e: number; f: number; originX: number; originY: number }
  material: {
    sheen: number
    contact: number
    rimInset: number
    absorption: number
    shadow: number
    blur: number
    saturate: number
  }
}

type Trace = {
  samples: Array<Sample>
  carrierNodes: number
  bodyNodes: number
  carrierStable: boolean
  bodyStable: boolean
  targetTransformed: boolean
  done: boolean
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

async function waitForSettled(page: Page, label: string) {
  const selected = page.getByRole('button', { name: label }).and(page.locator('[aria-current]'))
  await expect(selected).toHaveAttribute('aria-current', 'page')
  await expect
    .poll(
      async () => {
        const lens = await page.locator(carrierSelector).boundingBox()
        const item = await selected.boundingBox()
        if (!lens || !item) return Number.POSITIVE_INFINITY
        return Math.max(
          Math.abs(lens.x - item.x),
          Math.abs(lens.y - item.y),
          Math.abs(lens.width - item.width),
          Math.abs(lens.height - item.height),
        )
      },
      { timeout: 4_000, message: `carrier did not settle over "${label}"` },
    )
    .toBeLessThanOrEqual(2)
}

test.describe('phase 5.3 fluid body', () => {
  test('carrier and material body are separate, stable nodes', async ({ page }) => {
    const nav = await openSettings(page)
    await expect(nav.locator('[data-fluid-glass-group]')).toHaveAttribute(
      'data-fluid-glass-resolved-backend',
      'css-approximation',
    )

    const carrier = page.locator(carrierSelector)
    const body = carrier.locator(bodySelector)
    await expect(carrier).toHaveCount(1)
    await expect(body).toHaveCount(1)

    const paint = await carrier.evaluate((element) => {
      const style = getComputedStyle(element)
      return {
        background: style.backgroundImage,
        backdrop: style.backdropFilter,
        shadow: style.boxShadow,
        pointer: style.pointerEvents,
      }
    })
    expect(paint.background).toBe('none')
    expect(paint.backdrop === 'none' || paint.backdrop === '').toBe(true)
    expect(paint.shadow === 'none' || paint.shadow === '').toBe(true)
    expect(paint.pointer).toBe('none')

    const material = await body.evaluate((element) => {
      const style = getComputedStyle(element)
      return { backdrop: style.backdropFilter, shadow: style.boxShadow }
    })
    expect(material.backdrop).toContain('blur')
    expect(material.shadow).not.toBe('none')
  })

  test('one continuous body travels from Appearance to Watch history', async ({
    page,
  }, testInfo) => {
    const nav = await openSettings(page)
    await expect(nav.locator('[data-fluid-glass-group]')).toHaveAttribute(
      'data-fluid-glass-resolved-backend',
      'css-approximation',
    )
    await waitForSettled(page, 'Appearance')

    const navBox = await nav.boundingBox()
    expect(navBox).not.toBeNull()

    await page.evaluate(
      ([carrierSel, bodySel]) => {
        const carrier = document.querySelector<HTMLElement>(carrierSel)
        const body = carrier?.querySelector<HTMLElement>(bodySel)
        if (!carrier || !body) throw new Error('carrier or material body missing')
        const t0 = performance.now()
        const trace = {
          samples: [] as Array<unknown>,
          carrierNodes: 1,
          bodyNodes: 1,
          carrierStable: true,
          bodyStable: true,
          targetTransformed: false,
          done: false,
        }
        ;(window as unknown as { __trace: typeof trace }).__trace = trace

        const num = (raw: string) => Number.parseFloat(raw) || 0

        const originTop = carrier.getBoundingClientRect().top
        let marker: HTMLElement | null = null
        let markerUntil = 0
        const tick = () => {
          const nowCarrier = document.querySelector<HTMLElement>(carrierSel)
          const nowBody = nowCarrier?.querySelector<HTMLElement>(bodySel) ?? null
          if (nowCarrier !== carrier) trace.carrierStable = false
          if (nowBody !== body) trace.bodyStable = false
          trace.carrierNodes = Math.max(
            trace.carrierNodes,
            document.querySelectorAll(carrierSel).length,
          )

          trace.bodyNodes = Math.max(
            trace.bodyNodes,
            document.querySelectorAll(`${carrierSel} ${bodySel}`).length,
          )

          const cs = getComputedStyle(carrier)
          const bs = getComputedStyle(body)
          const cm = new DOMMatrixReadOnly(cs.transform === 'none' ? undefined : cs.transform)
          const bm = new DOMMatrixReadOnly(bs.transform === 'none' ? undefined : bs.transform)
          const rect = carrier.getBoundingClientRect()
          const [ox, oy] = bs.transformOrigin.split(' ')

          if (!marker && markerUntil === 0 && Math.abs(rect.top - originTop) > 0.5) {
            marker = document.createElement('div')
            marker.style.cssText =
              'position:fixed;left:0;top:0;width:28px;height:28px;background:rgb(0,255,0);z-index:2147483647;pointer-events:none'
            document.body.append(marker)
            markerUntil = performance.now() + 120
          }
          if (marker && performance.now() > markerUntil) {
            marker.remove()
            marker = null
          }

          for (const button of document.querySelectorAll<HTMLElement>(
            '.fluid-glass-settings-nav [data-fluid-glass-target]',
          )) {
            const transform = getComputedStyle(button).transform
            if (transform !== 'none' && transform !== 'matrix(1, 0, 0, 1, 0, 0)') {
              trace.targetTransformed = true
            }
          }

          trace.samples.push({
            t: Number((performance.now() - t0).toFixed(1)),
            carrier: {
              a: Number(cm.a.toFixed(5)),
              d: Number(cm.d.toFixed(5)),

              tx: Number(cm.e.toFixed(2)),
              ty: Number(cm.f.toFixed(2)),
              x: Number(rect.x.toFixed(2)),
              y: Number(rect.y.toFixed(2)),
              w: Number(rect.width.toFixed(2)),
              h: Number(rect.height.toFixed(2)),
            },
            body: {
              a: Number(bm.a.toFixed(5)),
              d: Number(bm.d.toFixed(5)),
              e: Number(bm.e.toFixed(2)),
              f: Number(bm.f.toFixed(2)),
              originX: Number((num(ox) / Math.max(1, rect.width)).toFixed(4)),
              originY: Number((num(oy) / Math.max(1, rect.height)).toFixed(4)),
            },
            material: {
              sheen: num(cs.getPropertyValue('--lens-sheen-alpha')),
              contact: num(cs.getPropertyValue('--lens-contact-alpha')),
              rimInset: num(cs.getPropertyValue('--lens-rim-inset-alpha')),
              absorption: num(cs.getPropertyValue('--lens-absorption-alpha')),
              shadow: num(cs.getPropertyValue('--lens-shadow-alpha')),
              blur: num(cs.getPropertyValue('--lens-blur')),
              saturate: num(cs.getPropertyValue('--lens-saturate')),
            },
          })

          if (performance.now() - t0 < 1_200) requestAnimationFrame(tick)
          else trace.done = true
        }
        requestAnimationFrame(tick)
      },
      [carrierSelector, bodySelector] as const,
    )

    await page.getByRole('button', { name: 'Watch history' }).click()
    await expect(page.getByRole('heading', { name: 'Watch history' })).toBeVisible()
    await page.waitForFunction(
      () => (window as unknown as { __trace: { done: boolean } }).__trace.done,
      undefined,
      { timeout: 5_000 },
    )
    await waitForSettled(page, 'Watch history')

    const trace = await page.evaluate(() => (window as unknown as { __trace: Trace }).__trace)

    const samples = trace.samples
    expect(samples.length).toBeGreaterThan(20)
    expect(trace.carrierNodes).toBe(1)
    expect(trace.bodyNodes).toBe(1)
    expect(trace.carrierStable).toBe(true)
    expect(trace.bodyStable).toBe(true)
    expect(trace.targetTransformed).toBe(false)

    const carrierScale = Math.max(
      ...samples.map((s) => Math.max(Math.abs(s.carrier.a - 1), Math.abs(s.carrier.d - 1))),
    )
    expect(carrierScale).toBeLessThan(0.001)

    const axialPeak = Math.max(...samples.map((s) => Math.max(s.body.a, s.body.d)))
    const crossFloor = Math.min(...samples.map((s) => Math.min(s.body.a, s.body.d)))
    const leadPeak = Math.max(...samples.map((s) => Math.hypot(s.body.e, s.body.f)))
    expect(axialPeak).toBeGreaterThanOrEqual(1.045)
    expect(axialPeak).toBeLessThanOrEqual(1.075)
    expect(crossFloor).toBeGreaterThanOrEqual(0.965)
    expect(crossFloor).toBeLessThanOrEqual(0.985)
    expect(leadPeak).toBeGreaterThan(0.5)
    expect(leadPeak).toBeLessThanOrEqual(3)

    const movingSamples = samples.filter((s) => Math.max(s.body.a, s.body.d) > 1.02)
    expect(movingSamples.length).toBeGreaterThan(2)
    expect(Math.min(...movingSamples.map((s) => s.body.originY))).toBeLessThan(0.42)

    const REST = { sheen: 0.05, shadow: 0.2, blur: 16 }
    const geoAt = (index: number) =>
      index > 0 &&
      Math.hypot(
        samples[index].carrier.tx - samples[index - 1].carrier.tx,
        samples[index].carrier.ty - samples[index - 1].carrier.ty,
      ) > 0.1
    const matAt = (s: Sample) =>
      Math.abs(s.material.sheen - REST.sheen) > 0.0015 ||
      Math.abs(s.material.shadow - REST.shadow) > 0.0015 ||
      Math.abs(s.material.blur - REST.blur) > 0.02
    const bodyAt = (s: Sample) => Math.abs(s.body.a - 1) > 0.004 || Math.abs(s.body.d - 1) > 0.004

    const active = samples
      .map((s, i) => ({ t: s.t, geo: geoAt(i), mat: matAt(s), body: bodyAt(s) }))
      .filter((m) => m.geo || m.mat || m.body)
    const episodes: Array<typeof active> = []
    for (const entry of active) {
      const last = episodes[episodes.length - 1]
      if (!last || entry.t - last[last.length - 1].t > 60) episodes.push([entry])
      else last.push(entry)
    }

    const peakT = samples.reduce(
      (best, s) => (Math.max(s.body.a, s.body.d) > Math.max(best.body.a, best.body.d) ? s : best),
      samples[0],
    ).t
    const transit =
      episodes.find((e) => peakT >= e[0].t && peakT <= e[e.length - 1].t) ?? episodes[0]

    console.log(
      '[phase-5.3] ' +
        samples
          .filter((_, i) => i % 4 === 0)
          .map(
            (s, i) =>
              `${s.t}|ty=${s.carrier.ty}|s=${s.body.a.toFixed(3)}/${s.body.d.toFixed(3)}|sh=${s.material.sheen}|g=${geoAt(i * 4) ? 1 : 0}${matAt(s) ? 'M' : '-'}${bodyAt(s) ? 'B' : '-'}`,
          )
          .join('\n[phase-5.3] '),
    )

    const geometryMoving = transit.filter((m) => m.geo).map((m) => m.t)
    const materialMoving = transit.filter((m) => m.mat).map((m) => m.t)
    expect(geometryMoving.length).toBeGreaterThan(3)
    expect(materialMoving.length).toBeGreaterThan(3)
    const geometryEnd = geometryMoving[geometryMoving.length - 1]
    const materialEnd = materialMoving[materialMoving.length - 1]
    const overlapStart = Math.max(geometryMoving[0], materialMoving[0])
    const overlapEnd = Math.min(geometryEnd, materialEnd)
    expect(overlapEnd - overlapStart).toBeGreaterThan(80)
    expect(materialEnd).toBeGreaterThanOrEqual(geometryEnd - 40)

    const peakIndex = samples.reduce(
      (best, s, i) => (s.material.sheen > samples[best].material.sheen ? i : best),
      0,
    )
    const decay = samples.slice(peakIndex).filter((s) => s.t <= materialEnd + 60)
    const biggestRise = Math.max(
      ...decay.slice(1).map((s, i) => s.material.sheen - decay[i].material.sheen),
    )
    expect(biggestRise).toBeLessThan(0.002)

    const tail = samples.filter((s) => s.t > materialEnd - 90 && s.t <= materialEnd + 60)
    const biggestStep = Math.max(
      ...tail.slice(1).map((s, i) => Math.abs(s.material.sheen - tail[i].material.sheen)),
    )
    expect(biggestStep).toBeLessThan(0.012)

    const transitStart = transit[0].t
    const transitEnd = transit[transit.length - 1].t
    const settleMs = transitEnd - transitStart
    const travelMs = geometryEnd - transitStart
    expect(settleMs).toBeLessThanOrEqual(380)
    expect(travelMs).toBeGreaterThanOrEqual(150)
    expect(travelMs).toBeLessThanOrEqual(300)

    const after = samples.filter((s) => s.t > transitEnd + 40)
    expect(after.length).toBeGreaterThan(10)
    const finalY = samples[samples.length - 1].carrier.ty
    expect(Math.max(...after.map((s) => Math.abs(s.carrier.ty - finalY)))).toBeLessThanOrEqual(1.5)
    expect(Math.max(...after.map((s) => Math.abs(s.body.a - 1)))).toBeLessThan(0.004)
    expect(Math.max(...after.map((s) => Math.abs(s.body.d - 1)))).toBeLessThan(0.004)
    expect(Math.abs(samples[samples.length - 1].material.sheen - REST.sheen)).toBeLessThan(0.002)

    const axial = samples.map((s) => Math.max(s.body.a, s.body.d))
    let peaks = 0
    for (let i = 1; i < axial.length - 1; i += 1) {
      if (axial[i] > 1.02 && axial[i] >= axial[i - 1] && axial[i] > axial[i + 1]) peaks += 1
    }
    expect(peaks).toBeLessThanOrEqual(1)

    const selected = await page
      .getByRole('button', { name: 'Watch history' })
      .and(page.locator('[aria-current]'))
      .boundingBox()
    const finalCarrier = await page.locator(carrierSelector).boundingBox()
    const finalError = Math.max(
      Math.abs(finalCarrier!.x - selected!.x),
      Math.abs(finalCarrier!.y - selected!.y),
      Math.abs(finalCarrier!.width - selected!.width),
      Math.abs(finalCarrier!.height - selected!.height),
    )
    expect(finalError).toBeLessThanOrEqual(2)

    fs.mkdirSync(artifacts, { recursive: true })
    fs.writeFileSync(
      path.join(artifacts, 'trace.json'),
      JSON.stringify(
        {
          interaction: 'Appearance -> Watch history',
          backend: 'css-approximation',
          metrics: {
            settleMs,
            travelMs,
            dispatchLatencyMs: transitStart,
            geometryWindow: [geometryMoving[0], geometryEnd],
            materialWindow: [materialMoving[0], materialEnd],
            axialPeak,
            crossFloor,
            leadPeakPx: leadPeak,
            carrierScaleDeviation: carrierScale,
            finalGeometryErrorPx: finalError,
            arrivalPeaks: peaks,
            biggestTailStep: biggestStep,
          },
          samples,
        },
        null,
        2,
      ),
    )

    const video = page.video()
    expect(video).not.toBeNull()
    await page.close()
    const source = await video!.path()
    const target = path.join(artifacts, 'retarget.webm')
    fs.copyFileSync(source, target)

    const rate = execFileSync('ffprobe', [
      '-v',
      'error',
      '-select_streams',
      'v:0',
      '-show_entries',
      'stream=r_frame_rate',
      '-of',
      'default=nw=1:nk=1',
      target,
    ])
      .toString()
      .trim()
    const [rateNum, rateDen] = rate.split('/').map(Number)
    const fps = rateDen ? rateNum / rateDen : rateNum
    const swatch = execFileSync(
      'ffmpeg',
      [
        '-v',
        'error',
        '-i',
        target,
        '-vf',
        'crop=28:28:0:0,scale=1:1:flags=area,format=rgb24',
        '-f',
        'rawvideo',
        '-',
      ],
      { maxBuffer: 1 << 24 },
    )
    let markerFrame = -1
    for (let i = 0; i * 3 + 2 < swatch.length; i += 1) {
      const r = swatch[i * 3]
      const g = swatch[i * 3 + 1]
      const b = swatch[i * 3 + 2]
      if (g > 150 && r < 140 && b < 140) {
        markerFrame = i
        break
      }
    }
    expect(markerFrame, 'travel marker not found in the recording').toBeGreaterThanOrEqual(0)

    const startT = markerFrame / fps
    const travel = Math.max(0.18, travelMs / 1000)
    const stamps = [
      startT - 0.08,
      startT + travel * 0.33,
      startT + travel * 0.5,
      startT + travel * 0.75,
      startT + travel + 0.3,
    ]

    const pad = 120
    const even = (n: number) => Math.max(2, Math.round(n / 2) * 2)
    const cropX = Math.max(0, Math.round(navBox!.x - pad))
    const cropY = Math.max(0, Math.round(navBox!.y - pad))
    const cropW = even(Math.min(1280 - cropX, navBox!.width + pad * 2))
    const cropH = even(Math.min(720 - cropY, navBox!.height + pad * 2))

    const frames = stamps.map((stamp, index) => {
      const file = path.join(artifacts, `frame-0${index + 1}.png`)
      execFileSync('ffmpeg', [
        '-y',
        '-v',
        'error',
        '-i',
        target,
        '-ss',
        Math.max(0, stamp).toFixed(3),
        '-frames:v',
        '1',
        '-vf',
        `crop=${cropW}:${cropH}:${cropX}:${cropY}`,
        file,
      ])
      return file
    })
    for (const frame of frames) expect(fs.existsSync(frame)).toBe(true)

    execFileSync('ffmpeg', [
      '-y',
      '-v',
      'error',
      ...frames.flatMap((frame) => ['-i', frame]),
      '-filter_complex',
      'hstack=inputs=5',
      path.join(artifacts, 'strip.png'),
    ])
    expect(fs.existsSync(path.join(artifacts, 'strip.png'))).toBe(true)
    testInfo.annotations.push({ type: 'settle', description: `${settleMs.toFixed(1)}ms` })
  })
})
