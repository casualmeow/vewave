import { useMemo } from 'react'
import { useSidebarPins } from '../../../app-sidebar-pins'
import { getSidebarRoomItem } from '../utils'
import { MAX_RECENT_ITEMS } from '../constants'
import type { AppSidebarRoomItem } from '../../../app-sidebar-items'
import type { AppSidebarServerItem } from '../components/resource-rows'
import { useAuthStore } from '@/modules/auth'
import { useGetApiServers } from '@/core/api/generated/servers/servers'
import { useSavedRooms } from '@/modules/watch-together/room'

export function useSidebarData() {
  const status = useAuthStore((state) => state.status)
  const user = useAuthStore((state) => state.user)
  const userId = user?.id ?? null
  const savedRooms = useSavedRooms(userId)
  const serversQuery = useGetApiServers({
    query: { enabled: status === 'authenticated' },
  })

  const userServers = serversQuery.data?.servers ?? []
  const pins = useSidebarPins(userId)

  const recentRoomItems = useMemo(
    () => savedRooms.slice(0, MAX_RECENT_ITEMS).map(getSidebarRoomItem),
    [savedRooms],
  )

  const roomsByCode = useMemo(
    () => new Map(recentRoomItems.map((room) => [room.code.toLowerCase(), room])),
    [recentRoomItems],
  )

  const serversById = useMemo(
    () => new Map(userServers.map((server) => [server.id, server])),
    [userServers],
  )

  const pinnedRooms = useMemo(
    () =>
      pins.roomCodes
        .map((code) => roomsByCode.get(code.toLowerCase()))
        .filter((room): room is AppSidebarRoomItem => Boolean(room)),
    [pins.roomCodes, roomsByCode],
  )

  const pinnedServers = useMemo(
    () =>
      pins.serverIds
        .map((serverId) => serversById.get(serverId))
        .filter((server): server is AppSidebarServerItem => Boolean(server)),
    [pins.serverIds, serversById],
  )

  return {
    pins,
    pinnedRooms,
    pinnedServers,
    recentRoomItems,
    status,
    user,
    userServers,
  }
}
