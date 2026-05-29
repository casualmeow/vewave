import type { GlassDragMode } from '../types'

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function toMotionDragMode(mode: GlassDragMode) {
  if (mode === 'none') return false
  if (mode === 'both') return true
  return mode
}

export function getPointerProgress({
  clientX,
  clientY,
  rect,
}: {
  clientX: number
  clientY: number
  rect: DOMRect
}) {
  const localX = clientX - rect.left
  const localY = clientY - rect.top
  const percentX = clamp((localX / rect.width) * 100, 0, 100)
  const percentY = clamp((localY / rect.height) * 100, 0, 100)
  const normalizedX = percentX / 50 - 1
  const normalizedY = percentY / 50 - 1

  return {
    localX,
    localY,
    percentX,
    percentY,
    normalizedX,
    normalizedY,
  }
}
