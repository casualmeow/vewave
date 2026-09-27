import type { CSSProperties } from 'react'
import type { RoomConnectionStatus, RoomOverlayPreferences } from '../model'
import type { GetApiRoomsByCode200Playback } from '@/core/api/generated/model'
import { glassSurfaceVariants } from '@/shared/ui'

export const roomOverlayClassName = glassSurfaceVariants({
  role: 'media',
  thickness: 'thin',
  elevation: 'embedded',
})

export function getRoomOverlayStyle(overlay: RoomOverlayPreferences): CSSProperties {
  const blurPx = Math.round((overlay.blur / 100) * 20)
  const outlineAlpha = (overlay.outline / 100) * 0.35

  return {
    '--glass-media-opacity': `${overlay.opacity}%`,
    '--glass-media-filter': blurPx > 0 ? `blur(${blurPx}px)` : 'none',
    boxShadow:
      outlineAlpha > 0
        ? `inset 0 0 0 1px color-mix(in srgb, var(--media-foreground) ${Math.round(overlay.outline * 35) / 100}%, transparent)`
        : 'none',
    borderRadius: overlay.cornerRadius,
  } as CSSProperties
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
