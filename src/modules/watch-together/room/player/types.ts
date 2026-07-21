export interface WatchPlayerAdapter {
  play: () => Promise<void> | void
  pause: () => Promise<void> | void
  seekTo: (positionMs: number) => Promise<void> | void
  getCurrentPositionMs: () => Promise<number> | number
  setPlaybackRate?: (rate: number) => Promise<void> | void
}

/**
 * Snapshot of the embedded player reported through the provider bridge.
 * `playerState` follows the YouTube iframe API contract:
 * -1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering, 5 cued.
 */
export type EmbeddedPlayerInfo = {
  ready: boolean
  currentTimeMs: number | null
  durationMs: number | null
  playerState: number | null
  volume: number
  muted: boolean
}

export const initialEmbeddedPlayerInfo: EmbeddedPlayerInfo = {
  ready: false,
  currentTimeMs: null,
  durationMs: null,
  playerState: null,
  volume: 100,
  muted: false,
}

/** Local-only commands (audio is per-viewer, never synchronized). */
export type EmbeddedPlayerController = {
  setVolume: (volume: number) => void
  mute: () => void
  unmute: () => void
}
