import { useCallback, useEffect, useRef, useState } from 'react'
import { type MotionValue, useMotionValueEvent } from 'motion/react'

import { type HeaderCollapseBehavior } from '../types'

type UseHeaderCollapsedStateParams = {
  progress: MotionValue<number>
  collapseBehavior: HeaderCollapseBehavior
  manualCollapsed: boolean
  collapseThreshold: number
  onCollapsedChange?: (collapsed: boolean) => void
}

export function useHeaderCollapsedState({
  progress,
  collapseBehavior,
  manualCollapsed,
  collapseThreshold,
  onCollapsedChange,
}: UseHeaderCollapsedStateParams) {
  const initialDerivedCollapsed = collapseBehavior === 'manual' ? Boolean(manualCollapsed) : false

  const [isCollapsed, setIsCollapsed] = useState(initialDerivedCollapsed)
  const collapsedRef = useRef(initialDerivedCollapsed)

  const notifyCollapsedChange = useCallback(
    (nextCollapsed: boolean) => {
      if (collapsedRef.current === nextCollapsed) return

      collapsedRef.current = nextCollapsed
      setIsCollapsed(nextCollapsed)
      onCollapsedChange?.(nextCollapsed)
    },
    [onCollapsedChange],
  )

  useMotionValueEvent(progress, 'change', (latest) => {
    notifyCollapsedChange(latest >= collapseThreshold)
  })

  useEffect(() => {
    if (collapseBehavior === 'none') {
      notifyCollapsedChange(false)
      return
    }

    if (collapseBehavior === 'manual') {
      notifyCollapsedChange(Boolean(manualCollapsed))
      return
    }

    notifyCollapsedChange(progress.get() >= collapseThreshold)
  }, [collapseBehavior, collapseThreshold, manualCollapsed, notifyCollapsedChange, progress])

  return isCollapsed
}
