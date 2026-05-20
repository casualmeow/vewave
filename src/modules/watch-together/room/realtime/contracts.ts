import { z } from 'zod'
import type { GetApiRoomsByCode200, GetApiRoomsByCode200Playback } from '@/core/api/generated/model'

export type PlaybackCommandAction = 'play' | 'pause' | 'seek'

export type PlaybackCommandPayload = {
  action: PlaybackCommandAction
  positionMs?: number
  clientTimeMs: number
}

export type ClientRoomEvent =
  | { type: 'room.ping'; payload: { clientTimeMs: number } }
  | { type: 'playback.command'; payload: PlaybackCommandPayload }

export type PresenceMember = {
  connectionId: string
  memberId: string | null
  userId: string | null
  name: string
  role: 'owner' | 'host' | 'viewer' | string
}

export type RoomSnapshotPayload = GetApiRoomsByCode200 & {
  presence?: {
    members: Array<PresenceMember>
  }
}

export type CommandRejectedPayload = {
  code?: string
  message: string
  details?: unknown
}

export type RealtimeErrorPayload = {
  code?: string
  message: string
  details?: unknown
}

export type ServerRoomEvent =
  | { type: 'room.snapshot'; payload: RoomSnapshotPayload }
  | { type: 'room.pong'; payload: { serverTimeMs?: number } }
  | {
      type: 'presence.member.joined'
      payload: { member: PresenceMember; members: Array<PresenceMember> }
    }
  | {
      type: 'presence.member.left'
      payload: {
        connectionId: string
        memberId: string | null
        userId: string | null
        members: Array<PresenceMember>
      }
    }
  | { type: 'playback.state'; payload: GetApiRoomsByCode200Playback }
  | { type: 'command.rejected'; payload: CommandRejectedPayload }
  | { type: 'error'; payload: RealtimeErrorPayload }

const playbackSchema = z
  .object({
    status: z.enum(['playing', 'paused', 'buffering', 'ended']),
    positionMs: z.number().min(0),
    effectivePositionMs: z.number().min(0),
    playbackRate: z.number().min(0.25).max(2),
    version: z.number().min(0),
    updatedAt: z.string(),
    serverTimeMs: z.number(),
  })
  .passthrough()

const presenceMemberSchema = z
  .object({
    connectionId: z.string(),
    memberId: z.string().nullable(),
    userId: z.string().nullable(),
    name: z.string(),
    role: z.string(),
  })
  .passthrough()

const presenceSchema = z.object({
  members: z.array(presenceMemberSchema),
})

const snapshotSchema = z
  .object({
    room: z.object({ code: z.string() }).passthrough(),
    media: z
      .object({ provider: z.string(), externalId: z.string(), canonicalUrl: z.string() })
      .passthrough(),
    playback: playbackSchema,
    permissions: z.object({ role: z.string(), canControlPlayback: z.boolean() }).passthrough(),
    presence: presenceSchema.optional(),
  })
  .passthrough()

const serverEventSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('room.snapshot'), payload: snapshotSchema }),
  z.object({
    type: z.literal('room.pong'),
    payload: z.object({ serverTimeMs: z.number().optional() }).passthrough(),
  }),
  z.object({
    type: z.literal('presence.member.joined'),
    payload: z.object({ member: presenceMemberSchema, members: z.array(presenceMemberSchema) }),
  }),
  z.object({
    type: z.literal('presence.member.left'),
    payload: z
      .object({
        connectionId: z.string(),
        memberId: z.string().nullable(),
        userId: z.string().nullable(),
        members: z.array(presenceMemberSchema),
      })
      .passthrough(),
  }),
  z.object({ type: z.literal('playback.state'), payload: playbackSchema }),
  z.object({
    type: z.literal('command.rejected'),
    payload: z
      .object({
        code: z.string().optional(),
        message: z.string(),
        details: z.unknown().optional(),
      })
      .passthrough(),
  }),
  z.object({
    type: z.literal('error'),
    payload: z
      .object({
        code: z.string().optional(),
        message: z.string(),
        details: z.unknown().optional(),
      })
      .passthrough(),
  }),
])

export function parseServerRoomEvent(value: unknown): ServerRoomEvent | null {
  const result = serverEventSchema.safeParse(value)

  if (!result.success) {
    return null
  }

  return result.data as ServerRoomEvent
}

export function createPlaybackCommand(
  action: PlaybackCommandAction,
  positionMs?: number,
): ClientRoomEvent {
  return {
    type: 'playback.command',
    payload: {
      action,
      positionMs,
      clientTimeMs: Date.now(),
    },
  }
}
