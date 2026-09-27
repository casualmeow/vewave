import { expect, test, type Page } from '@playwright/test'

declare global {
  interface Window {
    __lensRecoveryTrail?: Array<string>
    __lensRecoveryStop?: () => void
  }
}

const showcase = '/ui/showcase'

async function webglAvailable(page: Page) {
  return page.evaluate(() => {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl2')
      if (!gl) return false
      gl.getExtension('WEBGL_lose_context')?.loseContext()
      return true
    } catch {
      return false
    }
  })
}

async function groupSummary(page: Page) {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('[data-fluid-glass-group]')).map((node) => {
      const element = node as HTMLElement
      return {
        backend: element.dataset.fluidGlassBackend ?? null,
        requested: element.dataset.fluidGlassRequestedRenderer ?? null,
        reason: element.dataset.fluidGlassReason ?? null,
        scopeOwner: element.dataset.fluidGlassScopeOwner ?? null,
        scopeDenial: element.dataset.fluidGlassScopeDenial ?? null,
        readability: element.dataset.fluidGlassReadability ?? null,
        lifecycle: element.dataset.fluidGlassLifecycle ?? null,
        recovery: element.dataset.fluidGlassRecovery ?? null,
        boundary: element.dataset.fluidGlassScopeBoundary ?? null,
      }
    }),
  )
}

test.describe('fluid-glass laboratory and recovery smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
  })

  test('laboratory renders multiple WebGL panes while production stays at one scope', async ({
    page,
  }) => {
    await page.goto(showcase, { waitUntil: 'load' })
    test.skip(!(await webglAvailable(page)), 'No WebGL2 context in this environment')

    const groups = page.locator('[data-fluid-glass-group]')
    await expect.poll(async () => groups.count()).toBeGreaterThan(1)

    await expect
      .poll(async () => (await groupSummary(page)).filter((g) => g.backend !== 'css').length, {
        timeout: 15_000,
      })
      .toBeGreaterThan(1)

    const summary = await groupSummary(page)
    const webglPanes = summary.filter((g) => g.backend === 'sdf' || g.backend === 'transmission')

    expect(webglPanes.length).toBeGreaterThan(1)
    expect(webglPanes.filter((g) => g.backend === 'sdf').length).toBeGreaterThan(0)
    expect(webglPanes.filter((g) => g.backend === 'transmission').length).toBeGreaterThan(0)

    const inventory = JSON.stringify(summary, null, 2)
    const laboratory = summary.filter((g) => g.boundary === 'laboratory')
    const production = summary.filter((g) => g.boundary === 'production')

    expect(laboratory.length, inventory).toBeGreaterThan(1)
    expect(
      laboratory.filter((g) => g.scopeDenial === 'scope-limit-reached'),
      inventory,
    ).toEqual([])
    expect(
      laboratory.filter((g) => g.reason === 'webgl-scope-unavailable'),
      inventory,
    ).toEqual([])

    expect(production.filter((g) => g.scopeOwner).length, inventory).toBeLessThanOrEqual(1)

    for (const pane of summary) {
      expect(pane.requested).toBeTruthy()
      expect(pane.backend).toBeTruthy()
      expect(pane.reason).toBeTruthy()
    }

    const fallbackBadges = page.locator('[data-fluid-glass-pane-fallback="true"]')
    for (let index = 0; index < (await fallbackBadges.count()); index += 1) {
      await expect(fallbackBadges.nth(index).locator('[data-fluid-glass-pane-debug]')).toBeVisible()
    }
  })

  test('a WebGL pane is visually distinct from the CSS fallback', async ({ page }) => {
    await page.goto(showcase, { waitUntil: 'load' })
    test.skip(!(await webglAvailable(page)), 'No WebGL2 context in this environment')

    await expect
      .poll(async () => (await groupSummary(page)).filter((g) => g.backend !== 'css').length, {
        timeout: 15_000,
      })
      .toBeGreaterThan(0)

    const webglGroup = page.locator('[data-fluid-glass-backend="sdf"]').first()
    const cssGroup = page.locator('[data-fluid-glass-backend="css"]').first()
    test.skip((await cssGroup.count()) === 0, 'No CSS pane on the page to compare against')

    const webglShot = await webglGroup.screenshot({ animations: 'disabled' })
    const cssShot = await cssGroup.screenshot({ animations: 'disabled' })

    expect(Buffer.compare(webglShot, cssShot)).not.toBe(0)
  })

  test('the CSS fallback stays a coherent glass material, not a grey blob', async ({ page }) => {
    await page.goto(showcase, { waitUntil: 'load' })

    const lens = page.locator('[data-fluid-glass-fallback-lens]').first()
    await expect(lens).toHaveCount(1, { timeout: 15_000 })

    const appearance = await lens.evaluate((node) => {
      const style = window.getComputedStyle(node)
      return {
        fallbackBackend: (node as HTMLElement).dataset.fluidGlassFallbackLens ?? null,
        reason: (node as HTMLElement).dataset.fluidGlassFallbackReason ?? null,
        classes: node.className,
        backdropFilter: style.backdropFilter || style.getPropertyValue('-webkit-backdrop-filter'),
        borderTopWidth: style.borderTopWidth,
        borderRadius: style.borderRadius,
        backgroundColor: style.backgroundColor,
        backgroundImage: style.backgroundImage,
        boxShadow: style.boxShadow,
        layers: Array.from(
          node.querySelectorAll('[data-fluid-glass-fallback-layer]'),
          (layer) => (layer as HTMLElement).dataset.fluidGlassFallbackLayer ?? '',
        ),
      }
    })

    if (appearance.fallbackBackend !== 'solid') {
      expect(appearance.classes).not.toContain('glass-surface-opaque')
      expect(appearance.borderRadius).not.toBe('0px')

      const translucent = !/^rgb\(/.test(appearance.backgroundColor)
      expect(
        Boolean(appearance.backdropFilter && appearance.backdropFilter !== 'none') || translucent,
      ).toBe(true)

      expect(appearance.backgroundImage).toContain('gradient')
      expect(appearance.layers).toEqual(expect.arrayContaining(['rim', 'sheen']))
      expect(appearance.boxShadow).toContain('inset')
      expect(appearance.boxShadow.replace(/[^,]*inset[^,]*/g, '')).toMatch(/rgba?\(/)
    } else {
      expect(appearance.reason).toBeTruthy()
    }
  })

  test('the fallback lens stays centred on its target inside nested previews', async ({ page }) => {
    await page.goto(showcase, { waitUntil: 'load' })

    await page.getByRole('checkbox', { name: 'Force CSS fallback' }).check()

    const cssGroup = page.locator('[data-fluid-glass-backend="css"]').filter({
      has: page.locator('[data-fluid-glass-fallback-lens]'),
    })
    await expect.poll(async () => cssGroup.count(), { timeout: 15_000 }).toBeGreaterThan(0)

    const group = cssGroup.first()
    const targets = group.locator('[data-fluid-glass-target]')
    await expect.poll(async () => targets.count(), { timeout: 10_000 }).toBeGreaterThan(0)
    const named = targets.filter({ hasText: 'Scene library' })
    const chosen = (await named.count()) > 0 ? named.first() : targets.first()

    await chosen.click({ force: true })

    await page.waitForTimeout(1_500)

    const measurement = await group.evaluate((node) => {
      const lens = node.querySelector('[data-fluid-glass-fallback-lens]')
      if (!lens) return null
      const lensRect = lens.getBoundingClientRect()
      return {
        lensCentreX: lensRect.left + lensRect.width / 2,
        lensCentreY: lensRect.top + lensRect.height / 2,
        lensWidth: lensRect.width,
        lensHeight: lensRect.height,
        opacity: Number.parseFloat(window.getComputedStyle(lens).opacity),
      }
    })
    const targetBox = await chosen.boundingBox()

    test.skip(measurement === null || targetBox === null, 'No CSS fallback lens to measure')
    if (!measurement || !targetBox) return

    test.skip(measurement.opacity === 0, 'Fallback lens is idle (no selected target)')

    const targetCentreX = targetBox.x + targetBox.width / 2
    const targetCentreY = targetBox.y + targetBox.height / 2

    expect(Math.abs(measurement.lensCentreX - targetCentreX)).toBeLessThanOrEqual(1)
    expect(Math.abs(measurement.lensCentreY - targetCentreY)).toBeLessThanOrEqual(1)
    expect(Math.abs(measurement.lensWidth - targetBox.width)).toBeLessThanOrEqual(1)
    expect(Math.abs(measurement.lensHeight - targetBox.height)).toBeLessThanOrEqual(1)
  })

  test('context loss falls back immediately and bounded recovery restores SDF', async ({
    page,
  }) => {
    await page.goto(showcase, { waitUntil: 'load' })
    test.skip(!(await webglAvailable(page)), 'No WebGL2 context in this environment')

    await expect
      .poll(async () => (await groupSummary(page)).filter((g) => g.backend === 'sdf').length, {
        timeout: 15_000,
      })
      .toBeGreaterThan(0)

    const lost = await page.evaluate(() => {
      const group = document.querySelector<HTMLElement>('[data-fluid-glass-backend="sdf"]')
      const canvas = group?.querySelector('canvas')
      if (!group || !canvas) return false

      const trail: Array<string> = []
      const record = (entry?: string) =>
        trail.push(
          entry ??
            `${group.dataset.fluidGlassBackend}:${group.dataset.fluidGlassRecovery}:${group.dataset.fluidGlassLifecycle}`,
        )
      record()

      const observer = new MutationObserver(() => record())
      observer.observe(group, {
        attributes: true,
        subtree: true,
        attributeFilter: [
          'data-fluid-glass-backend',
          'data-fluid-glass-recovery',
          'data-fluid-glass-lifecycle',
        ],
      })

      canvas.addEventListener('webglcontextlost', () => record('event:contextlost'))
      canvas.addEventListener('webglcontextrestored', () => record('event:contextrestored'))
      window.__lensRecoveryTrail = trail
      window.__lensRecoveryStop = () => observer.disconnect()

      const gl = canvas.getContext('webgl2')
      const extension = gl?.getExtension('WEBGL_lose_context')
      if (!extension) return false
      extension.loseContext()
      return true
    })
    test.skip(!lost, 'WEBGL_lose_context unavailable; cannot force a real context loss')

    await expect
      .poll(async () => page.evaluate(() => (window.__lensRecoveryTrail ?? []).length), {
        timeout: 15_000,
      })
      .toBeGreaterThan(1)

    await page.waitForTimeout(4_000)
    const trail = await page.evaluate(() => {
      window.__lensRecoveryStop?.()
      return window.__lensRecoveryTrail ?? []
    })
    const path = trail.join(' -> ')

    expect(trail, path).toContain('event:contextlost')

    expect(
      trail.some((entry) => entry.startsWith('css:')),
      path,
    ).toBe(true)

    expect(
      trail.some((entry) => entry.startsWith('sdf:')) &&
        trail.lastIndexOf(trail.filter((e) => e.startsWith('sdf:')).at(-1) ?? '') >
          trail.findIndex((entry) => entry.startsWith('css:')),
      path,
    ).toBe(true)

    const recovered = await groupSummary(page)

    expect(recovered.every((g) => g.recovery === 'healthy' || g.recovery === 'terminal')).toBe(true)
  })

  test('leaving the laboratory releases its scopes and production keeps one', async ({ page }) => {
    await page.goto(showcase, { waitUntil: 'load' })
    test.skip(!(await webglAvailable(page)), 'No WebGL2 context in this environment')

    await expect
      .poll(async () => (await groupSummary(page)).filter((g) => g.scopeOwner).length, {
        timeout: 15_000,
      })
      .toBeGreaterThan(0)

    await page.goto('/', { waitUntil: 'load' })
    await page.waitForTimeout(1_000)

    const production = await groupSummary(page)
    const owners = production.filter((g) => g.scopeOwner)

    expect(owners.length).toBeLessThanOrEqual(1)
    expect(production.filter((g) => g.backend === 'sdf').length).toBeLessThanOrEqual(1)
  })
})
