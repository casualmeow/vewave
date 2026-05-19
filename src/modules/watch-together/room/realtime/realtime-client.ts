import type { ClientRoomEvent } from './contracts'
import { wsUrl } from '@/shared/config'

export function buildRoomRealtimeUrl(code: string, accessToken?: string | null) {
  const url = new URL(`/api/realtime/rooms/${encodeURIComponent(code)}`, wsUrl)

  if (accessToken) {
    url.searchParams.set('accessToken', accessToken)
  }

  return url.toString()
}

export function serializeClientRoomEvent(event: ClientRoomEvent) {
  return JSON.stringify(event)
}
