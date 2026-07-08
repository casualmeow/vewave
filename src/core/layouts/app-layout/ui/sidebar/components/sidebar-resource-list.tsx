import { Radio, type LucideIcon } from 'lucide-react'
import { SidebarEmptyState } from './sidebar-empty-state'
import {
  PanelRouteLink,
  RoomResourceRow,
  ServerResourceRow,
  type AppSidebarServerItem,
} from './resource-rows'
import type { AppSidebarRoomItem } from '../../../app-sidebar-items'
import type { useSidebarPins } from '../../../app-sidebar-pins'

export function isRoomPinned(pins: ReturnType<typeof useSidebarPins>, roomCode: string) {
  const normalizedCode = roomCode.toLowerCase()
  return pins.roomCodes.some((code) => code.toLowerCase() === normalizedCode)
}

interface SidebarResourceListProps {
  emptyDescription: string
  emptyIcon: LucideIcon
  emptyTitle: string
  onRemoveRoom: (room: AppSidebarRoomItem) => void
  onRemoveServer: (server: AppSidebarServerItem) => void
  onToggleRoomPin: (room: AppSidebarRoomItem) => void
  onToggleServerPin: (server: AppSidebarServerItem) => void
  pathname: string
  pins: ReturnType<typeof useSidebarPins>
  rooms?: Array<AppSidebarRoomItem>
  servers?: Array<AppSidebarServerItem>
  showRoomsDashboardLink?: boolean
}

export function SidebarResourceList({
  emptyDescription,
  emptyIcon,
  emptyTitle,
  onRemoveRoom,
  onRemoveServer,
  onToggleRoomPin,
  onToggleServerPin,
  pathname,
  pins,
  rooms = [],
  servers = [],
  showRoomsDashboardLink = false,
}: SidebarResourceListProps) {
  const hasItems = rooms.length > 0 || servers.length > 0

  return (
    <>
      {showRoomsDashboardLink && (
        <PanelRouteLink
          active={pathname === '/projects'}
          icon={Radio}
          label="Rooms dashboard"
          meta="All saved rooms"
          to="/projects"
        />
      )}

      {!hasItems ? (
        <SidebarEmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
      ) : (
        <>
          {rooms.map((room) => (
            <RoomResourceRow
              key={`room-${room.code}`}
              active={pathname === `/room/${room.code}`}
              pinned={isRoomPinned(pins, room.code)}
              room={room}
              onRemove={() => onRemoveRoom(room)}
              onTogglePin={() => onToggleRoomPin(room)}
            />
          ))}
          {servers.map((server) => (
            <ServerResourceRow
              key={`server-${server.id}`}
              active={pathname === `/servers/${server.id}`}
              pinned={pins.serverIds.includes(server.id)}
              server={server}
              onRemove={() => onRemoveServer(server)}
              onTogglePin={() => onToggleServerPin(server)}
            />
          ))}
        </>
      )}
    </>
  )
}
