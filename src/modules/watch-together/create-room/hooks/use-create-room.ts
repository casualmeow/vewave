import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { createVideoQueue } from '../model/video-queue'
import { createRoomSchema } from '../schema'
import type { PostApiRooms200 } from '@/core/api/generated/model'
import { postApiMediaParseUrl } from '@/core/api/generated/media/media'
import { postApiRooms } from '@/core/api/generated/rooms/rooms'
import { getApiErrorMessage } from '@/core/api/http/errors'
import { useAuthStore } from '@/modules/auth'
import { rememberCreatedRoom } from '@/modules/watch-together/room/model/saved-rooms'
import { markRoomGuideCreation } from '@/modules/watch-together/room/model/room-guide'

export function useCreateRoom({ onCreated }: { onCreated?: (room: PostApiRooms200) => void } = {}) {
  const navigate = useNavigate()
  const userId = useAuthStore((state) => state.user?.id ?? null)
  const [queue] = useState(() => createVideoQueue((url) => postApiMediaParseUrl({ url })))
  const draft = useSyncExternalStore(queue.subscribe, queue.getSnapshot, queue.getSnapshot)
  const [phase, setPhase] = useState<'idle' | 'creating' | 'opening' | 'created'>('idle')
  const [error, setError] = useState<string | null>(null)
  const created = useRef<PostApiRooms200 | null>(null)
  const busy = useRef(false)

  useEffect(() => {
    queue.reset()
    created.current = null
    setPhase('idle')
    setError(null)
  }, [queue, userId])

  async function submit(title: string, onSuccess?: () => void) {
    if (busy.current) return false
    const owner = userId
    const currentDraft = queue.getSnapshot()
    const validation = createRoomSchema.safeParse({
      title,
      url: currentDraft.videos.map((video) => video.url).join('\n'),
    })
    if (
      !created.current &&
      (!validation.success || currentDraft.videos.some((video) => video.status !== 'ready'))
    ) {
      setError(
        !validation.success
          ? validation.error.issues[0].message
          : 'Check or remove the highlighted links before starting your room.',
      )
      return false
    }
    busy.current = true
    setError(null)
    try {
      if (!created.current) {
        setPhase('creating')
        const urls = currentDraft.videos.map((video) => video.url)
        const room = await postApiRooms({
          title: title.trim() || 'Untitled room',
          url: urls[0],
          urls,
        })
        if (useAuthStore.getState().user?.id !== owner) return false
        created.current = room
        rememberCreatedRoom(room, owner)
        markRoomGuideCreation(owner, room.room.code)
        onSuccess?.()
        toast.success('Room created')
      }
      const room = created.current
      setPhase('opening')
      await navigate({ to: '/room/$code', params: { code: room.room.code } })
      if (useAuthStore.getState().user?.id !== owner) return false
      onCreated?.(room)
      return true
    } catch (failure) {
      if (useAuthStore.getState().user?.id === owner) {
        setError(
          created.current
            ? 'Your room was created. Try opening it again.'
            : getApiErrorMessage(failure, 'Could not create the room. Your videos are still here.'),
        )
      }
      return false
    } finally {
      busy.current = false
      if (useAuthStore.getState().user?.id === owner) setPhase(created.current ? 'created' : 'idle')
    }
  }

  return {
    queue,
    draft,
    phase,
    error,
    submit,
    locked: phase !== 'idle',
    isPending: phase === 'creating' || phase === 'opening',
  }
}
