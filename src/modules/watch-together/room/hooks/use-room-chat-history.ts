import { useEffect } from 'react'
import { useRoomStore } from '../model'
import { useGetApiRoomsByCodeChat } from '@/core/api/generated/rooms/rooms'

export function useRoomChatHistory(code: string) {
  const hydrateChatHistory = useRoomStore((state) => state.hydrateChatHistory)
  const query = useGetApiRoomsByCodeChat(code)

  useEffect(() => {
    if (query.data) {
      hydrateChatHistory(query.data.messages)
    }
  }, [hydrateChatHistory, query.data])

  return query
}
