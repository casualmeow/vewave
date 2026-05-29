import { useCallback } from 'react'
import { useMotionValue, useSpring, useTransform } from 'motion/react'
import { GLASS_MAGNETIC_TRANSITION } from '../constants'
import type { MotionStyle } from 'motion/react'

type UseFluidTransformOptions = {
  enabled: boolean
  magneticStrength: number
  magneticVerticalStrength: number
  tiltStrength: number
  perspective: number
  tiltSpring?: {
    stiffness: number
    damping: number
    mass: number
  }
}

export function useFluidTransform({
  enabled,
  magneticStrength,
  magneticVerticalStrength,
  tiltStrength,
  perspective,
  tiltSpring = { stiffness: 420, damping: 34, mass: 0.62 },
}: UseFluidTransformOptions) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const tiltX = useMotionValue(0)
  const tiltY = useMotionValue(0)
  const springX = useSpring(x, GLASS_MAGNETIC_TRANSITION)
  const springY = useSpring(y, GLASS_MAGNETIC_TRANSITION)
  const springTiltX = useSpring(tiltX, tiltSpring)
  const springTiltY = useSpring(tiltY, tiltSpring)
  const rotateX = useTransform(springTiltY, [-1, 1], [`${tiltStrength}deg`, `${-tiltStrength}deg`])
  const rotateY = useTransform(springTiltX, [-1, 1], [`${-tiltStrength}deg`, `${tiltStrength}deg`])

  const updateFluidTransform = useCallback(
    (normalizedX: number, normalizedY: number) => {
      if (!enabled) return

      x.set(normalizedX * magneticStrength)
      y.set(normalizedY * magneticVerticalStrength)
      tiltX.set(normalizedX)
      tiltY.set(normalizedY)
    },
    [enabled, magneticStrength, magneticVerticalStrength, x, y, tiltX, tiltY],
  )

  const resetFluidTransform = useCallback(() => {
    x.set(0)
    y.set(0)
    tiltX.set(0)
    tiltY.set(0)
  }, [x, y, tiltX, tiltY])

  const fluidTransformStyle = {
    x: enabled ? springX : undefined,
    y: enabled ? springY : undefined,
    rotateX: enabled ? rotateX : undefined,
    rotateY: enabled ? rotateY : undefined,
    transformPerspective: enabled ? perspective : undefined,
    transformStyle: enabled ? 'preserve-3d' : undefined,
  } satisfies MotionStyle

  return {
    fluidTransformStyle,
    updateFluidTransform,
    resetFluidTransform,
  }
}
