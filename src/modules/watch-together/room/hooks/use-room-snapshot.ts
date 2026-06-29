import { useEffect } from 'react'
import { rememberRoomSnapshot, useRoomStore } from '../model'
import { useGetApiRoomsByCode } from '@/core/api/generated/rooms/rooms'
import { useAuthStore } from '@/modules/auth'

export function useRoomSnapshot(code: string) {
  const hydrateSnapshot = useRoomStore((state) => state.hydrateSnapshot)
  const resetRoom = useRoomStore((state) => state.reset)
  const userId = useAuthStore((state) => state.user?.id ?? null)
  const query = useGetApiRoomsByCode(code)

  useEffect(() => {
    resetRoom()
  }, [code, resetRoom])

  useEffect(() => {
    if (query.data) {
      hydrateSnapshot(query.data)
      rememberRoomSnapshot(query.data, userId)
    }
  }, [hydrateSnapshot, query.data, userId])

  return query
}
