import { History, Pin, Radio, Server, type LucideIcon } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { MAX_RECENT_ITEMS } from '../constants'
import { useSidebarData, useSidebarMutations } from '../hooks'
import { SidebarCategoryBlock } from './sidebar-category-block'
import { SidebarRoomListItem, SidebarServerListItem } from './resource-rows'
import { isRoomPinned } from './sidebar-resource-list'
import type { AppSidebarSectionId } from '../types'
import type { AppSidebarRoomItem } from '../../../app-sidebar-items'
import type { AppSidebarServerItem } from './resource-rows'

export function SidebarCategories({
  activeCategory,
  collapsed,
  pathname,
  onOpenCategory,
}: {
  activeCategory: AppSidebarSectionId | null
  collapsed: boolean
  pathname: string
  onOpenCategory: (id: AppSidebarSectionId) => void
}) {
  const { pins, pinnedRooms, pinnedServers, recentRoomItems, userServers } = useSidebarData()
  const { removeRoom, removeServer, toggleRoomPin, toggleServerPin } = useSidebarMutations()

  const [expandedCategories, setExpandedCategories] = useState<
    Partial<Record<AppSidebarSectionId, boolean>>
  >({})

  const renderRoomRow = (room: AppSidebarRoomItem, keyPrefix: string) => (
    <SidebarRoomListItem
      key={`${keyPrefix}-${room.code}`}
      glassId={`${keyPrefix}-${room.code}`}
      active={pathname === `/room/${room.code}`}
      pinned={isRoomPinned(pins, room.code)}
      room={room}
      onRemove={() => removeRoom(room)}
      onTogglePin={() => toggleRoomPin(room)}
    />
  )

  const renderServerRow = (server: AppSidebarServerItem, keyPrefix: string) => (
    <SidebarServerListItem
      key={`${keyPrefix}-${server.id}`}
      glassId={`${keyPrefix}-${server.id}`}
      active={pathname === `/servers/${server.id}`}
      pinned={pins.serverIds.includes(server.id)}
      server={server}
      onRemove={() => removeServer(server)}
      onTogglePin={() => toggleServerPin(server)}
    />
  )

  const categoryConfigs: Array<{
    emptyHint: string
    icon: LucideIcon
    id: AppSidebarSectionId
    label: string
  }> = [
    { id: 'recent', label: 'Recent', icon: History, emptyHint: 'Nothing recent yet.' },
    { id: 'pinned', label: 'Pinned', icon: Pin, emptyHint: 'Nothing pinned yet.' },
    { id: 'rooms', label: 'Rooms', icon: Radio, emptyHint: 'No rooms yet.' },
    { id: 'servers', label: 'Servers', icon: Server, emptyHint: 'No servers yet.' },
  ]

  const getRowsForCategory = (id: AppSidebarSectionId): Array<ReactNode> => {
    switch (id) {
      case 'recent':
        return [
          ...recentRoomItems
            .slice(0, MAX_RECENT_ITEMS)
            .map((room) => renderRoomRow(room, 'recent-room')),
          ...userServers
            .slice(0, MAX_RECENT_ITEMS)
            .map((server) => renderServerRow(server, 'recent-server')),
        ]
      case 'pinned':
        return [
          ...pinnedRooms.map((room) => renderRoomRow(room, 'pinned-room')),
          ...pinnedServers.map((server) => renderServerRow(server, 'pinned-server')),
        ]
      case 'rooms':
        return recentRoomItems.map((room) => renderRoomRow(room, 'room'))
      case 'servers':
        return userServers.map((server) => renderServerRow(server, 'server'))
      default:
        return []
    }
  }

  return (
    <>
      {categoryConfigs.map((category) => {
        const rows = getRowsForCategory(category.id)
        const count = rows.length
        const isExpanded = expandedCategories[category.id] ?? count > 0

        return (
          <SidebarCategoryBlock
            key={category.id}
            active={activeCategory === category.id}
            collapsed={collapsed}
            emptyHint={category.emptyHint}
            expanded={isExpanded}
            icon={category.icon}
            label={category.label}
            rows={rows}
            onOpen={() => onOpenCategory(category.id)}
            onToggleExpanded={() =>
              setExpandedCategories((state) => ({
                ...state,
                [category.id]: !(state[category.id] ?? count > 0),
              }))
            }
          />
        )
      })}
    </>
  )
}
