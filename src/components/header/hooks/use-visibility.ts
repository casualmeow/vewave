import { useCallback, useEffect, useState } from 'react'
import { type MotionValue, useMotionValueEvent } from 'motion/react'

type UseHeaderVisibilityParams = {
  scrollY: MotionValue<number>
  hideOnScrollDown: boolean
  revealAtTop: number
}

export function useHeaderVisibility({
  scrollY,
  hideOnScrollDown,
  revealAtTop,
}: UseHeaderVisibilityParams) {
  const safeRevealAtTop = Math.max(revealAtTop, 0)
  const [isHidden, setIsHidden] = useState(false)

  useMotionValueEvent(scrollY, 'change', (current) => {
    if (!hideOnScrollDown) return

    const previous = scrollY.getPrevious() ?? 0
    const delta = current - previous

    if (current <= safeRevealAtTop) {
      setIsHidden(false)
      return
    }

    if (delta > 2) {
      setIsHidden(true)
      return
    }

    if (delta < -2) {
      setIsHidden(false)
    }
  })

  useEffect(() => {
    if (!hideOnScrollDown) {
      setIsHidden(false)
    }
  }, [hideOnScrollDown])

  const revealHeader = useCallback(() => {
    setIsHidden(false)
  }, [])

  return {
    isHidden,
    revealHeader,
  }
}
