/**
 * useMobileDockPhysics
 *
 * Encapsulates the pointer-tracking and fluid transform physics
 * for the MobileSidebarDock container. Separated from rendering
 * so the dock shell stays a clean orchestrator.
 */
import { getPointerProgress } from '../helpers'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { useFluidTransform, useRafCssVariables } from '@/shared/hooks'

export type UseMobileDockPhysicsOptions = {
  canTrackPointer: boolean
  showLiquidEffects: boolean
  onPointerLeave?: () => void
}

export function useMobileDockPhysics({
  canTrackPointer,
  showLiquidEffects,
  onPointerLeave,
}: UseMobileDockPhysicsOptions) {
  const setCssVariables = useRafCssVariables()
  const { fluidTransformStyle, updateFluidTransform, resetFluidTransform } = useFluidTransform({
    enabled: canTrackPointer,
    magneticStrength: 0,
    magneticVerticalStrength: 0,
    tiltStrength: 1.45,
    perspective: 1100,
    tiltSpring: { stiffness: 180, damping: 28, mass: 0.72 },
  })

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!canTrackPointer) return

    const progress = getPointerProgress({
      clientX: event.clientX,
      clientY: event.clientY,
      rect: event.currentTarget.getBoundingClientRect(),
    })

    setCssVariables(event.currentTarget, {
      '--mobile-dock-pointer-x': `${progress.localX}px`,
      '--mobile-dock-pointer-y': `${progress.localY}px`,
      '--mobile-dock-sheen-x': `${progress.percentX}%`,
      '--mobile-dock-sheen-y': `${progress.percentY}%`,
      '--mobile-dock-glow-opacity': '0.86',
    })

    updateFluidTransform(progress.normalizedX, progress.normalizedY)
  }

  const handlePointerLeave = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (showLiquidEffects) {
      setCssVariables(event.currentTarget, {
        '--mobile-dock-pointer-x': '50%',
        '--mobile-dock-pointer-y': '50%',
        '--mobile-dock-sheen-x': '22%',
        '--mobile-dock-sheen-y': '12%',
        '--mobile-dock-glow-opacity': '0.28',
      })
    }

    resetFluidTransform()
    onPointerLeave?.()
  }

  return {
    fluidTransformStyle,
    handlePointerMove,
    handlePointerLeave,
  }
}
