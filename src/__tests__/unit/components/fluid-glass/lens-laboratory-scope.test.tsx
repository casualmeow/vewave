import { act, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { FluidGlassGroup } from '@/components/fluid-glass'
import {
  LensLaboratoryScopeProvider,
  LensScopeGuardProvider,
} from '@/components/fluid-glass/lens/scope-context'
import {
  lensWebGlScopeGuard,
  PILOT_MAX_ACTIVE_WEBGL_SCOPES,
  WebGlScopePilotGuard,
} from '@/components/fluid-glass/lens/webgl-scope-guard'

vi.mock('@/components/fluid-glass/lens/capability', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  probeWebglSupport: () => true,
  probeCssBackdropFilterSupport: () => true,
}))

vi.mock('@/components/fluid-glass/renderer/fluid-glass-renderer', async () => {
  const { useEffect } = await import('react')
  return {
    FluidGlassRenderer: ({
      lifecycle,
      onReady,
    }: {
      lifecycle: {
        transition: (state: string, reason: string) => void
        dispose: (reason?: string) => void
      }
      onReady: () => void
    }) => {
      useEffect(() => {
        lifecycle.transition('creating', 'stub renderer mounted')
        lifecycle.transition('ready', 'stub context created')
        onReady()
        return () => lifecycle.dispose('stub renderer unmounted')
      }, [lifecycle, onReady])
      return <div data-fluid-glass-canvas="stub" />
    },
  }
})

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

function Pane({ id }: { id: string }) {
  return (
    <FluidGlassGroup activation="always" environment={{ type: 'theme' }} className={`pane-${id}`}>
      <span>{id}</span>
    </FluidGlassGroup>
  )
}

function panes(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>('[data-fluid-glass-group]'))
}

function backends(container: HTMLElement) {
  return panes(container).map((node) => node.dataset.fluidGlassBackend)
}

beforeEach(() => {
  lensWebGlScopeGuard.reset()
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
})

afterEach(() => {
  lensWebGlScopeGuard.reset()
  vi.unstubAllGlobals()
})

describe('root condition — the production guard is what collapses the panes', () => {
  it('resolves later comparison panes to CSS with an observable scope reason', () => {
    const { container } = render(
      <>
        <Pane id="a" />
        <Pane id="b" />
        <Pane id="c" />
      </>,
    )

    const nodes = panes(container)
    expect(backends(container)).toEqual(['sdf', 'css', 'css'])

    expect(nodes[1].dataset.fluidGlassReason).toBe('webgl-scope-unavailable')
    expect(nodes[1].dataset.fluidGlassScopeDenial).toBe('scope-limit-reached')
    expect(nodes[2].dataset.fluidGlassReason).toBe('webgl-scope-unavailable')
    expect(nodes[1].dataset.fluidGlassDegraded).toBe('true')
    expect(lensWebGlScopeGuard.activeCount).toBe(PILOT_MAX_ACTIVE_WEBGL_SCOPES)
  })
})

describe('isolated laboratory scope boundary', () => {
  it('renders every required comparison pane simultaneously', () => {
    const { container } = render(
      <LensLaboratoryScopeProvider simultaneousRenderers={3}>
        <Pane id="a" />
        <Pane id="b" />
        <Pane id="c" />
      </LensLaboratoryScopeProvider>,
    )

    expect(backends(container)).toEqual(['sdf', 'sdf', 'sdf'])
    for (const node of panes(container)) {
      expect(node.dataset.fluidGlassReason).toBe('eligible-controlled-source')
      expect(node.dataset.fluidGlassScopeDenial).toBeUndefined()
      expect(node.dataset.fluidGlassDegraded).toBeUndefined()
    }
  })

  it('never borrows slots from the production singleton', () => {
    const { unmount } = render(
      <LensLaboratoryScopeProvider simultaneousRenderers={3}>
        <Pane id="a" />
        <Pane id="b" />
        <Pane id="c" />
      </LensLaboratoryScopeProvider>,
    )

    expect(lensWebGlScopeGuard.activeCount).toBe(0)
    expect(lensWebGlScopeGuard.canAcquire('production-surface')).toBe(true)

    act(() => unmount())
    expect(lensWebGlScopeGuard.activeCount).toBe(0)
  })

  it('releases every laboratory-owned scope on teardown', () => {
    const guard = new WebGlScopePilotGuard(3)
    const { unmount } = render(
      <LensScopeGuardProvider guard={guard}>
        <Pane id="a" />
        <Pane id="b" />
        <Pane id="c" />
      </LensScopeGuardProvider>,
    )

    expect(guard.activeCount).toBe(3)

    act(() => unmount())

    expect(guard.activeCount).toBe(0)
    expect(guard.ownerIds).toEqual([])
  })

  it('keeps the production guard at one active scope', () => {
    expect(PILOT_MAX_ACTIVE_WEBGL_SCOPES).toBe(1)
    expect(lensWebGlScopeGuard.maxActiveScopes).toBe(1)

    const laboratory = new WebGlScopePilotGuard(4)
    expect(laboratory.maxActiveScopes).toBe(4)
    expect(lensWebGlScopeGuard.maxActiveScopes).toBe(1)
  })

  it('re-resolves a waiting pane once a slot is freed', async () => {
    const guard = new WebGlScopePilotGuard(1)
    function Lab({ showFirst }: { showFirst: boolean }) {
      return (
        <LensScopeGuardProvider guard={guard}>
          {showFirst ? <Pane id="a" /> : null}
          <Pane id="b" />
        </LensScopeGuardProvider>
      )
    }

    const { container, rerender } = render(<Lab showFirst />)
    expect(backends(container)).toEqual(['sdf', 'css'])
    expect(guard.activeCount).toBe(1)

    act(() => rerender(<Lab showFirst={false} />))

    await waitFor(() => expect(guard.activeCount).toBe(1))

    expect(backends(container)).toEqual(['sdf'])
    expect(guard.ownerIds).toHaveLength(1)
  })
})

describe('truthful comparison status', () => {
  it('exposes requested renderer, resolved backend, reason and readability per pane', () => {
    const { container } = render(
      <>
        <Pane id="a" />
        <Pane id="b" />
      </>,
    )

    const [first, second] = panes(container)

    expect(first.dataset.fluidGlassRequestedRenderer).toBe('auto')
    expect(first.dataset.fluidGlassBackend).toBe('sdf')
    expect(first.dataset.fluidGlassReason).toBe('eligible-controlled-source')
    expect(first.dataset.fluidGlassScopeOwner).toBeTruthy()
    expect(first.dataset.fluidGlassReadability).toBe('readable')

    expect(second.dataset.fluidGlassBackend).toBe('css')
    expect(second.dataset.fluidGlassReason).toBe('webgl-scope-unavailable')
    expect(second.dataset.fluidGlassScopeOwner).toBeUndefined()
    expect(second.dataset.fluidGlassScopeDenial).toBe('scope-limit-reached')
    expect(second.dataset.fluidGlassReadability).toBe('readable')
  })
})
