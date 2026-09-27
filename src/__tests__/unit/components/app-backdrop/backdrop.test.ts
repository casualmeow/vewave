import { describe, expect, it, vi } from 'vitest'
import {
  createBackdropFrameLoop,
  getBackdropBufferSize,
} from '@/components/app-backdrop/frame-loop'
import { resolveBackdropPalette } from '@/components/app-backdrop/palette'
import { defaultAppearanceSettings, themePresets } from '@/shared/theme/presets'
import { getContrastRatio, getRelativeLuminance } from '@/shared/theme/validators'

function frames() {
  let id = 0
  const callbacks = new Map<number, FrameRequestCallback>()
  const render = vi.fn()
  const loop = createBackdropFrameLoop({
    render,
    requestFrame: (callback) => {
      callbacks.set(++id, callback)
      return id
    },
    cancelFrame: (key) => {
      callbacks.delete(key)
    },
  })
  return {
    loop,
    render,
    callbacks,
    step: (time: number) => {
      const pending = [...callbacks.values()]
      callbacks.clear()
      pending.forEach((callback) => callback(time))
    },
  }
}

describe('background rendering budget and lifecycle', () => {
  it('caps buffer size on high density and ultrawide screens', () => {
    for (const [width, height, dpr] of [
      [1920, 1080, 3],
      [7680, 2160, 2],
      [390, 844, 3],
    ]) {
      const size = getBackdropBufferSize(width, height, dpr)
      expect(size.width * size.height).toBeLessThanOrEqual(2_000_000)
      expect(size.width / width).toBeLessThanOrEqual(1.5)
    }
  })

  it('throttles a 120Hz display, suspends hidden tabs, and resumes without a time jump', () => {
    const { loop, render, callbacks, step } = frames()
    loop.setPolicy({ visible: true, animated: true })
    for (let i = 0; i < 120; i++) step((i * 1000) / 120)
    expect(render.mock.calls.length).toBeLessThanOrEqual(31)
    const beforePause = render.mock.lastCall![0] as number
    loop.setPolicy({ visible: false, animated: true })
    expect(callbacks.size).toBe(0)
    const count = render.mock.calls.length
    loop.invalidate()
    expect(render).toHaveBeenCalledTimes(count)
    loop.setPolicy({ visible: true, animated: true })
    step(100_000)
    expect((render.mock.lastCall![0] as number) - beforePause).toBeLessThan(0.1)
    loop.dispose()
    expect(callbacks.size).toBe(0)
    loop.invalidate()
    loop.setPolicy({ visible: true, animated: true })
    expect(callbacks.size).toBe(0)
  })

  it('renders still frames only when invalidated and stops on policy changes', () => {
    const { loop, render, callbacks } = frames()
    loop.setPolicy({ visible: true, animated: false })
    expect(render).toHaveBeenCalledTimes(1)
    expect(callbacks.size).toBe(0)
    loop.invalidate()
    expect(render).toHaveBeenCalledTimes(2)
    loop.setPolicy({ visible: true, animated: true })
    expect(callbacks.size).toBe(1)
    loop.setPolicy({ visible: true, animated: false })
    expect(callbacks.size).toBe(0)
  })
})

describe('background palette', () => {
  it.each(themePresets)('bounds custom colors against $label text in both modes', (preset) => {
    for (const mode of ['light', 'dark'] as const) {
      const colors = resolveBackdropPalette(
        {
          ...defaultAppearanceSettings.background,
          palette: 'custom',
          colors: ['#FFFFFF', '#000000'],
          brightness: 1,
        },
        preset[mode],
        mode,
      )
      for (const color of Object.values(colors)) {
        expect(getContrastRatio(preset[mode].foreground, color)).toBeGreaterThanOrEqual(4.5)
        expect(getContrastRatio(preset[mode].mutedForeground, color)).toBeGreaterThanOrEqual(4.5)
      }
    }
  })

  it('continues to respond to brightness after limiting a bright custom palette', () => {
    const settings = {
      ...defaultAppearanceSettings.background,
      palette: 'custom' as const,
      colors: ['#FFFFFF', '#FFFFFF'] as [string, string],
    }
    const low = resolveBackdropPalette(
      { ...settings, brightness: 0.5 },
      themePresets[0].dark,
      'dark',
    )
    const high = resolveBackdropPalette(
      { ...settings, brightness: 1 },
      themePresets[0].dark,
      'dark',
    )
    expect(getRelativeLuminance(high.first)).toBeGreaterThan(getRelativeLuminance(low.first)!)
  })
})
