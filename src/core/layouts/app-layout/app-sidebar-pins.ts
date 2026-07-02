import { useEffect, useState } from 'react'

const sidebarPinsStoragePrefix = 'vewave:sidebar-pins:v1'
const sidebarPinsUpdatedEvent = 'vewave:sidebar-pins-updated'
const maxPinnedItems = 24

export type AppSidebarPinState = {
  roomCodes: Array<string>
  serverIds: Array<string>
}

const emptyPins: AppSidebarPinState = {
  roomCodes: [],
  serverIds: [],
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

function getSidebarPinsStorageKey(userId?: string | null) {
  const scope = userId ? `user:${userId}` : 'guest'

  return `${sidebarPinsStoragePrefix}:${encodeURIComponent(scope)}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getStringList(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  return Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === 'string' && Boolean(item.trim()))
        .map((item) => item.trim()),
    ),
  ).slice(0, maxPinnedItems)
}

function parsePins(value: unknown): AppSidebarPinState {
  if (!isRecord(value)) {
    return emptyPins
  }

  return {
    roomCodes: getStringList(value.roomCodes),
    serverIds: getStringList(value.serverIds),
  }
}

function writeSidebarPins(userId: string | null | undefined, pins: AppSidebarPinState) {
  if (!canUseBrowserStorage()) {
    return
  }

  const key = getSidebarPinsStorageKey(userId)

  try {
    window.localStorage.setItem(key, JSON.stringify(pins))
    window.dispatchEvent(new CustomEvent(sidebarPinsUpdatedEvent, { detail: { key } }))
  } catch {
    // Storage may be unavailable in privacy-restricted contexts.
  }
}

export function readSidebarPins(userId?: string | null): AppSidebarPinState {
  if (!canUseBrowserStorage()) {
    return emptyPins
  }

  try {
    const raw = window.localStorage.getItem(getSidebarPinsStorageKey(userId))

    return parsePins(raw ? JSON.parse(raw) : null)
  } catch {
    return emptyPins
  }
}

export function togglePinnedRoom(userId: string | null | undefined, roomCode: string) {
  const code = roomCode.trim()

  if (!code) {
    return readSidebarPins(userId)
  }

  const pins = readSidebarPins(userId)
  const normalizedCode = code.toLowerCase()
  const roomCodes = pins.roomCodes.some((item) => item.toLowerCase() === normalizedCode)
    ? pins.roomCodes.filter((item) => item.toLowerCase() !== normalizedCode)
    : [code, ...pins.roomCodes].slice(0, maxPinnedItems)
  const nextPins = { ...pins, roomCodes }

  writeSidebarPins(userId, nextPins)

  return nextPins
}

export function togglePinnedServer(userId: string | null | undefined, serverId: string) {
  const id = serverId.trim()

  if (!id) {
    return readSidebarPins(userId)
  }

  const pins = readSidebarPins(userId)
  const serverIds = pins.serverIds.includes(id)
    ? pins.serverIds.filter((item) => item !== id)
    : [id, ...pins.serverIds].slice(0, maxPinnedItems)
  const nextPins = { ...pins, serverIds }

  writeSidebarPins(userId, nextPins)

  return nextPins
}

export function unpinRoom(userId: string | null | undefined, roomCode: string) {
  const normalizedCode = roomCode.trim().toLowerCase()

  if (!normalizedCode) {
    return readSidebarPins(userId)
  }

  const pins = readSidebarPins(userId)
  const nextPins = {
    ...pins,
    roomCodes: pins.roomCodes.filter((item) => item.toLowerCase() !== normalizedCode),
  }

  writeSidebarPins(userId, nextPins)

  return nextPins
}

export function unpinServer(userId: string | null | undefined, serverId: string) {
  const id = serverId.trim()

  if (!id) {
    return readSidebarPins(userId)
  }

  const pins = readSidebarPins(userId)
  const nextPins = {
    ...pins,
    serverIds: pins.serverIds.filter((item) => item !== id),
  }

  writeSidebarPins(userId, nextPins)

  return nextPins
}

export function subscribeSidebarPins(userId: string | null | undefined, onStoreChange: () => void) {
  if (!canUseBrowserStorage()) {
    return () => {}
  }

  const key = getSidebarPinsStorageKey(userId)
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
  window.addEventListener(sidebarPinsUpdatedEvent, handleLocalUpdate)

  return () => {
    window.removeEventListener('storage', handleStorage)
    window.removeEventListener(sidebarPinsUpdatedEvent, handleLocalUpdate)
  }
}

export function useSidebarPins(userId?: string | null) {
  const [pins, setPins] = useState<AppSidebarPinState>(() => readSidebarPins(userId))

  useEffect(() => {
    setPins(readSidebarPins(userId))

    return subscribeSidebarPins(userId, () => {
      setPins(readSidebarPins(userId))
    })
  }, [userId])

  return pins
}
