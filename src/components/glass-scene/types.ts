import type { Object3D } from 'three'
import type { ResolvedGlassMaterial } from '@/shared/lib/glass-material'
import type { GlassMotion } from '@/shared/theme/contract'
import type { GlassInteractionEvent } from '@/shared/lib/glass-interaction'

export type ScenePane = {
  id: string
  x: number
  y: number
  width: number
  height: number
  radius: number
  material: ResolvedGlassMaterial
  enabled?: boolean

  contentInset?: number
}

export type GlassSceneSourceContext = {
  width: number
  height: number
  invalidate: () => void
}

export type GlassSceneSource<T> = {
  object: Object3D
  update: (options: T) => void
  resize?: (width: number, height: number) => void

  frame?: (elapsedMs: number) => boolean
  setPanes?: (panes: ReadonlyArray<ScenePane>) => void
  setPointer?: (x: number, y: number, active: boolean) => void
  setInteraction?: (event: GlassInteractionEvent) => void
  dispose: () => void
}

export type GlassSceneSourceFactory<T> = (
  initial: T,
  context: GlassSceneSourceContext,
) => GlassSceneSource<T>

export type GlassSceneRendererOptions<T> = {
  source: GlassSceneSourceFactory<T>
  sourceOptions: T
  motion?: GlassMotion
  onReady?: () => void
  onFrame?: () => void
  onError?: () => void
}

export type GlassSceneRenderer<T> = {
  setSourceOptions: (options: T) => void
  setSize: (width: number, height: number) => void
  setPanes: (panes: ReadonlyArray<ScenePane>) => void
  setPointer: (x: number, y: number, active?: boolean) => void

  setInteraction: (paneId: string | null, event: GlassInteractionEvent) => void
  setPaused: (paused: boolean) => void
  setMotion: (motion: GlassMotion) => void
  invalidate: () => void
  destroy: () => void
}
