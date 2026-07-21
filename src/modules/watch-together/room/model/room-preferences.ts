import { useCallback, useSyncExternalStore } from 'react'
import { useAuthStore } from '@/modules/auth'

const roomPreferencesStoragePrefix = 'vewave:room-preferences:v1'
const roomPreferencesUpdatedEvent = 'vewave:room-preferences-updated'

export type RoomViewMode = 'immersive' | 'workspace'
export type RoomStageFit = 'contain' | 'cover'
export type RoomWorkspacePreset = 'conversation' | 'balanced' | 'cinema' | 'custom'
export type RoomOverlayDensity = 'compact' | 'comfortable'

export type RoomOverlayPreferences = {
  /** Surface opacity of overlay chrome, 40–100 (%). */
  opacity: number
  /** Backdrop blur intensity, 0–100 (%). */
  blur: number
  /** Outline intensity of overlay chrome, 0–100 (%). */
  outline: number
  density: RoomOverlayDensity
  /** Corner radius of overlay chrome in px, 0–24. */
  cornerRadius: number
  /** Idle delay before overlay chrome hides during playback, ms. */
  autoHideDelayMs: number
}

export type RoomPreferences = {
  viewMode: RoomViewMode
  stageFit: RoomStageFit
  /** Immersive drawer pinned beside the stage instead of overlaying it. */
  drawerPinned: boolean
  workspacePreset: RoomWorkspacePreset
  /** Fraction of workspace width given to the video stage, 0.35–0.8. */
  workspaceVideoFraction: number
  overlay: RoomOverlayPreferences
}

export const workspacePresetFractions: Record<Exclude<RoomWorkspacePreset, 'custom'>, number> = {
  conversation: 0.46,
  balanced: 0.6,
  cinema: 0.74,
}

export const workspaceVideoFractionBounds = { min: 0.35, max: 0.8 } as const

export const defaultRoomOverlayPreferences: RoomOverlayPreferences = {
  opacity: 80,
  blur: 60,
  outline: 40,
  density: 'compact',
  cornerRadius: 12,
  autoHideDelayMs: 2500,
}

export const defaultRoomPreferences: RoomPreferences = {
  viewMode: 'immersive',
  stageFit: 'contain',
  drawerPinned: false,
  workspacePreset: 'balanced',
  workspaceVideoFraction: workspacePresetFractions.balanced,
  overlay: defaultRoomOverlayPreferences,
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

function getRoomPreferencesStorageKey(userId?: string | null) {
  const scope = userId ? `user:${userId}` : 'guest'

  return `${roomPreferencesStoragePrefix}:${encodeURIComponent(scope)}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function clampNumber(value: unknown, min: number, max: number, fallback: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fallback
  }

  return Math.min(max, Math.max(min, value))
}

function pickEnum<T extends string>(value: unknown, allowed: ReadonlyArray<T>, fallback: T): T {
  return typeof value === 'string' && (allowed as ReadonlyArray<string>).includes(value)
    ? (value as T)
    : fallback
}

function sanitizeRoomPreferences(value: unknown): RoomPreferences {
  if (!isRecord(value)) {
    return defaultRoomPreferences
  }

  const overlay = isRecord(value.overlay) ? value.overlay : {}
  const defaults = defaultRoomPreferences

  return {
    viewMode: pickEnum(value.viewMode, ['immersive', 'workspace'], defaults.viewMode),
    stageFit: pickEnum(value.stageFit, ['contain', 'cover'], defaults.stageFit),
    drawerPinned: value.drawerPinned === true,
    workspacePreset: pickEnum(
      value.workspacePreset,
      ['conversation', 'balanced', 'cinema', 'custom'],
      defaults.workspacePreset,
    ),
    workspaceVideoFraction: clampNumber(
      value.workspaceVideoFraction,
      workspaceVideoFractionBounds.min,
      workspaceVideoFractionBounds.max,
      defaults.workspaceVideoFraction,
    ),
    overlay: {
      opacity: clampNumber(overlay.opacity, 40, 100, defaults.overlay.opacity),
      blur: clampNumber(overlay.blur, 0, 100, defaults.overlay.blur),
      outline: clampNumber(overlay.outline, 0, 100, defaults.overlay.outline),
      density: pickEnum(overlay.density, ['compact', 'comfortable'], defaults.overlay.density),
      cornerRadius: clampNumber(overlay.cornerRadius, 0, 24, defaults.overlay.cornerRadius),
      autoHideDelayMs: clampNumber(
        overlay.autoHideDelayMs,
        1000,
        10000,
        defaults.overlay.autoHideDelayMs,
      ),
    },
  }
}

const preferencesCache = new Map<string, RoomPreferences>()

function readRoomPreferences(storageKey: string): RoomPreferences {
  const cached = preferencesCache.get(storageKey)

  if (cached) {
    return cached
  }

  if (!canUseBrowserStorage()) {
    return defaultRoomPreferences
  }

  let parsed: unknown = null

  try {
    const raw = window.localStorage.getItem(storageKey)
    parsed = raw ? JSON.parse(raw) : null
  } catch {
    parsed = null
  }

  const preferences = parsed ? sanitizeRoomPreferences(parsed) : defaultRoomPreferences
  preferencesCache.set(storageKey, preferences)

  return preferences
}

function writeRoomPreferences(storageKey: string, preferences: RoomPreferences) {
  preferencesCache.set(storageKey, preferences)

  if (canUseBrowserStorage()) {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(preferences))
    } catch {
      // Persist best-effort; in-memory cache still serves this session.
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(roomPreferencesUpdatedEvent, { detail: { storageKey } }))
  }
}

function subscribeToRoomPreferences(storageKey: string, onChange: () => void) {
  if (typeof window === 'undefined') {
    return () => {}
  }

  function handleStorage(event: StorageEvent) {
    if (event.key === null || event.key === storageKey) {
      preferencesCache.delete(storageKey)
      onChange()
    }
  }

  function handleLocalUpdate(event: Event) {
    const detail = (event as CustomEvent<{ storageKey?: string }>).detail

    if (!detail?.storageKey || detail.storageKey === storageKey) {
      onChange()
    }
  }

  window.addEventListener('storage', handleStorage)
  window.addEventListener(roomPreferencesUpdatedEvent, handleLocalUpdate)

  return () => {
    window.removeEventListener('storage', handleStorage)
    window.removeEventListener(roomPreferencesUpdatedEvent, handleLocalUpdate)
  }
}

export type RoomPreferencesUpdate =
  | Partial<Omit<RoomPreferences, 'overlay'>>
  | { overlay: Partial<RoomOverlayPreferences> }

export function useRoomPreferences() {
  const userId = useAuthStore((state) => state.user?.id ?? null)
  const storageKey = getRoomPreferencesStorageKey(userId)

  const preferences = useSyncExternalStore(
    useCallback((onChange) => subscribeToRoomPreferences(storageKey, onChange), [storageKey]),
    () => readRoomPreferences(storageKey),
    () => defaultRoomPreferences,
  )

  const updatePreferences = useCallback(
    (update: RoomPreferencesUpdate) => {
      const current = readRoomPreferences(storageKey)
      const next = sanitizeRoomPreferences({
        ...current,
        ...update,
        overlay: {
          ...current.overlay,
          ...('overlay' in update && update.overlay ? update.overlay : {}),
        },
      })

      writeRoomPreferences(storageKey, next)
    },
    [storageKey],
  )

  const resetPreferences = useCallback(() => {
    writeRoomPreferences(storageKey, defaultRoomPreferences)
  }, [storageKey])

  return { preferences, updatePreferences, resetPreferences }
}
