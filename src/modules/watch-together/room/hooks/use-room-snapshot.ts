import { useEffect } from 'react'
import { useRoomStore } from '../model'
import { useGetApiRoomsByCode } from '@/core/api/generated/rooms/rooms'

export function useRoomSnapshot(code: string) {
  const hydrateSnapshot = useRoomStore((state) => state.hydrateSnapshot)
  const query = useGetApiRoomsByCode(code)

  useEffect(() => {
    if (query.data) {
      hydrateSnapshot(query.data)
    }
  }, [hydrateSnapshot, query.data])

  return query
}
