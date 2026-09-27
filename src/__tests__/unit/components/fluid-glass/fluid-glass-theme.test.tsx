import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AppearancePresetId, ResolvedAppearanceMode } from '@/shared/theme/contract'
import {
  fluidGlassDisplayColor,
  readFluidGlassTheme,
  useFluidGlassTheme,
} from '@/components/fluid-glass/renderer/fluid-glass-theme'
import { getThemePreset } from '@/shared/theme/presets'
import { applyThemeTokens } from '@/shared/theme/resolver'

function apply(preset: AppearancePresetId, mode: ResolvedAppearanceMode) {
  const root = document.documentElement
  root.dataset.preset = preset
  root.dataset.resolvedMode = mode
  root.classList.toggle('dark', mode === 'dark')
  applyThemeTokens(getThemePreset(preset)[mode], root)
}

beforeEach(() => apply('pearl', 'light'))
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  document.documentElement.removeAttribute('style')
  document.documentElement.classList.remove('dark')
  delete document.documentElement.dataset.preset
  delete document.documentElement.dataset.resolvedMode
})

describe('Lens theme adaptation', () => {
  it('uses Pearl colors and the shared neutral reflection recipe', () => {
    const theme = readFluidGlassTheme({ type: 'theme', tone: 'auto' })
    const pearl = getThemePreset('pearl').light
    expect(theme).toMatchObject({
      dark: false,
      background: pearl.background,
      surface: pearl.card,
      primary: pearl.primary,
      muted: pearl.mutedForeground,
      tint: pearl.popover,
      reflection: '#FFFFFF',
    })
    const halfGray = fluidGlassDisplayColor('#808080')
    expect(halfGray.toArray().map((channel) => Math.round(channel * 255))).toEqual([128, 128, 128])
  })

  it('keeps the Noir environment, tint, and reflection free of colored highlights', () => {
    apply('noir', 'dark')
    const theme = readFluidGlassTheme({ type: 'theme' })
    expect(theme.dark).toBe(true)
    expect(theme.background).toBe('#000000')
    for (const field of [
      'background',
      'surface',
      'primary',
      'muted',
      'tint',
      'reflection',
    ] as const) {
      const color = fluidGlassDisplayColor(theme[field])
      expect(color.r).toBe(color.g)
      expect(color.g).toBe(color.b)
    }
  })

  it('updates a palette and custom colors without requiring a light/dark mode change', async () => {
    apply('noir', 'dark')
    const disconnect = vi.spyOn(MutationObserver.prototype, 'disconnect')
    const { result, unmount } = renderHook(() =>
      useFluidGlassTheme({ type: 'theme', tone: 'auto' }, document.documentElement),
    )
    expect(result.current.background).toBe('#000000')
    await act(async () => {
      apply('pearl', 'dark')
      await Promise.resolve()
    })
    expect(result.current.background).toBe(getThemePreset('pearl').dark.background)
    expect(result.current.dark).toBe(true)
    await act(async () => {
      document.documentElement.style.setProperty('--primary', '#ABCDEF')
      document.documentElement.style.setProperty('--popover', '#253647')
      await Promise.resolve()
    })
    expect(result.current.primary).toBe('#ABCDEF')
    expect(result.current.tint).toBe('#253647')
    unmount()
    expect(disconnect).toHaveBeenCalledTimes(1)
  })

  it('honors local preview colors instead of replacing them with the global palette', () => {
    apply('noir', 'dark')
    const preview = document.createElement('div')
    preview.dataset.resolvedMode = 'light'
    preview.dataset.preset = 'pearl'
    applyThemeTokens(getThemePreset('pearl').light, preview)
    preview.style.setProperty('--primary', '#345678')
    document.body.append(preview)
    const theme = readFluidGlassTheme({ type: 'theme', tone: 'auto' }, preview)
    expect(theme.dark).toBe(false)
    expect(theme.primary).toBe('#345678')
    expect(theme.background).toBe(getThemePreset('pearl').light.background)
    expect(document.documentElement.style.getPropertyValue('--background')).toBe('#000000')
    preview.remove()
  })

  it('keeps explicit opposite-tone showcases in the selected palette family', () => {
    apply('pearl', 'dark')
    const theme = readFluidGlassTheme({ type: 'theme', tone: 'light' })
    expect(theme.dark).toBe(false)
    expect(theme.background).toBe(getThemePreset('pearl').light.background)
    expect(theme.tint).toBe(getThemePreset('pearl').light.popover)
  })
})
