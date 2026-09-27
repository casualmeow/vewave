export interface WatchPlayerAdapter {
  play: () => Promise<void> | void
  pause: () => Promise<void> | void
  seekTo: (positionMs: number) => Promise<void> | void
  getCurrentPositionMs: () => Promise<number> | number
  setPlaybackRate?: (rate: number) => Promise<void> | void
}

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

export type EmbeddedPlayerController = {
  setVolume: (volume: number) => void
  mute: () => void
  unmute: () => void
}
