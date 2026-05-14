import { type RefObject, useEffect } from 'react'
import { useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'

import { SPRING_PRESETS } from '../constants'
import {
  type CSSLength,
  type HeaderCollapseBehavior,
  type HeaderMotionPreset,
} from '../types/types'
import { toWidth } from '../helpers'

import { clamp } from '@/shared/lib/utils'

type UseHeaderMotionParams = {
  initialWidth: CSSLength
  collapsedWidth: CSSLength
  scrollDistance: number
  collapseThreshold: number
  collapseBehavior: HeaderCollapseBehavior
  collapsed?: boolean
  defaultCollapsed: boolean
  borderRadiusExpanded: number
  borderRadiusCollapsed: number
  motionPreset: HeaderMotionPreset
  smoothScrollMotion: boolean
  scrollContainerRef?: RefObject<HTMLElement | null>
}

export function useHeaderMotion({
  initialWidth,
  collapsedWidth,
  scrollDistance,
  collapseThreshold,
  collapseBehavior,
  collapsed,
  defaultCollapsed,
  borderRadiusExpanded,
  borderRadiusCollapsed,
  motionPreset,
  smoothScrollMotion,
  scrollContainerRef,
}: UseHeaderMotionParams) {
  const prefersReducedMotion = useReducedMotion()
  const { scrollY } = useScroll({ container: scrollContainerRef })

  const safeScrollDistance = Math.max(scrollDistance, 1)
  const safeCollapseThreshold = clamp(collapseThreshold, 0, 1)
  const safeVisualThreshold = Math.max(safeCollapseThreshold, 0.001)

  const manualCollapsed = collapsed ?? defaultCollapsed

  const scrollProgress = useTransform(scrollY, [0, safeScrollDistance], [0, 1], {
    clamp: true,
  })

  const manualProgress = useMotionValue(manualCollapsed ? 1 : 0)
  const expandedProgress = useMotionValue(0)

  useEffect(() => {
    if (collapseBehavior !== 'manual') return

    manualProgress.set(manualCollapsed ? 1 : 0)
  }, [collapseBehavior, manualCollapsed, manualProgress])

  const sourceProgress =
    collapseBehavior === 'scroll'
      ? scrollProgress
      : collapseBehavior === 'manual'
        ? manualProgress
        : expandedProgress

  const smoothedProgress = useSpring(sourceProgress, SPRING_PRESETS[motionPreset])

  const progress = smoothScrollMotion && !prefersReducedMotion ? smoothedProgress : sourceProgress

  const width = useTransform(progress, [0, 1], [toWidth(initialWidth), toWidth(collapsedWidth)])

  const borderRadius = useTransform(
    progress,
    [0, 1],
    [`${borderRadiusExpanded}px`, `${borderRadiusCollapsed}px`],
  )

  const navOpacity = useTransform(progress, [0, safeVisualThreshold, 1], [1, 1, 0])
  const navScale = useTransform(progress, [0, 1], [1, 0.96])

  return {
    scrollY,
    progress,
    width,
    borderRadius,
    navOpacity,
    navScale,
    prefersReducedMotion,
    manualCollapsed,
    safeCollapseThreshold,
  }
}
