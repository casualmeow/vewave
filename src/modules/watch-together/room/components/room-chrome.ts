import type { CSSProperties } from 'react'
import type { RoomConnectionStatus, RoomOverlayPreferences } from '../model'
import type { GetApiRoomsByCode200Playback } from '@/core/api/generated/model'

/**
 * Inline style for chrome placed over media, driven by the bounded
 * per-user overlay preferences. Glass is reserved for surfaces above the
 * video stage; regular page surfaces stay on the normal token system.
 */
export function getRoomOverlayStyle(overlay: RoomOverlayPreferences): CSSProperties {
  const blurPx = Math.round((overlay.blur / 100) * 20)
  const outlineAlpha = (overlay.outline / 100) * 0.35

  return {
    backgroundColor: `color-mix(in srgb, var(--media-background) ${overlay.opacity}%, transparent)`,
    backdropFilter: blurPx > 0 ? `blur(${blurPx}px)` : undefined,
    WebkitBackdropFilter: blurPx > 0 ? `blur(${blurPx}px)` : undefined,
    boxShadow:
      outlineAlpha > 0 ? `inset 0 0 0 1px rgba(255, 255, 255, ${outlineAlpha})` : undefined,
    borderRadius: overlay.cornerRadius,
  }
}

export type RoomSyncTone = 'positive' | 'caution' | 'critical' | 'neutral'

export type RoomSyncStatus = {
  kind: 'in-sync' | 'syncing' | 'buffering' | 'paused' | 'ended' | 'connecting' | 'disconnected'
  label: string
  tone: RoomSyncTone
}

const syncDriftToleranceMs = 2500

type SyncStatusInput = {
  connectionStatus: RoomConnectionStatus
  playback: GetApiRoomsByCode200Playback | null
  /** Difference between the local player position and the expected synced position. */
  driftMs?: number | null
}

export function getRoomSyncStatus({
  connectionStatus,
  playback,
  driftMs,
}: SyncStatusInput): RoomSyncStatus {
  if (connectionStatus === 'closed' || connectionStatus === 'error') {
    return { kind: 'disconnected', label: 'Disconnected', tone: 'critical' }
  }

  if (connectionStatus === 'connecting' || connectionStatus === 'idle') {
    return { kind: 'connecting', label: 'Reconnecting…', tone: 'caution' }
  }

  if (!playback) {
    return { kind: 'connecting', label: 'Waiting for playback…', tone: 'neutral' }
  }

  if (playback.status === 'buffering') {
    return { kind: 'buffering', label: 'Buffering', tone: 'caution' }
  }

  if (playback.status === 'ended') {
    return { kind: 'ended', label: 'Ended', tone: 'neutral' }
  }

  if (
    playback.status === 'playing' &&
    typeof driftMs === 'number' &&
    Math.abs(driftMs) > syncDriftToleranceMs
  ) {
    return { kind: 'syncing', label: 'Syncing…', tone: 'caution' }
  }

  if (playback.status === 'paused') {
    return { kind: 'paused', label: 'Paused', tone: 'neutral' }
  }

  return { kind: 'in-sync', label: 'In sync', tone: 'positive' }
}

export function formatPlaybackTime(ms: number | null | undefined) {
  if (ms === null || ms === undefined || Number.isNaN(ms)) {
    return '--:--'
  }

  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const paddedSeconds = String(seconds).padStart(2, '0')

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${paddedSeconds}`
  }

  return `${minutes}:${paddedSeconds}`
}
