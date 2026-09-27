import { act, cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import type { RootState } from '@react-three/fiber'

import { resolveFluidTransmissionMaterial } from '@/components/fluid-glass/constants'
import { createLensStateAdapter } from '@/components/fluid-glass/lens/lens-state'
import { ACTIVE_LENS_GEOMETRY_POLICY } from '@/components/fluid-glass/lens/geometry-policy'
import { RendererLifecycleController } from '@/components/fluid-glass/lens/renderer-lifecycle'
import { FluidGlassTransmissionRenderer } from '@/components/fluid-glass/renderer/fluid-glass-transmission-renderer'
import { FluidGlassStore } from '@/components/fluid-glass/renderer/store'

const callbacks = vi.hoisted(() => ({
  created: null as ((state: Pick<RootState, 'gl' | 'invalidate'>) => void) | null,
  ready: null as (() => void) | null,
}))

vi.mock('@react-three/fiber', () => ({
  Canvas: ({
    children,
    onCreated,
  }: {
    children: ReactNode
    onCreated: NonNullable<typeof callbacks.created>
  }) => {
    callbacks.created = onCreated
    return children
  },
}))

vi.mock('@/components/fluid-glass/renderer/transmission-scene', () => ({
  TransmissionScene: ({ onReady }: { onReady: () => void }) => {
    callbacks.ready = onReady
    return null
  },
}))

afterEach(cleanup)

describe('transmission lifecycle', () => {
  it('waits for the scene before restoring readiness and releases context listeners', () => {
    const lifecycle = new RendererLifecycleController()
    const store = new FluidGlassStore()
    const ready = vi.fn()
    const lost = vi.fn()
    const canvas = document.createElement('canvas')
    const dispose = vi.fn()
    const gl = {
      domElement: canvas,
      setClearColor: vi.fn(),
      dispose,
    } as unknown as RootState['gl']
    const view = render(
      <FluidGlassTransmissionRenderer
        debugView="final"
        environment={{ type: 'image', src: '/backdrop.png' }}
        lens={createLensStateAdapter(store, ACTIVE_LENS_GEOMETRY_POLICY)}
        lifecycle={lifecycle}
        lightDirection={[-0.72, 0.68]}
        material={resolveFluidTransmissionMaterial('production')}
        materialPreset="production"
        onContextLost={lost}
        onFailure={vi.fn()}
        onReady={ready}
        quality="low"
        store={store}
      />,
    )
    act(() => callbacks.created?.({ gl, invalidate: vi.fn() }))
    expect(ready).not.toHaveBeenCalled()
    expect(lifecycle.state).toBe('creating')

    act(() => {
      callbacks.ready?.()
      callbacks.ready?.()
    })
    expect(ready).toHaveBeenCalledTimes(1)
    expect(lifecycle.state).toBe('ready')

    const event = new Event('webglcontextlost', { cancelable: true })
    act(() => {
      canvas.dispatchEvent(event)
      canvas.dispatchEvent(new Event('webglcontextrestored'))
    })
    expect(event.defaultPrevented).toBe(true)
    expect(lost).toHaveBeenCalledTimes(1)
    expect(ready).toHaveBeenCalledTimes(1)
    expect(lifecycle.state).toBe('recovering')

    act(() => callbacks.ready?.())
    expect(ready).toHaveBeenCalledTimes(2)
    expect(lifecycle.state).toBe('ready')
    view.unmount()
    expect(dispose).toHaveBeenCalledTimes(1)
    canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }))
    expect(lost).toHaveBeenCalledTimes(1)
    store.destroy()
  })
})
