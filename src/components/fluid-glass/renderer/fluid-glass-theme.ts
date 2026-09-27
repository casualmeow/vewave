import { useEffect, useState } from 'react'
import { Color } from 'three'
import type { FluidGlassEnvironmentSource } from '../types'
import type { AppearancePresetId, GlassIntensity } from '@/shared/theme/contract'
import { readGlassThemeTokens, resolveGlassMaterial } from '@/shared/lib/glass-material'
import { appearancePresetIds } from '@/shared/theme/contract'
import { getThemePreset } from '@/shared/theme/presets'

export function readFluidGlassTheme(
  environment: FluidGlassEnvironmentSource,
  element = document.documentElement,
) {
  const root = document.documentElement
  const scope = element.closest<HTMLElement>('[data-resolved-mode]') ?? root
  const inheritedMode =
    scope.dataset.resolvedMode === 'dark' || scope.classList.contains('dark') ? 'dark' : 'light'
  const tone = environment.type === 'theme' ? environment.tone : undefined
  const mode = tone && tone !== 'auto' ? tone : inheritedMode
  const presetId = (element.closest<HTMLElement>('[data-preset]') ?? root).dataset.preset
  const preset = getThemePreset(
    appearancePresetIds.includes(presetId as AppearancePresetId)
      ? (presetId as AppearancePresetId)
      : 'default',
  )

  const tokens = {
    ...preset[mode],
    ...(mode === inheritedMode ? readGlassThemeTokens(element) : {}),
  }
  const preference = (element.closest<HTMLElement>('[data-glass-intensity]') ?? root).dataset
    .glassIntensity
  const intensity: GlassIntensity =
    preference === 'subtle' || preference === 'strong' ? preference : 'balanced'
  const material = resolveGlassMaterial({ mode, intensity, tokens })
  return {
    dark: mode === 'dark',
    background: tokens.background,
    surface: tokens.card,
    primary: tokens.primary,
    muted: tokens.mutedForeground,
    tint: material.tintColor,
    reflection: material.reflectionColor,
  }
}

export type FluidGlassTheme = ReturnType<typeof readFluidGlassTheme>

export function fluidGlassDisplayColor(value: string) {
  return new Color(value).convertLinearToSRGB()
}

export function useFluidGlassTheme(environment: FluidGlassEnvironmentSource, element: HTMLElement) {
  const tone = environment.type === 'theme' ? environment.tone : undefined
  const [theme, setTheme] = useState(() => readFluidGlassTheme(environment, element))
  useEffect(() => {
    const update = () => {
      const next = readFluidGlassTheme({ type: 'theme', tone }, element)
      setTheme((current) => (JSON.stringify(current) === JSON.stringify(next) ? current : next))
    }
    const observer = new MutationObserver(update)
    let ancestor: HTMLElement | null = element
    while (ancestor) {
      observer.observe(ancestor, {
        attributes: true,
        attributeFilter: [
          'class',
          'style',
          'data-resolved-mode',
          'data-preset',
          'data-glass-intensity',
        ],
      })
      ancestor = ancestor.parentElement
    }
    update()
    return () => observer.disconnect()
  }, [element, tone])
  return theme
}
