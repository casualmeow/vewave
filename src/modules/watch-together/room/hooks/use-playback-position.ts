import { useEffect, useRef, useState } from 'react'
import type { GetApiRoomsByCode200Playback } from '@/core/api/generated/model'

type PlaybackAnchor = {
  version: number
  positionMs: number
  anchoredAtMs: number
}

/**
 * Live playback position derived from the server-authoritative state.
 * Anchors on every playback version and extrapolates locally while playing,
 * so the timeline advances between server updates.
 */
export function usePlaybackPosition(playback: GetApiRoomsByCode200Playback | null) {
  const anchorRef = useRef<PlaybackAnchor | null>(null)
  const [, setTick] = useState(0)

  if (playback && anchorRef.current?.version !== playback.version) {
    anchorRef.current = {
      version: playback.version,
      positionMs: playback.effectivePositionMs,
      anchoredAtMs: Date.now(),
    }
  }

  const playing = playback?.status === 'playing'

  useEffect(() => {
    if (!playing) {
      return
    }

    const timer = window.setInterval(() => setTick((tick) => tick + 1), 250)

    return () => window.clearInterval(timer)
  }, [playing])

  const anchor = anchorRef.current

  if (!playback || !anchor) {
    return 0
  }

  if (!playing) {
    return anchor.positionMs
  }

  return anchor.positionMs + (Date.now() - anchor.anchoredAtMs) * playback.playbackRate
}
