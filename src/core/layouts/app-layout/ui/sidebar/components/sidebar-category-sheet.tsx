import { History, Pin, Radio, Server } from 'lucide-react'
import { MAX_RECENT_ITEMS } from '../constants'
import { useSidebarData, useSidebarMutations } from '../hooks'
import { SidebarResourceList } from './sidebar-resource-list'
import type { AppSidebarSectionId } from '../types'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/shared/ui'

export function SidebarCategorySheet({
  activeCategory,
  onClose,
  pathname,
}: {
  activeCategory: AppSidebarSectionId | null
  onClose: () => void
  pathname: string
}) {
  const { pins, pinnedRooms, pinnedServers, recentRoomItems, userServers } = useSidebarData()
  const { removeRoom, removeServer, toggleRoomPin, toggleServerPin } = useSidebarMutations()

  const content = (() => {
    switch (activeCategory) {
      case 'recent':
        return {
          title: 'Recent',
          description: 'Rooms and servers you opened recently.',
          body: (
            <SidebarResourceList
              emptyTitle="Nothing recent yet"
              emptyDescription="Rooms and servers you open will show up here."
              emptyIcon={History}
              rooms={recentRoomItems.slice(0, MAX_RECENT_ITEMS)}
              servers={userServers.slice(0, MAX_RECENT_ITEMS)}
              pins={pins}
              pathname={pathname}
              onRemoveRoom={removeRoom}
              onRemoveServer={removeServer}
              onToggleRoomPin={toggleRoomPin}
              onToggleServerPin={toggleServerPin}
            />
          ),
        }
      case 'pinned':
        return {
          title: 'Pinned',
          description: 'Quick access to the rooms and servers you pinned.',
          body: (
            <SidebarResourceList
              emptyTitle="Nothing pinned yet"
              emptyDescription="Pin a room or server from its ⋯ menu to keep it here."
              emptyIcon={Pin}
              rooms={pinnedRooms}
              servers={pinnedServers}
              pins={pins}
              pathname={pathname}
              onRemoveRoom={removeRoom}
              onRemoveServer={removeServer}
              onToggleRoomPin={toggleRoomPin}
              onToggleServerPin={toggleServerPin}
            />
          ),
        }
      case 'rooms':
        return {
          title: 'Rooms',
          description: 'Every room you saved on this device.',
          body: (
            <SidebarResourceList
              emptyTitle="No rooms yet"
              emptyDescription="Start one from New and it will appear here."
              emptyIcon={Radio}
              rooms={recentRoomItems}
              pins={pins}
              pathname={pathname}
              onRemoveRoom={removeRoom}
              onRemoveServer={removeServer}
              onToggleRoomPin={toggleRoomPin}
              onToggleServerPin={toggleServerPin}
              showRoomsDashboardLink
            />
          ),
        }
      case 'servers':
        return {
          title: 'Servers',
          description: 'Servers you created or joined.',
          body: (
            <SidebarResourceList
              emptyTitle="No servers yet"
              emptyDescription="Create a server from New or join one from Community."
              emptyIcon={Server}
              servers={userServers}
              pins={pins}
              pathname={pathname}
              onRemoveRoom={removeRoom}
              onRemoveServer={removeServer}
              onToggleRoomPin={toggleRoomPin}
              onToggleServerPin={toggleServerPin}
            />
          ),
        }
      default:
        return null
    }
  })()

  return (
    <Sheet
      open={activeCategory !== null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        {content ? (
          <>
            <SheetHeader className="shrink-0 border-b border-border px-5 py-4 text-left">
              <SheetTitle>{content.title}</SheetTitle>
              <SheetDescription>{content.description}</SheetDescription>
            </SheetHeader>
            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              <div className="grid gap-1">{content.body}</div>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
