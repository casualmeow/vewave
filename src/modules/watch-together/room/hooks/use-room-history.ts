import { useEffect } from 'react'
import { useRoomStore } from '../model'
import { useGetApiRoomsByCodeHistory } from '@/core/api/generated/rooms/rooms'

export function useRoomHistory(code: string) {
  const hydrateRoomHistory = useRoomStore((state) => state.hydrateRoomHistory)
  const query = useGetApiRoomsByCodeHistory(code)

  useEffect(() => {
    if (query.data) {
      hydrateRoomHistory(query.data.items)
    }
  }, [hydrateRoomHistory, query.data])

  return query
}
