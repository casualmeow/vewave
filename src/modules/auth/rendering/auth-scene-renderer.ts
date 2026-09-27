import { createAuthDitherSource } from './auth-dither-source'
import type { GlassIntensity, GlassMotion } from '@/shared/theme/contract'
import type { GlassInteractionEvent } from '@/shared/lib/glass-interaction'
import { createGlassSceneRenderer } from '@/components/glass-scene/renderer'
import { resolveGlassMaterial } from '@/shared/lib/glass-material'

export type AuthSceneOptions = {
  palette: {
    background: string
    card: string
    popover: string
    foreground: string
    mutedForeground?: string
    accent: string
  }
  surfaceStyle: 'solid' | 'glass'
  mode: 'light' | 'dark'
  intensity: GlassIntensity
  motion: GlassMotion
  onReady?: () => void
  onError?: () => void
}

export type AuthSceneGeometry = {
  width: number
  height: number
  plate: { x: number; y: number; width: number; height: number; radius: number }
  formStartX: number
}

export type AuthSceneInstance = {
  setOptions: (next: AuthSceneOptions) => void
  setGeometry: (geometry: AuthSceneGeometry) => void

  setPointer: (x: number, y: number, active?: boolean) => void
  setInteraction: (event: GlassInteractionEvent) => void
  destroy: () => void
}

export function createAuthSceneRenderer(
  canvas: HTMLCanvasElement,
  initial: AuthSceneOptions,
): AuthSceneInstance | null {
  const host = createGlassSceneRenderer(canvas, {
    source: createAuthDitherSource,
    sourceOptions: initial,
    motion: initial.motion,
    onReady: initial.onReady,
    onError: initial.onError,
  })
  if (!host) return null
  let options = initial
  let geometry: AuthSceneGeometry | null = null
  let disposed = false

  function updatePlate() {
    if (!geometry) return
    const { plate } = geometry
    host!.setPanes([
      {
        id: 'auth-plate',
        ...plate,
        radius: Math.max(0, Math.min(plate.radius, plate.width / 2, plate.height / 2)),
        enabled: options.surfaceStyle === 'glass',
        material: resolveGlassMaterial({
          mode: options.mode,
          intensity: options.intensity,
          role: 'form',
          thickness: 'thick',
          tokens: {
            background: options.palette.background,
            card: options.palette.card,
            popover: options.palette.popover,
            foreground: options.palette.foreground,
            mutedForeground: options.palette.mutedForeground,
          },
        }),
      },
    ])
  }

  return {
    setOptions(next) {
      if (disposed) return
      options = next
      host.setMotion(next.motion)
      host.setSourceOptions(next)
      updatePlate()
    },
    setGeometry(next) {
      if (disposed) return
      const { width, height, plate, formStartX } = next
      const valid =
        [
          width,
          height,
          plate.x,
          plate.y,
          plate.width,
          plate.height,
          plate.radius,
          formStartX,
        ].every(Number.isFinite) &&
        width > 0 &&
        height > 0 &&
        plate.width > 0 &&
        plate.height > 0
      if (!valid) {
        geometry = null
        host.setPanes([])
        host.setPaused(true)
        return
      }
      geometry = next
      host.setSize(width, height)
      updatePlate()
      host.setPaused(false)
    },
    setPointer(x, y, active = true) {
      if (disposed || !geometry) return
      host.setPointer(x, y, active)
    },
    setInteraction(event) {
      if (disposed || !geometry) return
      host.setInteraction('auth-plate', event)
    },
    destroy() {
      if (disposed) return
      disposed = true
      host.destroy()
    },
  }
}
