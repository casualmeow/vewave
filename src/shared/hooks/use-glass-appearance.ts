import { useEffect, useState } from 'react'
import type { GlassIntensity, GlassMotion, ResolvedAppearanceMode } from '@/shared/theme/contract'
import { resolveGlassMotion } from '@/shared/theme/glass-motion'

function readAppearance() {
  const root = typeof document === 'undefined' ? undefined : document.documentElement
  const media = (query: string) =>
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia(query).matches
  const glassMotion: GlassMotion =
    root?.dataset.glassMotion === 'off'
      ? 'off'
      : root?.dataset.glassMotion === 'subtle'
        ? 'subtle'
        : 'fluid'
  const resolvedMode: ResolvedAppearanceMode =
    root?.dataset.resolvedMode === 'dark' ||
    (!root?.dataset.resolvedMode && root?.classList.contains('dark'))
      ? 'dark'
      : 'light'
  return {
    resolvedMode,
    glassMotion,
    glassIntensity: (root?.dataset.glassIntensity ?? 'balanced') as GlassIntensity,
    keyboard: root?.dataset.inputModality === 'keyboard',
    experimentalRefraction: root?.dataset.glassRefraction === 'on',
    surfaceStyle: root?.dataset.surfaceStyle ?? 'solid',
    reducedMotion: media('(prefers-reduced-motion: reduce)'),
    reducedTransparency: media('(prefers-reduced-transparency: reduce)'),
    forceFallback: root?.dataset.glassCapability === 'fallback',
  }
}

export function useGlassAppearance() {
  const [appearance, setAppearance] = useState(readAppearance)
  useEffect(() => {
    const update = () => setAppearance(readAppearance())
    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [
        'data-resolved-mode',
        'data-preset',
        'style',
        'class',
        'data-glass-refraction',
        'data-surface-style',
        'data-glass-capability',
        'data-glass-motion',
        'data-glass-intensity',
        'data-input-modality',
      ],
    })
    const queries =
      typeof window.matchMedia === 'function'
        ? ['(prefers-reduced-motion: reduce)', '(prefers-reduced-transparency: reduce)'].map(
            (query) => window.matchMedia(query),
          )
        : []
    queries.forEach((query) => query.addEventListener('change', update))
    update()
    return () => {
      observer.disconnect()
      queries.forEach((query) => query.removeEventListener('change', update))
    }
  }, [])
  return appearance
}

export function useGlassMotion(requested: 'auto' | GlassMotion = 'auto') {
  const appearance = useGlassAppearance()
  return resolveGlassMotion({ ...appearance, preference: appearance.glassMotion, requested })
}
