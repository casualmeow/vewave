import { patchApiProfileMeRoomGuide } from '@/core/api/generated/profile/profile'
import { useAuthStore } from '@/modules/auth/model'

export type RoomGuideProgress = { version: 1; status: 'pending' | 'completed' | 'dismissed' }
export type RoomGuideOutcome = Exclude<RoomGuideProgress['status'], 'pending'>

const creations = new Map<string, string>()
const pendingSaves = new Map<string, RoomGuideOutcome>()

export function readRoomGuide(config: unknown): RoomGuideProgress | null {
  if (!config || typeof config !== 'object' || !('roomGuide' in config)) return null
  const value = config.roomGuide
  if (
    !value ||
    typeof value !== 'object' ||
    !('version' in value) ||
    value.version !== 1 ||
    !('status' in value)
  )
    return null
  if (value.status !== 'pending' && value.status !== 'completed' && value.status !== 'dismissed')
    return null
  return { version: 1, status: value.status }
}

export function markRoomGuideCreation(userId: string | null, code: string) {
  if (userId) creations.set(userId, code.toLowerCase())
}

export function consumeRoomGuideCreation(userId: string, code: string) {
  if (creations.get(userId) !== code.toLowerCase()) return false
  creations.delete(userId)
  return true
}

export function hasRoomGuideCreation(userId: string, code: string) {
  return creations.get(userId) === code.toLowerCase()
}

function storageKey(userId: string) {
  return `vewave:room-guide-pending:v1:${encodeURIComponent(userId)}`
}

export function getPendingRoomGuideSave(userId: string) {
  const memory = pendingSaves.get(userId)
  if (memory) return memory
  try {
    const value = window.localStorage.getItem(storageKey(userId))
    return value === 'completed' || value === 'dismissed' ? value : null
  } catch {
    return null
  }
}

export async function saveRoomGuideProgress(userId: string, status: RoomGuideOutcome) {
  pendingSaves.set(userId, status)
  try {
    window.localStorage.setItem(storageKey(userId), status)
  } catch {}
  const auth = useAuthStore.getState()
  if (auth.user?.id !== userId || !auth.accessToken) return
  const controller = new AbortController()
  const unsubscribe = useAuthStore.subscribe((next) => {
    if (next.user?.id !== userId) controller.abort()
  })
  try {
    const response = await patchApiProfileMeRoomGuide({ status }, undefined, controller.signal)
    const current = useAuthStore.getState()
    if (controller.signal.aborted || current.user?.id !== userId || !current.accessToken) return
    current.setAuthenticated(
      { ...current.user, appConfig: { ...current.user.appConfig, roomGuide: response.roomGuide } },
      current.accessToken,
    )
    if (pendingSaves.get(userId) === status) {
      pendingSaves.delete(userId)
      try {
        window.localStorage.removeItem(storageKey(userId))
      } catch {}
    }
  } finally {
    unsubscribe()
  }
}

export function resetRoomGuideSession() {
  creations.clear()
  pendingSaves.clear()
}
