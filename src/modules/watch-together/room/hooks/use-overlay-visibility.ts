import { useCallback, useEffect, useRef, useState } from 'react'

type OverlayVisibilityOptions = {
  /** Overlay auto-hides only while playback is running. */
  playing: boolean
  /** Idle delay before hiding, from user preferences. */
  delayMs: number
  /** Extra reasons to stay visible (paused menu, pinned drawer, buffering…). */
  forceVisible?: boolean
}

/**
 * Auto-hide controller for stage overlay chrome. The overlay shows on
 * pointer/touch/keyboard activity and stays visible while paused, focused,
 * or while any tracked interaction (menu, drawer) is open.
 */
export function useOverlayVisibility({ playing, delayMs, forceVisible }: OverlayVisibilityOptions) {
  const [recentActivity, setRecentActivity] = useState(true)
  const [interacting, setInteracting] = useState(false)
  const timerRef = useRef<number | null>(null)

  const poke = useCallback(() => {
    setRecentActivity(true)

    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
    }

    timerRef.current = window.setTimeout(() => setRecentActivity(false), delayMs)
  }, [delayMs])

  useEffect(() => {
    if (playing) {
      poke()
    } else {
      setRecentActivity(true)
    }
  }, [playing, poke])

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
      }
    }
  }, [])

  const visible = !playing || Boolean(forceVisible) || interacting || recentActivity

  return { visible, poke, setInteracting }
}
