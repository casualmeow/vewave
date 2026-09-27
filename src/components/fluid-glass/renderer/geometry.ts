import type { FluidGlassRadius, FluidGlassRect, FluidGlassShape } from '../types'

export function resolveTargetRadius(
  element: HTMLElement,
  shape: FluidGlassShape,
  radius: FluidGlassRadius,
  width: number,
  height: number,
) {
  if (shape === 'circle' || shape === 'capsule') return Math.min(width, height) / 2
  if (typeof radius === 'number') return Math.min(Math.max(radius, 0), width / 2, height / 2)

  const computedRadius = Number.parseFloat(getComputedStyle(element).borderTopLeftRadius)
  return Number.isFinite(computedRadius) ? Math.min(computedRadius, width / 2, height / 2) : 0
}

export function paddingBoxOrigin(element: Element): { left: number; top: number } {
  const rect = element.getBoundingClientRect()
  if (typeof window === 'undefined' || typeof window.getComputedStyle !== 'function') {
    return { left: rect.left, top: rect.top }
  }
  const style = window.getComputedStyle(element)
  return {
    left: rect.left + (Number.parseFloat(style.borderLeftWidth) || 0),
    top: rect.top + (Number.parseFloat(style.borderTopWidth) || 0),
  }
}

export function toGroupRelativeRect(
  targetRect: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>,
  groupRect: Pick<DOMRect, 'left' | 'top'>,
  radius: number,
  shape: FluidGlassShape,
): FluidGlassRect {
  return {
    x: targetRect.left - groupRect.left,
    y: targetRect.top - groupRect.top,
    width: targetRect.width,
    height: targetRect.height,
    radius,
    shape,
  }
}
