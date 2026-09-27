import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { FluidGlassGroup, FluidGlassTarget } from '@/components/fluid-glass'
import { paddingBoxOrigin, toGroupRelativeRect } from '@/components/fluid-glass/renderer/geometry'

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const groupBorder = 4
const groupRect = { left: 120, top: 80, width: 480, height: 320 }
const targetRect = { left: 220, top: 160, width: 160, height: 48 }

function rectFor(element: Element): DOMRect {
  const source = element.classList.contains('test-group')
    ? groupRect
    : element instanceof HTMLElement && element.dataset.fluidGlassTarget === 'scene-library'
      ? targetRect
      : { left: 0, top: 0, width: 0, height: 0 }

  return {
    ...source,
    x: source.left,
    y: source.top,
    right: source.left + source.width,
    bottom: source.top + source.height,
    toJSON: () => ({}),
  }
}

function lensNode(container: HTMLElement) {
  return container.querySelector<HTMLElement>('[data-fluid-glass-fallback-lens]')
}

async function settleLens(container: HTMLElement) {
  for (let frame = 0; frame < 40; frame += 1) {
    const lens = lensNode(container)
    if (lens && Number.parseFloat(lens.style.width) > 0) return lens
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 16))
    })
  }
  return lensNode(container)
}

beforeEach(() => {
  document.documentElement.dataset.surfaceStyle = 'glass'
  vi.stubGlobal('ResizeObserver', ResizeObserverStub)
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  )

  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    return rectFor(this)
  })

  const original = window.getComputedStyle.bind(window)
  vi.spyOn(window, 'getComputedStyle').mockImplementation((element, pseudo) => {
    const base = original(element, pseudo)
    if (!(element instanceof HTMLElement) || !element.classList.contains('test-group')) return base

    return new Proxy(base, {
      get(target, property) {
        if (property === 'borderLeftWidth' || property === 'borderTopWidth') {
          return `${groupBorder}px`
        }
        const value = Reflect.get(target, property)
        return typeof value === 'function' ? value.bind(target) : value
      },
    })
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  document.documentElement.dataset.surfaceStyle = 'glass'
})

describe('fallback lens material', () => {
  it('respects solid mode when activation follows appearance', () => {
    document.documentElement.dataset.surfaceStyle = 'solid'
    const { container } = render(
      <FluidGlassGroup forceFallback environment={{ type: 'theme' }}>
        <span>content</span>
      </FluidGlassGroup>,
    )
    const lens = lensNode(container)
    expect(lens?.dataset.fluidGlassFallbackLens).toBe('solid')
    expect(
      lens?.querySelector('[data-fluid-glass-material-body]')?.getAttribute('style'),
    ).toContain('var(--card)')
    expect(lens?.querySelector('[data-fluid-glass-fallback-layer="rim"]')).toBeNull()
  })

  it('keeps explicitly activated glass independent of solid appearance', () => {
    document.documentElement.dataset.surfaceStyle = 'solid'
    const { container } = render(
      <FluidGlassGroup activation="always" forceFallback environment={{ type: 'theme' }}>
        <span>content</span>
      </FluidGlassGroup>,
    )
    const lens = lensNode(container)
    const body = lens?.querySelector<HTMLElement>('[data-fluid-glass-material-body]')
    expect(lens?.dataset.fluidGlassFallbackLens).toBe('css-glass')
    expect(body?.style.background).toContain('linear-gradient')
    expect(body?.style.background).toContain('var(--glass-background)')
    expect(body?.style.background).not.toContain('var(--card)')
    expect(body?.style.boxShadow).toContain('0 0 0 0.5px')
    expect(body?.style.boxShadow.match(/inset/g)?.length).toBeGreaterThanOrEqual(3)
    expect(lens?.querySelector('[data-fluid-glass-fallback-layer="rim"]')).not.toBeNull()
    expect(lens?.querySelector('[data-fluid-glass-fallback-layer="sheen"]')).not.toBeNull()
    expect(lens?.style.background).toBe('')
  })

  it('enforces reduced transparency even for explicitly activated glass', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) => ({
        matches: query.includes('prefers-reduced-transparency'),
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    )
    const { container } = render(
      <FluidGlassGroup activation="always" environment={{ type: 'theme' }}>
        <span>content</span>
      </FluidGlassGroup>,
    )
    const lens = lensNode(container)
    const body = lens?.querySelector<HTMLElement>('[data-fluid-glass-material-body]')
    const group = container.querySelector<HTMLElement>('[data-fluid-glass-group]')
    expect(lens?.dataset.fluidGlassFallbackLens).toBe('solid')
    expect(body?.style.background).toBe('var(--card)')
    expect(body?.style.backdropFilter).toBeFalsy()
    expect(lens?.querySelector('[data-fluid-glass-fallback-layer="rim"]')).toBeNull()
    expect(lens?.dataset.fluidGlassFallbackReason).toBe('reduced-transparency')
    expect(group?.dataset.fluidGlassAccessibilityEnforced).toBe('true')
    expect(group?.dataset.fluidGlassDegraded).toBeUndefined()
  })
})

describe('fallback lens geometry in nested preview containers', () => {
  it('converts viewport geometry to group-local padding-box coordinates exactly once', () => {
    const element = document.createElement('div')
    element.classList.add('test-group')
    document.body.append(element)

    const origin = paddingBoxOrigin(element)
    expect(origin).toEqual({
      left: groupRect.left + groupBorder,
      top: groupRect.top + groupBorder,
    })

    const local = toGroupRelativeRect(targetRect, origin, 12, 'rounded-rect')
    expect(local.x).toBe(targetRect.left - groupRect.left - groupBorder)
    expect(local.y).toBe(targetRect.top - groupRect.top - groupBorder)

    element.remove()
  })

  it('centres the lens on Scene library inside an offset, bordered preview', async () => {
    const { container } = render(
      <div style={{ padding: 24 }}>
        <div className="rounded-xl border-2 border-border p-3">
          <FluidGlassGroup
            forceFallback
            simulateReducedMotion
            environment={{ type: 'theme' }}
            className="test-group border-4 border-border"
          >
            <FluidGlassTarget id="scene-library" active>
              <button type="button">Scene library</button>
            </FluidGlassTarget>
          </FluidGlassGroup>
        </div>
      </div>,
    )

    const lens = await settleLens(container)
    expect(lens).not.toBeNull()
    if (!lens) return

    const expectedX = targetRect.left - groupRect.left - groupBorder
    const expectedY = targetRect.top - groupRect.top - groupBorder
    const width = Number.parseFloat(lens.style.width)
    const height = Number.parseFloat(lens.style.height)
    const match = /translate3d\((-?[\d.]+)px,\s*(-?[\d.]+)px/.exec(lens.style.transform)
    expect(match).not.toBeNull()
    const lensX = Number.parseFloat(match?.[1] ?? 'NaN')
    const lensY = Number.parseFloat(match?.[2] ?? 'NaN')

    expect(width).toBeCloseTo(targetRect.width, 1)
    expect(height).toBeCloseTo(targetRect.height, 1)

    expect(Math.abs(lensX + width / 2 - (expectedX + targetRect.width / 2))).toBeLessThanOrEqual(1)
    expect(Math.abs(lensY + height / 2 - (expectedY + targetRect.height / 2))).toBeLessThanOrEqual(
      1,
    )
  })

  it('remeasures after a layout shift so downgraded coordinates never go stale', async () => {
    const { container } = render(
      <div style={{ padding: 24 }}>
        <FluidGlassGroup
          forceFallback
          simulateReducedMotion
          environment={{ type: 'theme' }}
          className="test-group border-4 border-border"
        >
          <FluidGlassTarget id="scene-library" active>
            <button type="button">Scene library</button>
          </FluidGlassTarget>
        </FluidGlassGroup>
      </div>,
    )

    await settleLens(container)

    groupRect.left = 60
    groupRect.top = 40
    targetRect.left = 180
    targetRect.top = 120
    targetRect.width = 200

    await act(async () => {
      window.dispatchEvent(new Event('resize'))
      await new Promise((resolve) => setTimeout(resolve, 120))
    })

    const lens = lensNode(container)
    const match = /translate3d\((-?[\d.]+)px,\s*(-?[\d.]+)px/.exec(lens?.style.transform ?? '')
    const lensX = Number.parseFloat(match?.[1] ?? 'NaN')
    const lensY = Number.parseFloat(match?.[2] ?? 'NaN')

    expect(Math.abs(lensX - (targetRect.left - groupRect.left - groupBorder))).toBeLessThanOrEqual(
      1,
    )
    expect(Math.abs(lensY - (targetRect.top - groupRect.top - groupBorder))).toBeLessThanOrEqual(1)
    expect(Number.parseFloat(lens?.style.width ?? 'NaN')).toBeCloseTo(targetRect.width, 1)

    groupRect.left = 120
    groupRect.top = 80
    targetRect.left = 220
    targetRect.top = 160
    targetRect.width = 160
  })
})
