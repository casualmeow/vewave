import { create } from 'zustand'
import type {
  GetApiRoomsByCode200,
  GetApiRoomsByCode200Playback,
  GetApiRoomsByCodeHistory200ItemsItem,
} from '@/core/api/generated/model'
import type { ChatMessage, PresenceMember, ServerRoomEvent } from '../realtime'

export type RoomConnectionStatus = 'idle' | 'connecting' | 'open' | 'closed' | 'error'
export type { ChatMessage }
export type RoomHistoryItem = GetApiRoomsByCodeHistory200ItemsItem

const maxChatMessages = 500

type RoomState = {
  snapshot: GetApiRoomsByCode200 | null
  playback: GetApiRoomsByCode200Playback | null
  presence: Array<PresenceMember>
  chatMessages: Array<ChatMessage>
  roomHistory: Array<RoomHistoryItem>
  connectionStatus: RoomConnectionStatus
  lastError: string | null
  hydrateSnapshot: (snapshot: GetApiRoomsByCode200) => void
  updateRoomMetadata: (room: GetApiRoomsByCode200['room']) => void
  hydrateChatHistory: (messages: Array<ChatMessage>) => void
  hydrateRoomHistory: (items: Array<RoomHistoryItem>) => void
  applyServerEvent: (event: ServerRoomEvent) => void
  setConnectionStatus: (status: RoomConnectionStatus) => void
  setLastError: (message: string | null) => void
  reset: () => void
}

export const initialRoomState = {
  snapshot: null,
  playback: null,
  presence: [] as Array<PresenceMember>,
  chatMessages: [] as Array<ChatMessage>,
  roomHistory: [] as Array<RoomHistoryItem>,
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
  updateRoomMetadata: (room) =>
    set((state) => ({
      snapshot: state.snapshot ? { ...state.snapshot, room } : null,
    })),
  hydrateChatHistory: (messages) => set({ chatMessages: messages }),
  hydrateRoomHistory: (items) => set({ roomHistory: items }),
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
        case 'presence.status.changed':
          return {
            presence: event.payload.members,
          }
        case 'chat.message':
          return {
            chatMessages: [...state.chatMessages, event.payload].slice(-maxChatMessages),
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
