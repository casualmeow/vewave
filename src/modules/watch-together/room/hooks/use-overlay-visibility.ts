import { useCallback, useEffect, useRef, useState } from 'react'

type OverlayVisibilityOptions = {
  playing: boolean

  delayMs: number

  forceVisible?: boolean
}

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
