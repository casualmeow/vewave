import { create } from 'zustand'
import type { GetApiRoomsByCode200, GetApiRoomsByCode200Playback } from '@/core/api/generated/model'
import type { PresenceMember, ServerRoomEvent } from '../realtime'

export type RoomConnectionStatus = 'idle' | 'connecting' | 'open' | 'closed' | 'error'

type RoomState = {
  snapshot: GetApiRoomsByCode200 | null
  playback: GetApiRoomsByCode200Playback | null
  presence: Array<PresenceMember>
  connectionStatus: RoomConnectionStatus
  lastError: string | null
  hydrateSnapshot: (snapshot: GetApiRoomsByCode200) => void
  applyServerEvent: (event: ServerRoomEvent) => void
  setConnectionStatus: (status: RoomConnectionStatus) => void
  setLastError: (message: string | null) => void
  reset: () => void
}

export const initialRoomState = {
  snapshot: null,
  playback: null,
  presence: [] as Array<PresenceMember>,
  connectionStatus: 'idle' as RoomConnectionStatus,
  lastError: null,
}

export const useRoomStore = create<RoomState>((set) => ({
  ...initialRoomState,
  hydrateSnapshot: (snapshot) =>
    set({
      snapshot,
      playback: snapshot.playback,
      presence: 'presence' in snapshot && Array.isArray(snapshot.presence) ? snapshot.presence : [],
      lastError: null,
    }),
  applyServerEvent: (event) =>
    set((state) => {
      switch (event.type) {
        case 'room.snapshot':
          return {
            snapshot: event.payload,
            playback: event.payload.playback,
            presence: event.payload.presence?.members ?? state.presence,
            lastError: null,
          }
        case 'playback.state':
          return {
            playback: event.payload,
            snapshot: state.snapshot
              ? { ...state.snapshot, playback: event.payload }
              : state.snapshot,
          }
        case 'presence.member.joined':
          return {
            presence: event.payload.members,
          }
        case 'presence.member.left':
          return {
            presence: event.payload.members,
          }
        case 'command.rejected':
          return {
            lastError: event.payload.message,
          }
        case 'error':
          return {
            connectionStatus: 'error',
            lastError: event.payload.message,
          }
        case 'room.pong':
          return state
      }
    }),
  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
  setLastError: (lastError) => set({ lastError }),
  reset: () => set(initialRoomState),
}))
