import { useEffect, useMemo, useRef } from 'react'
import type { ModalGlassMaps } from '@/shared/lib/modal-glass'
import type { GlassMotion } from '@/shared/theme/contract'
import { createGlassInteractionController } from '@/shared/lib/glass-interaction'
import { useGlassInteractionScope } from '@/shared/lib/glass-interaction-scope'
import { createObjectFrameLoop } from '@/components/canvas-ui/object-frame-loop'

export function useModalGlassMotion(
  element: HTMLElement | null,
  map: ModalGlassMaps | null,
  motion: GlassMotion,
  enabled = true,
) {
  const scope = useGlassInteractionScope()
  const field = useRef<SVGFEImageElement>(null)
  const direction = useRef<SVGFEFloodElement>(null)
  const warpMap = useRef<SVGFEDisplacementMapElement>(null)
  const warpHeight = useRef<SVGFEDisplacementMapElement>(null)
  const red = useRef<SVGFEDisplacementMapElement>(null)
  const green = useRef<SVGFEDisplacementMapElement>(null)
  const blue = useRef<SVGFEDisplacementMapElement>(null)
  const refs = useMemo(
    () => ({ field, direction, warp: [warpMap, warpHeight], refraction: [red, green, blue] }),
    [],
  )

  useEffect(() => {
    if (!element) return
    const clear = () => {
      refs.warp.forEach((ref) => ref.current?.setAttribute('scale', '0'))
      element.style.removeProperty('--glass-pointer-x')
      element.style.removeProperty('--glass-pointer-y')
      element.style.removeProperty('--glass-pointer-energy')
      element.style.removeProperty('--glass-press-energy')
    }
    clear()
    if (!scope || !enabled || motion === 'off') return clear

    const getGeometry = () => {
      const width = map?.width ?? element.offsetWidth
      const height = map?.height ?? element.offsetHeight
      const radius = getComputedStyle(element).borderTopLeftRadius
      return {
        width,
        height,
        radius:
          map?.radius ??
          (Number.parseFloat(radius) || 0) *
            (radius.includes('%') ? Math.min(width, height) / 100 : 1),
      }
    }
    const controller = createGlassInteractionController({ motion, geometry: getGeometry() })
    let previousTime: number | null = null
    const loop = createObjectFrameLoop({
      render(time) {
        const delta = previousTime === null ? 1000 / 30 : Math.min(50, time - previousTime)
        previousTime = time
        const frame = controller.step(delta)
        field.current?.setAttribute('x', `${frame.x - 96}`)
        field.current?.setAttribute('y', `${frame.y - 96}`)
        direction.current?.setAttribute(
          'flood-color',
          `rgb(${50 + frame.nx * 50}% ${50 + frame.ny * 50}% 50%)`,
        )
        refs.warp.forEach((ref) =>
          ref.current?.setAttribute(
            'scale',
            `${Math.min(3, frame.bend * frame.refractionGain) * 2}`,
          ),
        )
        element.style.setProperty('--glass-pointer-x', `${frame.x}px`)
        element.style.setProperty('--glass-pointer-y', `${frame.y}px`)
        element.style.setProperty('--glass-pointer-energy', `${frame.energy}`)
        element.style.setProperty('--glass-press-energy', `${frame.pressure}`)
        return frame.active
      },
    })
    const reset = () => {
      controller.reset()
      previousTime = null
      clear()
    }
    const unregister = scope.register(element, (event) => {
      if (event.phase === 'reset' || element.dataset.state === 'closed') {
        reset()
        loop.setVisible(false)
        return
      }
      const rect = element.getBoundingClientRect()
      controller.input({ ...event, x: event.x - rect.left, y: event.y - rect.top })
      if (controller.step(0).active) {
        loop.setVisible(!document.hidden)
        loop.invalidate()
      }
    })
    const resize = new ResizeObserver(() => {
      controller.setGeometry(getGeometry())
      reset()
    })
    resize.observe(element)
    const state = new MutationObserver(() => {
      if (element.dataset.state === 'closed') {
        reset()
        loop.setVisible(false)
      }
    })
    state.observe(element, { attributes: true, attributeFilter: ['data-state'] })
    return () => {
      unregister()
      resize.disconnect()
      state.disconnect()
      loop.dispose()
      reset()
    }
  }, [element, enabled, map, motion, refs, scope])
  return refs
}
