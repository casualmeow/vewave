export interface WatchPlayerAdapter {
  play: () => Promise<void> | void
  pause: () => Promise<void> | void
  seekTo: (positionMs: number) => Promise<void> | void
  getCurrentPositionMs: () => Promise<number> | number
  setPlaybackRate?: (rate: number) => Promise<void> | void
}
