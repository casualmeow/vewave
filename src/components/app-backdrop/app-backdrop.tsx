import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { resolveBackdropPalette } from './palette'
import type { BackdropRendererOptions } from './renderer'
import { GlassSceneHost, type GlassSceneSourceFactory } from '@/components/glass-scene'
import { useAppearance } from '@/shared/theme'
import { useGlassAppearance } from '@/shared/hooks/use-glass-appearance'
import { resolveGlassMotion } from '@/shared/theme/glass-motion'

export function AppBackdrop({
  paused = false,
  children,
}: {
  paused?: boolean
  children?: ReactNode
}) {
  const { settings, tokens, resolvedMode } = useAppearance()
  const appearance = useGlassAppearance()
  const [source, setSource] = useState<GlassSceneSourceFactory<BackdropRendererOptions>>()
  const enabled =
    settings.surfaceStyle === 'glass' &&
    !appearance.reducedTransparency &&
    !appearance.forceFallback
  const palette = useMemo(
    () => resolveBackdropPalette(settings.background, tokens, resolvedMode),
    [settings.background, tokens, resolvedMode],
  )
  const options = useMemo<BackdropRendererOptions>(
    () => ({
      settings: settings.background,
      palette,
      animated: settings.background.animated && !appearance.reducedMotion && !paused,
    }),
    [settings.background, palette, appearance.reducedMotion, paused],
  )
  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    void import('./scene-source')
      .then(({ createBackdropSceneSource }) => {
        if (!cancelled) setSource(() => createBackdropSceneSource)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [enabled])

  return (
    <div
      data-app-backdrop={enabled ? settings.background.preset : undefined}
      className="relative h-full min-h-0"
      style={
        {
          '--backdrop-base': palette.base,
          '--backdrop-first': palette.first,
          '--backdrop-second': palette.second,
        } as CSSProperties
      }
    >
      <GlassSceneHost
        source={source}
        sourceOptions={options}
        enabled={enabled}
        motion={resolveGlassMotion({
          ...appearance,
          preference: settings.glassMotion,
          surfaceStyle: settings.surfaceStyle,
        })}
      >
        {children}
      </GlassSceneHost>
    </div>
  )
}
