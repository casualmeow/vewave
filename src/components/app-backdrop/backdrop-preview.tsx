import { useEffect, useMemo, useRef, useState } from 'react'
import { resolveBackdropPalette } from './palette'
import type { CSSProperties } from 'react'
import type { BackgroundSettings, ResolvedAppearanceMode, ThemeTokens } from '@/shared/theme'
import type { BackdropRendererOptions, createBackdropRenderer } from './renderer'
import { useGlassAppearance } from '@/shared/hooks/use-glass-appearance'

export function BackdropPreview({
  settings,
  tokens,
  mode,
}: {
  settings: BackgroundSettings
  tokens: ThemeTokens
  mode: ResolvedAppearanceMode
}) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const renderer = useRef<ReturnType<typeof createBackdropRenderer> | null>(null)
  const [failed, setFailed] = useState(false)
  const { reducedMotion, reducedTransparency, forceFallback } = useGlassAppearance()
  const enabled = settings.preset !== 'none' && !reducedTransparency && !forceFallback
  const palette = useMemo(
    () => resolveBackdropPalette(settings, tokens, mode),
    [settings, tokens, mode],
  )
  const options = useMemo<BackdropRendererOptions>(
    () => ({
      settings,
      palette,
      animated: settings.animated && !reducedMotion,
      maxPixels: 100_000,
    }),
    [settings, palette, reducedMotion],
  )
  const latest = useRef(options)
  latest.current = options

  useEffect(() => {
    if (!enabled || failed || !canvas.current) return
    let cancelled = false
    const element = canvas.current
    void import('./renderer')
      .then(({ createBackdropRenderer: create }) => {
        if (cancelled) return
        renderer.current = create(element, latest.current, () => {
          if (!cancelled) setFailed(true)
        })
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
      renderer.current?.dispose()
      renderer.current = null
    }
  }, [enabled, failed])
  useEffect(() => {
    renderer.current?.update(options)
  }, [options])

  return (
    <div
      aria-hidden="true"
      data-app-backdrop={enabled ? settings.preset : 'none'}
      className="relative h-32 overflow-hidden rounded-xl border border-border/40"
      style={
        {
          '--backdrop-base': palette.base,
          '--backdrop-first': palette.first,
          '--backdrop-second': palette.second,
        } as CSSProperties
      }
    >
      {enabled && !failed && <canvas ref={canvas} className="absolute inset-0 h-full w-full" />}
    </div>
  )
}
