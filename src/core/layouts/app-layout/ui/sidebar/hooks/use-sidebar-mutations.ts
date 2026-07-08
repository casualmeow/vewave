import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  togglePinnedRoom,
  togglePinnedServer,
  unpinRoom,
  unpinServer,
} from '../../../app-sidebar-pins'
import type { AppSidebarRoomItem } from '../../../app-sidebar-items'
import type { GetApiServers200ServersItem } from '@/core/api/generated/model'
import { useAuthStore } from '@/modules/auth'
import { forgetSavedRoom } from '@/modules/watch-together/room'
import {
  getGetApiServersCommunityQueryKey,
  getGetApiServersQueryKey,
  useDeleteApiServersByServerIdMembership,
} from '@/core/api/generated/servers/servers'

export type AppSidebarServerItem = GetApiServers200ServersItem

export function useSidebarMutations() {
  const queryClient = useQueryClient()
  const deleteServerMutation = useDeleteApiServersByServerIdMembership()
  const user = useAuthStore((state) => state.user)
  const userId = user?.id ?? null

  function removeRoom(room: AppSidebarRoomItem) {
    forgetSavedRoom(userId, room.code)
    unpinRoom(userId, room.code)
    toast.success('Room removed from sidebar')
  }

  async function removeServer(server: AppSidebarServerItem) {
    try {
      await deleteServerMutation.mutateAsync({ serverId: server.id })
      unpinServer(userId, server.id)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: getGetApiServersQueryKey() }),
        queryClient.invalidateQueries({ queryKey: getGetApiServersCommunityQueryKey() }),
      ])
      toast.success('Server removed from sidebar')
    } catch {
      toast.error('Unable to remove server')
    }
  }

  function handleToggleRoomPin(room: AppSidebarRoomItem) {
    togglePinnedRoom(userId, room.code)
  }

  function handleToggleServerPin(server: AppSidebarServerItem) {
    togglePinnedServer(userId, server.id)
  }

  return {
    removeRoom,
    removeServer,
    toggleRoomPin: handleToggleRoomPin,
    toggleServerPin: handleToggleServerPin,
  }
}
