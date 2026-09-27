import { act, cleanup, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppBackdrop, BackdropPreview } from '@/components/app-backdrop'
import { defaultAppearanceSettings, themePresets } from '@/shared/theme/presets'

const mock = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
  dispose: vi.fn(),
  scene: vi.fn(),
  setSourceOptions: vi.fn(),
  destroy: vi.fn(),
  reducedMotion: false,
  reducedTransparency: false,
}))
let settings = structuredClone(defaultAppearanceSettings)
vi.mock('@/shared/theme', () => ({
  useAppearance: () => ({ settings, tokens: themePresets[0].dark, resolvedMode: 'dark' }),
}))
vi.mock('@/shared/hooks/use-glass-appearance', () => ({
  useGlassAppearance: () => ({
    reducedMotion: mock.reducedMotion,
    reducedTransparency: mock.reducedTransparency,
    forceFallback: false,
  }),
  useGlassMotion: () => settings.glassMotion,
}))
vi.mock('@/components/app-backdrop/renderer', () => ({ createBackdropRenderer: mock.create }))
vi.mock('@/components/glass-scene/renderer', () => ({ createGlassSceneRenderer: mock.scene }))

beforeEach(() => {
  vi.clearAllMocks()
  settings = { ...structuredClone(defaultAppearanceSettings), surfaceStyle: 'glass' }
  mock.reducedMotion = false
  mock.reducedTransparency = false
  mock.create.mockImplementation(() => ({ update: mock.update, dispose: mock.dispose }))
  mock.scene.mockImplementation((_canvas, options) => ({
    setSourceOptions: mock.setSourceOptions,
    setSize: vi.fn(),
    setPanes: () => options.onFrame?.(),
    setPointer: vi.fn(),
    setPaused: vi.fn(),
    setMotion: vi.fn(),
    destroy: mock.destroy,
  }))
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('layout background ownership', () => {
  it('owns one canvas, updates it in place, and disposes when switching to Solid', async () => {
    const view = render(
      <AppBackdrop>
        <p>Workspace</p>
      </AppBackdrop>,
    )
    await waitFor(() => expect(mock.scene).toHaveBeenCalledTimes(1))
    expect(view.container.querySelectorAll('canvas')).toHaveLength(1)
    settings = { ...settings, background: { ...settings.background, preset: 'silk' } }
    view.rerender(
      <AppBackdrop>
        <p>Workspace</p>
      </AppBackdrop>,
    )
    expect(mock.scene).toHaveBeenCalledTimes(1)
    expect(mock.setSourceOptions.mock.lastCall![0].settings.preset).toBe('silk')
    settings = { ...settings, surfaceStyle: 'solid' }
    view.rerender(
      <AppBackdrop>
        <p>Workspace</p>
      </AppBackdrop>,
    )
    expect(mock.destroy).toHaveBeenCalledTimes(1)
    expect(view.container.querySelector('canvas')).toBeNull()
    expect(view.getByText('Workspace')).toBeDefined()
  })

  it('freezes for reduced motion and rooms, independently of glass motion', async () => {
    settings = {
      ...settings,
      glassMotion: 'off',
      background: { ...settings.background, animated: true },
    }
    const view = render(<AppBackdrop />)
    await waitFor(() => expect(mock.scene).toHaveBeenCalledTimes(1))
    expect(mock.scene.mock.calls[0][1].sourceOptions.animated).toBe(true)
    mock.reducedMotion = true
    view.rerender(<AppBackdrop />)
    expect(mock.setSourceOptions.mock.lastCall![0].animated).toBe(false)
    mock.reducedMotion = false
    view.rerender(<AppBackdrop paused />)
    expect(mock.setSourceOptions.mock.lastCall![0].animated).toBe(false)
    settings = { ...settings, background: { ...settings.background, animated: false } }
    view.rerender(<AppBackdrop />)
    expect(mock.setSourceOptions.mock.lastCall![0].animated).toBe(false)
  })

  it('keeps a matching static scene on initialization failure, without retrying', async () => {
    mock.scene.mockImplementation(() => {
      throw new Error('No GPU')
    })
    const view = render(<AppBackdrop />)
    await waitFor(() => expect(mock.scene).toHaveBeenCalledTimes(1))
    expect(view.container.querySelector('canvas')?.style.visibility).toBe('hidden')
    expect(view.container.querySelector('[data-app-backdrop="ribbons"]')).not.toBeNull()
    view.rerender(<AppBackdrop />)
    expect(mock.scene).toHaveBeenCalledTimes(1)
  })

  it('keeps native fallback on GPU failure and uses a flat scene for None', async () => {
    const view = render(<AppBackdrop />)
    await waitFor(() => expect(mock.scene).toHaveBeenCalledTimes(1))
    act(() => mock.scene.mock.calls[0][1].onError())
    expect(view.container.querySelector('canvas')?.style.visibility).toBe('hidden')
    view.unmount()
    expect(mock.destroy).toHaveBeenCalledTimes(1)
    mock.scene.mockClear()
    settings = { ...settings, background: { ...settings.background, preset: 'none' } }
    const empty = render(<AppBackdrop />)
    await waitFor(() => expect(mock.scene).toHaveBeenCalledTimes(1))
    expect(mock.scene.mock.calls[0][1].sourceOptions.settings.preset).toBe('none')
    settings = { ...settings, background: { ...settings.background, preset: 'contours' } }
    mock.reducedTransparency = true
    empty.rerender(<AppBackdrop />)
    expect(empty.container.querySelector('canvas')).toBeNull()
    expect(mock.scene).toHaveBeenCalledTimes(1)
  })

  it('uses one budgeted preview canvas, respects motion preferences, and releases it for None', async () => {
    const preview = () => (
      <BackdropPreview settings={settings.background} tokens={themePresets[0].dark} mode="dark" />
    )
    settings.background.animated = true
    const view = render(preview())
    await waitFor(() => expect(mock.create).toHaveBeenCalledTimes(1))
    expect(view.container.querySelectorAll('canvas')).toHaveLength(1)
    expect(mock.create.mock.calls[0][1]).toMatchObject({ animated: true, maxPixels: 100_000 })
    mock.reducedMotion = true
    view.rerender(preview())
    expect(mock.update.mock.lastCall![0].animated).toBe(false)
    settings = { ...settings, background: { ...settings.background, preset: 'none' } }
    view.rerender(preview())
    expect(view.container.querySelector('canvas')).toBeNull()
    expect(mock.dispose).toHaveBeenCalledTimes(1)
  })
})
