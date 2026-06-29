import { useEffect, useState } from 'react'
import type { GetApiRoomsByCode200, PostApiRooms200 } from '@/core/api/generated/model'

const savedRoomsStoragePrefix = 'vewave:saved-rooms:v1'
const savedRoomsUpdatedEvent = 'vewave:saved-rooms-updated'
const maxSavedRooms = 12

export type SavedRoomRole = 'owner' | 'host' | 'viewer'
export type SavedRoomStatus = 'active' | 'ended'
export type SavedRoomVisibility = 'private' | 'unlisted' | 'public'

export type SavedRoomSummary = {
  code: string
  title: string
  role: SavedRoomRole | null
  status: SavedRoomStatus | null
  visibility: SavedRoomVisibility | null
  provider: string | null
  mediaTitle: string | null
  mediaUrl: string | null
  thumbnailUrl: string | null
  thumbnailUrls: Array<string>
  videoCount: number | null
  createdAt: string | null
  lastOpenedAt: string
}

export type SaveRoomInput = {
  code: string
  title?: string | null
  role?: SavedRoomRole | null
  status?: SavedRoomStatus | null
  visibility?: SavedRoomVisibility | null
  provider?: string | null
  mediaTitle?: string | null
  mediaUrl?: string | null
  thumbnailUrl?: string | null
  thumbnailUrls?: Array<string | null | undefined> | null
  videoCount?: number | null
  createdAt?: string | null
  lastOpenedAt?: string | null
}

function canUseBrowserStorage() {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    return Boolean(window.localStorage)
  } catch {
    return false
  }
}

function getSavedRoomsStorageKey(userId?: string | null) {
  const scope = userId ? `user:${userId}` : 'guest'

  return `${savedRoomsStoragePrefix}:${encodeURIComponent(scope)}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function getStringList(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  return Array.from(new Set(value.map(getString).filter((item): item is string => Boolean(item))))
}

function getPositiveInteger(value: unknown) {
  return typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : null
}

function getSavedRoomRole(value: unknown): SavedRoomRole | null {
  return value === 'owner' || value === 'host' || value === 'viewer' ? value : null
}

function getSavedRoomStatus(value: unknown): SavedRoomStatus | null {
  return value === 'active' || value === 'ended' ? value : null
}

function getSavedRoomVisibility(value: unknown): SavedRoomVisibility | null {
  return value === 'private' || value === 'unlisted' || value === 'public' ? value : null
}

function parseSavedRoom(value: unknown): SavedRoomSummary | null {
  if (!isRecord(value)) {
    return null
  }

  const code = getString(value.code)

  if (!code) {
    return null
  }

  const title = getString(value.title) ?? `Room ${code}`
  const thumbnailUrl = getString(value.thumbnailUrl)
  const thumbnailUrls = getStringList(value.thumbnailUrls)
  const mergedThumbnailUrls = thumbnailUrl
    ? Array.from(new Set([thumbnailUrl, ...thumbnailUrls]))
    : thumbnailUrls
  const lastOpenedAt =
    getString(value.lastOpenedAt) ?? getString(value.createdAt) ?? new Date(0).toISOString()

  return {
    code,
    title,
    role: getSavedRoomRole(value.role),
    status: getSavedRoomStatus(value.status),
    visibility: getSavedRoomVisibility(value.visibility),
    provider: getString(value.provider),
    mediaTitle: getString(value.mediaTitle),
    mediaUrl: getString(value.mediaUrl),
    thumbnailUrl,
    thumbnailUrls: mergedThumbnailUrls,
    videoCount: getPositiveInteger(value.videoCount),
    createdAt: getString(value.createdAt),
    lastOpenedAt,
  }
}

function isSavedRoomSummary(value: SavedRoomSummary | null): value is SavedRoomSummary {
  return value !== null
}

function getTimestamp(value: string | null | undefined) {
  if (!value) {
    return 0
  }

  const timestamp = Date.parse(value)

  return Number.isFinite(timestamp) ? timestamp : 0
}

function sortSavedRooms(rooms: Array<SavedRoomSummary>) {
  return rooms.sort(
    (left, right) => getTimestamp(right.lastOpenedAt) - getTimestamp(left.lastOpenedAt),
  )
}

function writeSavedRooms(userId: string | null | undefined, rooms: Array<SavedRoomSummary>) {
  if (!canUseBrowserStorage()) {
    return
  }

  const key = getSavedRoomsStorageKey(userId)

  try {
    window.localStorage.setItem(key, JSON.stringify(rooms))
    window.dispatchEvent(new CustomEvent(savedRoomsUpdatedEvent, { detail: { key } }))
  } catch {
    // Storage may be unavailable in privacy-restricted contexts.
  }
}

export function readSavedRooms(userId?: string | null): Array<SavedRoomSummary> {
  if (!canUseBrowserStorage()) {
    return []
  }

  try {
    const raw = window.localStorage.getItem(getSavedRoomsStorageKey(userId))
    const parsed: unknown = raw ? JSON.parse(raw) : []

    if (!Array.isArray(parsed)) {
      return []
    }

    return sortSavedRooms(parsed.map(parseSavedRoom).filter(isSavedRoomSummary)).slice(
      0,
      maxSavedRooms,
    )
  } catch {
    return []
  }
}

export function rememberSavedRoom(userId: string | null | undefined, input: SaveRoomInput) {
  const code = input.code.trim()

  if (!code) {
    return readSavedRooms(userId)
  }

  const thumbnailUrl = input.thumbnailUrl?.trim() || null
  const thumbnailUrls = Array.from(
    new Set([
      ...(thumbnailUrl ? [thumbnailUrl] : []),
      ...(input.thumbnailUrls ?? [])
        .map((url) => url?.trim())
        .filter((url): url is string => Boolean(url)),
    ]),
  )
  const videoCount = input.videoCount && input.videoCount > 0 ? Math.floor(input.videoCount) : null
  const nextRoom: SavedRoomSummary = {
    code,
    title: input.title?.trim() || input.mediaTitle?.trim() || `Room ${code}`,
    role: input.role ?? null,
    status: input.status ?? null,
    visibility: input.visibility ?? null,
    provider: input.provider?.trim() || null,
    mediaTitle: input.mediaTitle?.trim() || null,
    mediaUrl: input.mediaUrl?.trim() || null,
    thumbnailUrl,
    thumbnailUrls,
    videoCount,
    createdAt: input.createdAt ?? null,
    lastOpenedAt: input.lastOpenedAt ?? new Date().toISOString(),
  }
  const previousRooms = readSavedRooms(userId)
  const normalizedCode = code.toLowerCase()
  const nextRooms = [
    nextRoom,
    ...previousRooms.filter((room) => room.code.toLowerCase() !== normalizedCode),
  ].slice(0, maxSavedRooms)

  writeSavedRooms(userId, nextRooms)

  return nextRooms
}

export function rememberCreatedRoom(response: PostApiRooms200, userId?: string | null) {
  const mediaItems = response.mediaItems.length > 0 ? response.mediaItems : [response.media]

  return rememberSavedRoom(userId, {
    code: response.room.code,
    title: response.room.title ?? response.media.title ?? null,
    role: 'owner',
    status: response.room.status,
    visibility: response.room.visibility,
    provider: response.media.provider,
    mediaTitle: response.media.title ?? null,
    mediaUrl: response.media.canonicalUrl,
    thumbnailUrl: response.media.thumbnailUrl ?? null,
    thumbnailUrls: mediaItems.map((item) => item.thumbnailUrl),
    videoCount: mediaItems.length,
    createdAt: response.room.createdAt,
  })
}

export function rememberRoomSnapshot(snapshot: GetApiRoomsByCode200, userId?: string | null) {
  const mediaItems = snapshot.mediaItems.length > 0 ? snapshot.mediaItems : [snapshot.media]

  return rememberSavedRoom(userId, {
    code: snapshot.room.code,
    title: snapshot.room.title ?? snapshot.media.title ?? null,
    role: snapshot.permissions.role,
    status: snapshot.room.status,
    visibility: snapshot.room.visibility,
    provider: snapshot.media.provider,
    mediaTitle: snapshot.media.title ?? null,
    mediaUrl: snapshot.media.canonicalUrl,
    thumbnailUrl: snapshot.media.thumbnailUrl ?? null,
    thumbnailUrls: mediaItems.map((item) => item.thumbnailUrl),
    videoCount: mediaItems.length,
    createdAt: snapshot.room.createdAt,
  })
}

export function subscribeSavedRooms(userId: string | null | undefined, onStoreChange: () => void) {
  if (!canUseBrowserStorage()) {
    return () => {}
  }

  const key = getSavedRoomsStorageKey(userId)
  const handleStorage = (event: StorageEvent) => {
    if (event.key === key) {
      onStoreChange()
    }
  }
  const handleLocalUpdate = (event: Event) => {
    const detail = event instanceof CustomEvent ? (event.detail as { key?: string }) : null

    if (detail?.key === key) {
      onStoreChange()
    }
  }

  window.addEventListener('storage', handleStorage)
  window.addEventListener(savedRoomsUpdatedEvent, handleLocalUpdate)

  return () => {
    window.removeEventListener('storage', handleStorage)
    window.removeEventListener(savedRoomsUpdatedEvent, handleLocalUpdate)
  }
}

export function useSavedRooms(userId?: string | null) {
  const [rooms, setRooms] = useState<Array<SavedRoomSummary>>(() => readSavedRooms(userId))

  useEffect(() => {
    setRooms(readSavedRooms(userId))

    return subscribeSavedRooms(userId, () => {
      setRooms(readSavedRooms(userId))
    })
  }, [userId])

  return rooms
}
