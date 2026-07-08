import { PinOff } from 'lucide-react'
import { toast } from 'sonner'

import { unpinRoom, unpinServer, useSidebarPins } from '../../app-sidebar-pins'
import {
  SettingsEmptyHint,
  SettingsGroup,
  SettingsItemRow,
  SettingRow,
} from './settings-primitives'
import { useAuthStore } from '@/modules/auth'
import { useSavedRooms } from '@/modules/watch-together/room'
import { useGetApiServers } from '@/core/api/generated/servers/servers'
import { Button } from '@/shared/ui'

export function PinnedSettingsSection() {
  const status = useAuthStore((state) => state.status)
  const user = useAuthStore((state) => state.user)
  const userId = user?.id ?? null
  const pins = useSidebarPins(userId)
  const savedRooms = useSavedRooms(userId)
  const serversQuery = useGetApiServers({
    query: { enabled: status === 'authenticated' },
  })

  const roomTitleByCode = new Map(savedRooms.map((room) => [room.code.toLowerCase(), room.title]))
  const serverById = new Map((serversQuery.data?.servers ?? []).map((item) => [item.id, item]))

  const handleUnpinRoom = (code: string) => {
    unpinRoom(userId, code)
    toast.success('Room unpinned')
  }

  const handleUnpinServer = (serverId: string) => {
    unpinServer(userId, serverId)
    toast.success('Server unpinned')
  }

  return (
    <div className="grid gap-6">
      <SettingsGroup title={`Pinned rooms (${pins.roomCodes.length})`}>
        {pins.roomCodes.length === 0 ? (
          <SettingsEmptyHint>
            No pinned rooms yet. Pin a room from the sidebar to keep it at the top.
          </SettingsEmptyHint>
        ) : (
          <ul className="grid gap-2">
            {pins.roomCodes.map((code) => (
              <SettingsItemRow
                key={code}
                title={roomTitleByCode.get(code.toLowerCase()) ?? `Room ${code}`}
                meta={`Code ${code}`}
                actions={
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Unpin room ${code}`}
                    onClick={() => handleUnpinRoom(code)}
                  >
                    <PinOff className="size-4" />
                  </Button>
                }
              />
            ))}
          </ul>
        )}
        {pins.roomCodes.length > 1 ? (
          <SettingRow
            title="Unpin all rooms"
            description="Removes every room pin. Rooms stay in your watch history."
            control={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  pins.roomCodes.forEach((code) => unpinRoom(userId, code))
                  toast.success('All rooms unpinned')
                }}
              >
                Unpin all
              </Button>
            }
          />
        ) : null}
      </SettingsGroup>

      <SettingsGroup title={`Pinned servers (${pins.serverIds.length})`}>
        {status !== 'authenticated' ? (
          <SettingsEmptyHint>Sign in to browse and pin servers.</SettingsEmptyHint>
        ) : pins.serverIds.length === 0 ? (
          <SettingsEmptyHint>
            No pinned servers yet. Pin a server from the sidebar to keep it at the top.
          </SettingsEmptyHint>
        ) : (
          <ul className="grid gap-2">
            {pins.serverIds.map((serverId) => {
              const server = serverById.get(serverId)

              return (
                <SettingsItemRow
                  key={serverId}
                  title={server?.name ?? 'Server unavailable'}
                  meta={
                    server
                      ? `${server.memberCount} member${server.memberCount === 1 ? '' : 's'} · ${server.roomCount} room${server.roomCount === 1 ? '' : 's'}`
                      : 'You may no longer be a member of this server.'
                  }
                  actions={
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Unpin server ${server?.name ?? serverId}`}
                      onClick={() => handleUnpinServer(serverId)}
                    >
                      <PinOff className="size-4" />
                    </Button>
                  }
                />
              )
            })}
          </ul>
        )}
      </SettingsGroup>
    </div>
  )
}
