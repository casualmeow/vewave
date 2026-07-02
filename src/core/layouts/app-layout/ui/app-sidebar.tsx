import { useQueryClient } from '@tanstack/react-query'
import { Link, useLocation } from '@tanstack/react-router'
import {
  ChevronDown,
  Compass,
  History,
  LifeBuoy,
  LogIn,
  LogOut,
  MoreHorizontal,
  Pin,
  PinOff,
  Plus,
  Radio,
  Server,
  Settings,
  Trash2,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { toast } from 'sonner'

import {
  appAdminItem,
  getAppMobileDockItems,
  getRoomIcon,
  type AppSidebarRoomItem,
} from '../app-sidebar-items'
import {
  togglePinnedRoom,
  togglePinnedServer,
  unpinRoom,
  unpinServer,
  useSidebarPins,
} from '../app-sidebar-pins'
import { AppSettingsDialog } from './app-settings-dialog'
import type { AppSidebarMode } from '../app-sidebar-mode'
import type { AppShellSurfaceRenderer } from './app-shell-surfaces'
import type { GetApiServers200ServersItem } from '@/core/api/generated/model'
import type { AuthStatus, AuthUser } from '@/modules/auth/model/types'
import {
  getGetApiServersCommunityQueryKey,
  getGetApiServersQueryKey,
  useDeleteApiServersByServerIdMembership,
  useGetApiServers,
} from '@/core/api/generated/servers/servers'
import {
  Sidebar,
  SidebarBrand,
  SidebarFooter,
  SidebarItem,
  SidebarItemIcon,
  SidebarItemLabel,
  SidebarSection,
} from '@/components/sidebar'
import { useAuthStore, useLogout } from '@/modules/auth'
import { CreateRoomForm } from '@/modules/watch-together/create-room'
import {
  forgetSavedRoom,
  useSavedRooms,
  type SavedRoomSummary,
} from '@/modules/watch-together/room'
import { CreateServerForm } from '@/modules/servers'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SpinIcon,
} from '@/shared/ui'
import { cn } from '@/shared/lib/utils'
import { VewaveLogoMark } from '@/shared/theme'

type AppSidebarServerItem = GetApiServers200ServersItem
type AppSidebarSectionId = 'pinned' | 'recent' | 'rooms' | 'servers'

const sidebarCategoryPreviewLimit = 3

const numberFormatter = new Intl.NumberFormat(undefined, { notation: 'compact' })

function getInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || 'Vewave User'
  const parts = source.split(/\s+/).filter(Boolean)

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }

  return source.slice(0, 2).toUpperCase()
}

function getSidebarRoomItem(room: SavedRoomSummary): AppSidebarRoomItem {
  const provider = room.provider ? `${room.provider} link` : 'Video link saved'
  const badge =
    room.status === 'active'
      ? 'Live'
      : room.role === 'owner' || room.role === 'host'
        ? 'Host'
        : undefined

  return {
    code: room.code,
    label: room.title,
    description: provider,
    accent: 'from-primary/45 via-accent/25 to-secondary',
    badge,
  }
}

function getServerAccent(visibility: string) {
  if (visibility === 'community') return 'from-primary/45 via-accent/25 to-secondary'
  if (visibility === 'invite') return 'from-accent/35 via-secondary to-muted'

  return 'from-muted via-secondary to-primary/20'
}

export function AppSidebar({
  className,
  mode = 'expanded',
  renderSurface,
}: {
  className?: string
  mode?: AppSidebarMode
  renderSurface?: AppShellSurfaceRenderer
}) {
  const location = useLocation()
  const queryClient = useQueryClient()
  const logout = useLogout()
  const status = useAuthStore((state) => state.status)
  const user = useAuthStore((state) => state.user)
  const userId = user?.id ?? null
  const initials = getInitials(user?.name, user?.email)
  const identitySubtitle = user?.username
    ? `@${user.username}`
    : user?.email
      ? `@${user.email.split('@')[0]}`
      : undefined
  const savedRooms = useSavedRooms(userId)
  const serversQuery = useGetApiServers({
    query: { enabled: status === 'authenticated' },
  })
  const deleteServerMutation = useDeleteApiServersByServerIdMembership()
  const userServers = serversQuery.data?.servers ?? []
  const pins = useSidebarPins(userId)
  const [activeCategory, setActiveCategory] = useState<AppSidebarSectionId | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<
    Partial<Record<AppSidebarSectionId, boolean>>
  >({})
  const [newMenuOpen, setNewMenuOpen] = useState(false)
  const collapsed = mode !== 'expanded'
  const recentRoomItems = useMemo(
    () => savedRooms.slice(0, 8).map(getSidebarRoomItem),
    [savedRooms],
  )
  const mobileDockItems = getAppMobileDockItems(recentRoomItems)
  const sessionMobileDockItems =
    status === 'authenticated'
      ? [
          ...mobileDockItems,
          {
            id: 'profile',
            label: 'Profile',
            to: '/profile' as const,
            icon: <UserRound />,
          },
        ]
      : status === 'anonymous'
        ? [
            ...mobileDockItems,
            {
              id: 'sign-in',
              label: 'Sign in',
              to: '/sign-in' as const,
              search: { redirectTo: undefined },
              icon: <LogIn />,
            },
          ]
        : mobileDockItems
  const roomsByCode = useMemo(
    () => new Map(recentRoomItems.map((room) => [room.code.toLowerCase(), room])),
    [recentRoomItems],
  )
  const serversById = useMemo(
    () => new Map(userServers.map((server) => [server.id, server])),
    [userServers],
  )
  const pinnedRooms = pins.roomCodes
    .map((code) => roomsByCode.get(code.toLowerCase()))
    .filter((room): room is AppSidebarRoomItem => Boolean(room))
  const pinnedServers = pins.serverIds
    .map((serverId) => serversById.get(serverId))
    .filter((server): server is AppSidebarServerItem => Boolean(server))
  const communityActive =
    location.pathname === '/community' || location.pathname.startsWith('/community/')
  const wrapSurface = (surface: Parameters<AppShellSurfaceRenderer>[0], children: ReactNode) =>
    renderSurface ? renderSurface(surface, children) : children
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

  const categorySheetContent: Record<
    AppSidebarSectionId,
    { body: ReactNode; description: string; title: string }
  > = {
    recent: {
      title: 'Recent',
      description: 'Rooms and servers you opened recently.',
      body: (
        <RecentSidebarContent
          rooms={recentRoomItems.slice(0, 8)}
          servers={userServers.slice(0, 8)}
          pins={pins}
          pathname={location.pathname}
          onRemoveRoom={removeRoom}
          onRemoveServer={removeServer}
          onToggleRoomPin={(room) => togglePinnedRoom(userId, room.code)}
          onToggleServerPin={(server) => togglePinnedServer(userId, server.id)}
        />
      ),
    },
    pinned: {
      title: 'Pinned',
      description: 'Quick access to the rooms and servers you pinned.',
      body: (
        <PinnedSidebarContent
          rooms={pinnedRooms}
          servers={pinnedServers}
          pins={pins}
          pathname={location.pathname}
          onRemoveRoom={removeRoom}
          onRemoveServer={removeServer}
          onToggleRoomPin={(room) => togglePinnedRoom(userId, room.code)}
          onToggleServerPin={(server) => togglePinnedServer(userId, server.id)}
        />
      ),
    },
    rooms: {
      title: 'Rooms',
      description: 'Every room you saved on this device.',
      body: (
        <RoomsSidebarContent
          rooms={recentRoomItems}
          pins={pins}
          pathname={location.pathname}
          onRemoveRoom={removeRoom}
          onToggleRoomPin={(room) => togglePinnedRoom(userId, room.code)}
        />
      ),
    },
    servers: {
      title: 'Servers',
      description: 'Servers you created or joined.',
      body: (
        <ServersSidebarContent
          servers={userServers}
          pins={pins}
          pathname={location.pathname}
          onRemoveServer={removeServer}
          onToggleServerPin={(server) => togglePinnedServer(userId, server.id)}
        />
      ),
    },
  }
  const activeCategoryContent = activeCategory ? categorySheetContent[activeCategory] : null

  const renderRoomRow = (room: AppSidebarRoomItem, keyPrefix: string) => (
    <SidebarRoomListItem
      key={`${keyPrefix}-${room.code}`}
      active={location.pathname === `/room/${room.code}`}
      pinned={isRoomPinned(pins, room.code)}
      room={room}
      onRemove={() => removeRoom(room)}
      onTogglePin={() => togglePinnedRoom(userId, room.code)}
    />
  )
  const renderServerRow = (server: AppSidebarServerItem, keyPrefix: string) => (
    <SidebarServerListItem
      key={`${keyPrefix}-${server.id}`}
      active={location.pathname === `/servers/${server.id}`}
      pinned={pins.serverIds.includes(server.id)}
      server={server}
      onRemove={() => removeServer(server)}
      onTogglePin={() => togglePinnedServer(userId, server.id)}
    />
  )
  const categoryRows: Record<AppSidebarSectionId, Array<ReactNode>> = {
    recent: [
      ...recentRoomItems.slice(0, 8).map((room) => renderRoomRow(room, 'recent-room')),
      ...userServers.slice(0, 8).map((server) => renderServerRow(server, 'recent-server')),
    ],
    pinned: [
      ...pinnedRooms.map((room) => renderRoomRow(room, 'pinned-room')),
      ...pinnedServers.map((server) => renderServerRow(server, 'pinned-server')),
    ],
    rooms: recentRoomItems.map((room) => renderRoomRow(room, 'room')),
    servers: userServers.map((server) => renderServerRow(server, 'server')),
  }
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

  const sidebarContent = (
    <>
      <div className="flex min-h-0 flex-1 flex-col">
        {wrapSurface(
          'sidebarIdentity',
          <AppSidebarIdentity
            status={status}
            user={user}
            initials={initials}
            subtitle={identitySubtitle}
          />,
        )}

        <div className="min-h-0 flex-1 overflow-y-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {wrapSurface(
            'sidebarWorkspace',
            <div className="grid gap-2">
              <SidebarSection title="Workspace">
                <NewSidebarMenu open={newMenuOpen} onOpenChange={setNewMenuOpen} />

                {categoryConfigs.map((category) => {
                  const count = categoryRows[category.id].length
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
                      rows={categoryRows[category.id]}
                      onOpen={() => setActiveCategory(category.id)}
                      onToggleExpanded={() =>
                        setExpandedCategories((state) => ({
                          ...state,
                          [category.id]: !(state[category.id] ?? count > 0),
                        }))
                      }
                    />
                  )
                })}

                <div className={cn(!collapsed && 'mt-1 border-t border-sidebar-border/60 pt-2')}>
                  <SidebarItem asChild active={communityActive} value="community">
                    <Link to="/community">
                      <SidebarItemIcon>
                        <Compass />
                      </SidebarItemIcon>
                      <SidebarItemLabel>Community</SidebarItemLabel>
                    </Link>
                  </SidebarItem>
                </div>
              </SidebarSection>

              {user?.isAdmin ? <AppSidebarAdminItem pathname={location.pathname} /> : null}
            </div>,
          )}
        </div>
      </div>

      {wrapSurface('sidebarFooter', <AppSidebarFooter status={status} onLogout={logout} />)}
    </>
  )

  const sidebarShell = (
    <Sidebar
      collapsed={collapsed}
      hidden={mode === 'hidden'}
      data-app-sidebar-mode={mode}
      mobileDockItems={sessionMobileDockItems}
      mobileDockPathname={location.pathname}
      mobileDockPlacement="container"
      mobileDockClassName="inset-x-3 z-50"
      mobileMaxItems={6}
      aria-label="App navigation"
      className={cn(
        'z-30 shrink-0 transition-[margin] duration-300 motion-reduce:transition-none',
        mode === 'hidden' ? '-ml-3 mr-0' : 'ml-0 mr-2',
        className,
      )}
    >
      {sidebarContent}
    </Sidebar>
  )

  return (
    <>
      {sidebarShell}

      <Sheet
        open={activeCategory !== null}
        onOpenChange={(open) => {
          if (!open) setActiveCategory(null)
        }}
      >
        <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
          {activeCategoryContent ? (
            <>
              <SheetHeader className="shrink-0 border-b border-border px-5 py-4 text-left">
                <SheetTitle>{activeCategoryContent.title}</SheetTitle>
                <SheetDescription>{activeCategoryContent.description}</SheetDescription>
              </SheetHeader>
              <div className="min-h-0 flex-1 overflow-y-auto p-3">
                <div className="grid gap-1">{activeCategoryContent.body}</div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  )
}

function AppSidebarAdminItem({ pathname }: { pathname: string }) {
  const AdminIcon = appAdminItem.icon
  const active = pathname === appAdminItem.to || pathname.startsWith('/admin/')

  return (
    <SidebarSection title="Admin">
      <SidebarItem asChild active={active} value={appAdminItem.to}>
        <Link to={appAdminItem.to}>
          <SidebarItemIcon>
            <AdminIcon />
          </SidebarItemIcon>
          <SidebarItemLabel>{appAdminItem.label}</SidebarItemLabel>
        </Link>
      </SidebarItem>
    </SidebarSection>
  )
}

type NewSidebarDialogKind = 'room' | 'server'

function NewSidebarMenu({
  onOpenChange,
  open,
}: {
  onOpenChange: (open: boolean) => void
  open: boolean
}) {
  const [dialogKind, setDialogKind] = useState<NewSidebarDialogKind | null>(null)

  function chooseKind(kind: NewSidebarDialogKind) {
    setDialogKind(kind)
  }

  return (
    <>
      <DropdownMenu open={open} onOpenChange={onOpenChange}>
        <DropdownMenuTrigger asChild>
          <SidebarItem type="button" icon={<Plus />} value="new" aria-expanded={open}>
            New
          </SidebarItem>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          side="right"
          sideOffset={12}
          className="w-44 rounded-xl border-sidebar-border bg-popover p-1.5 shadow-lg"
        >
          <DropdownMenuItem
            onSelect={() => chooseKind('room')}
            className="gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium"
          >
            <Radio className="size-4 text-muted-foreground" aria-hidden />
            Room
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => chooseKind('server')}
            className="gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium"
          >
            <Server className="size-4 text-muted-foreground" aria-hidden />
            Server
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={dialogKind !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setDialogKind(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          {dialogKind === 'room' ? (
            <>
              <DialogHeader>
                <DialogTitle>New room</DialogTitle>
                <DialogDescription>Add a room name and video link, then open it.</DialogDescription>
              </DialogHeader>
              <CreateRoomForm variant="plain" onCreated={() => setDialogKind(null)} />
            </>
          ) : dialogKind === 'server' ? (
            <>
              <DialogHeader>
                <DialogTitle>New server</DialogTitle>
                <DialogDescription>Create a workspace for rooms on the backend.</DialogDescription>
              </DialogHeader>
              <CreateServerForm variant="plain" onCreated={() => setDialogKind(null)} />
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}

function SidebarCategoryBlock({
  active,
  collapsed,
  emptyHint,
  expanded,
  icon: Icon,
  label,
  onOpen,
  onToggleExpanded,
  rows,
}: {
  active: boolean
  collapsed: boolean
  emptyHint: string
  expanded: boolean
  icon: LucideIcon
  label: string
  onOpen: () => void
  onToggleExpanded: () => void
  rows: Array<ReactNode>
}) {
  const count = rows.length

  if (collapsed) {
    return (
      <SidebarItem
        type="button"
        icon={<Icon />}
        value={label.toLowerCase()}
        active={active}
        disabled={count === 0}
        title={count === 0 ? `${label} — ${emptyHint}` : label}
        onClick={onOpen}
      >
        {label}
      </SidebarItem>
    )
  }

  const headerClassName = 'flex w-full items-center justify-between gap-2 px-2 py-1'

  return (
    <div className="mt-1 grid gap-0.5 border-t border-sidebar-border/60 pt-2.5">
      <div className={headerClassName}>
        <button
          type="button"
          className={cn(
            'flex-1 text-left text-[0.68rem] font-semibold uppercase tracking-[0.16em] rounded outline-none transition-colors focus-visible:ring-2 focus-visible:ring-sidebar-ring/50',
            active
              ? 'text-sidebar-foreground'
              : 'text-sidebar-foreground/60 hover:text-sidebar-foreground',
          )}
          onClick={onOpen}
        >
          {label}
        </button>

        <button
          type="button"
          className="rounded p-0.5 text-sidebar-foreground/45 outline-none transition-colors hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring/50"
          aria-label={`Toggle ${label} list`}
          aria-expanded={expanded}
          onClick={onToggleExpanded}
        >
          <ChevronDown
            className={cn('size-3.5 transition-transform duration-200', expanded && 'rotate-180')}
            aria-hidden
          />
        </button>
      </div>

      {expanded ? (
        count === 0 ? (
          <p className="px-2 text-xs leading-5 text-sidebar-foreground/50">{emptyHint}</p>
        ) : (
          <>
            {rows.slice(0, sidebarCategoryPreviewLimit)}
            {count > sidebarCategoryPreviewLimit ? (
              <button
                type="button"
                className="flex w-full items-center rounded-md px-2 py-1 text-left text-xs font-medium text-sidebar-foreground/55 outline-none transition-colors hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring/50"
                onClick={onOpen}
              >
                Show {count - sidebarCategoryPreviewLimit} more
              </button>
            ) : null}
          </>
        )
      ) : null}
    </div>
  )
}

function SidebarRoomListItem({
  active,
  onRemove,
  onTogglePin,
  pinned,
  room,
}: {
  active: boolean
  onRemove: () => void
  onTogglePin: () => void
  pinned: boolean
  room: AppSidebarRoomItem
}) {
  const Icon = getRoomIcon(room)

  return (
    <div className="group/resource-row relative">
      <Link
        to="/room/$code"
        params={{ code: room.code }}
        aria-current={active ? 'page' : undefined}
        className={sidebarInlineRowClassName(active)}
      >
        <Icon className="size-4 shrink-0 text-sidebar-foreground/55" aria-hidden />
        <span className="min-w-0 flex-1 truncate">{room.label}</span>
      </Link>
      <ResourceActionMenu
        label={room.label}
        pinned={pinned}
        onRemove={onRemove}
        onTogglePin={onTogglePin}
      />
    </div>
  )
}

function SidebarServerListItem({
  active,
  onRemove,
  onTogglePin,
  pinned,
  server,
}: {
  active: boolean
  onRemove: () => void
  onTogglePin: () => void
  pinned: boolean
  server: AppSidebarServerItem
}) {
  return (
    <div className="group/resource-row relative">
      <Link
        to="/servers/$serverId"
        params={{ serverId: server.id }}
        aria-current={active ? 'page' : undefined}
        className={sidebarInlineRowClassName(active)}
      >
        <Server className="size-4 shrink-0 text-sidebar-foreground/55" aria-hidden />
        <span className="min-w-0 flex-1 truncate">{server.name}</span>
      </Link>
      <ResourceActionMenu
        label={server.name}
        pinned={pinned}
        onRemove={onRemove}
        onTogglePin={onTogglePin}
      />
    </div>
  )
}

function sidebarInlineRowClassName(active: boolean) {
  return cn(
    'relative flex min-h-8 items-center gap-2 rounded-md px-2 py-1.5 pr-8 text-sm outline-none transition-[background-color,color] focus-visible:ring-2 focus-visible:ring-sidebar-ring/50',
    active
      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
      : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
  )
}

function RecentSidebarContent({
  onRemoveRoom,
  onRemoveServer,
  onToggleRoomPin,
  onToggleServerPin,
  pathname,
  pins,
  rooms,
  servers,
}: {
  onRemoveRoom: (room: AppSidebarRoomItem) => void
  onRemoveServer: (server: AppSidebarServerItem) => void
  onToggleRoomPin: (room: AppSidebarRoomItem) => void
  onToggleServerPin: (server: AppSidebarServerItem) => void
  pathname: string
  pins: ReturnType<typeof useSidebarPins>
  rooms: Array<AppSidebarRoomItem>
  servers: Array<AppSidebarServerItem>
}) {
  if (rooms.length === 0 && servers.length === 0) {
    return (
      <SidebarEmptyState
        icon={History}
        title="Nothing recent yet"
        description="Rooms and servers you open will show up here."
      />
    )
  }

  return (
    <>
      {rooms.map((room) => (
        <RoomResourceRow
          key={`recent-room-${room.code}`}
          active={pathname === `/room/${room.code}`}
          pinned={isRoomPinned(pins, room.code)}
          room={room}
          onRemove={() => onRemoveRoom(room)}
          onTogglePin={() => onToggleRoomPin(room)}
        />
      ))}
      {servers.map((server) => (
        <ServerResourceRow
          key={`recent-server-${server.id}`}
          active={pathname === `/servers/${server.id}`}
          pinned={pins.serverIds.includes(server.id)}
          server={server}
          onRemove={() => onRemoveServer(server)}
          onTogglePin={() => onToggleServerPin(server)}
        />
      ))}
    </>
  )
}

function PinnedSidebarContent({
  onRemoveRoom,
  onRemoveServer,
  onToggleRoomPin,
  onToggleServerPin,
  pathname,
  pins,
  rooms,
  servers,
}: {
  onRemoveRoom: (room: AppSidebarRoomItem) => void
  onRemoveServer: (server: AppSidebarServerItem) => void
  onToggleRoomPin: (room: AppSidebarRoomItem) => void
  onToggleServerPin: (server: AppSidebarServerItem) => void
  pathname: string
  pins: ReturnType<typeof useSidebarPins>
  rooms: Array<AppSidebarRoomItem>
  servers: Array<AppSidebarServerItem>
}) {
  if (rooms.length === 0 && servers.length === 0) {
    return (
      <SidebarEmptyState
        icon={Pin}
        title="Nothing pinned yet"
        description="Pin a room or server from its ⋯ menu to keep it here."
      />
    )
  }

  return (
    <>
      {rooms.map((room) => (
        <RoomResourceRow
          key={`pinned-room-${room.code}`}
          active={pathname === `/room/${room.code}`}
          pinned={isRoomPinned(pins, room.code)}
          room={room}
          onRemove={() => onRemoveRoom(room)}
          onTogglePin={() => onToggleRoomPin(room)}
        />
      ))}
      {servers.map((server) => (
        <ServerResourceRow
          key={`pinned-server-${server.id}`}
          active={pathname === `/servers/${server.id}`}
          pinned={pins.serverIds.includes(server.id)}
          server={server}
          onRemove={() => onRemoveServer(server)}
          onTogglePin={() => onToggleServerPin(server)}
        />
      ))}
    </>
  )
}

function RoomsSidebarContent({
  onRemoveRoom,
  onToggleRoomPin,
  pathname,
  pins,
  rooms,
}: {
  onRemoveRoom: (room: AppSidebarRoomItem) => void
  onToggleRoomPin: (room: AppSidebarRoomItem) => void
  pathname: string
  pins: ReturnType<typeof useSidebarPins>
  rooms: Array<AppSidebarRoomItem>
}) {
  return (
    <>
      <PanelRouteLink
        active={pathname === '/projects'}
        icon={Radio}
        label="Rooms dashboard"
        meta="All saved rooms"
        to="/projects"
      />
      {rooms.length > 0 ? (
        rooms.map((room) => (
          <RoomResourceRow
            key={`room-${room.code}`}
            active={pathname === `/room/${room.code}`}
            pinned={isRoomPinned(pins, room.code)}
            room={room}
            onRemove={() => onRemoveRoom(room)}
            onTogglePin={() => onToggleRoomPin(room)}
          />
        ))
      ) : (
        <SidebarEmptyState
          icon={Radio}
          title="No rooms yet"
          description="Start one from New and it will appear here."
        />
      )}
    </>
  )
}

function ServersSidebarContent({
  onRemoveServer,
  onToggleServerPin,
  pathname,
  pins,
  servers,
}: {
  onRemoveServer: (server: AppSidebarServerItem) => void
  onToggleServerPin: (server: AppSidebarServerItem) => void
  pathname: string
  pins: ReturnType<typeof useSidebarPins>
  servers: Array<AppSidebarServerItem>
}) {
  if (servers.length === 0) {
    return (
      <SidebarEmptyState
        icon={Server}
        title="No servers yet"
        description="Create a server from New or join one from Community."
      />
    )
  }

  return (
    <>
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
  )
}

function RoomResourceRow({
  active,
  onRemove,
  onTogglePin,
  pinned,
  room,
}: {
  active: boolean
  onRemove: () => void
  onTogglePin: () => void
  pinned: boolean
  room: AppSidebarRoomItem
}) {
  const Icon = getRoomIcon(room)

  return (
    <div className="group/resource-row relative">
      <Link
        to="/room/$code"
        params={{ code: room.code }}
        aria-current={active ? 'page' : undefined}
        className={resourceRowClassName(active)}
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-md bg-muted text-foreground">
          <Icon className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{room.label}</span>
          <span className="block truncate text-xs text-muted-foreground">{room.description}</span>
        </span>
      </Link>
      <ResourceActionMenu
        label={room.label}
        pinned={pinned}
        onRemove={onRemove}
        onTogglePin={onTogglePin}
      />
    </div>
  )
}

function ServerResourceRow({
  active,
  onRemove,
  onTogglePin,
  pinned,
  server,
}: {
  active: boolean
  onRemove: () => void
  onTogglePin: () => void
  pinned: boolean
  server: AppSidebarServerItem
}) {
  return (
    <div className="group/resource-row relative">
      <Link
        to="/servers/$serverId"
        params={{ serverId: server.id }}
        aria-current={active ? 'page' : undefined}
        className={resourceRowClassName(active)}
      >
        <span
          className={`grid size-8 shrink-0 place-items-center rounded-md bg-gradient-to-br ${getServerAccent(server.visibility)} text-foreground`}
        >
          <Server className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{server.name}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {numberFormatter.format(server.memberCount)} members · {server.roomCount} rooms
          </span>
        </span>
      </Link>
      <ResourceActionMenu
        label={server.name}
        pinned={pinned}
        onRemove={onRemove}
        onTogglePin={onTogglePin}
      />
    </div>
  )
}

function PanelRouteLink({
  active,
  icon: Icon,
  label,
  meta,
  to,
}: {
  active: boolean
  icon: LucideIcon
  label: string
  meta: string
  to: '/projects'
}) {
  return (
    <Link
      to={to}
      aria-current={active ? 'page' : undefined}
      className={resourceRowClassName(active, false)}
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-md bg-muted text-foreground">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{label}</span>
        <span className="block truncate text-xs text-muted-foreground">{meta}</span>
      </span>
    </Link>
  )
}

function ResourceActionMenu({
  label,
  onRemove,
  onTogglePin,
  pinned,
}: {
  label: string
  onRemove: () => void
  onTogglePin: () => void
  pinned: boolean
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="absolute right-1 top-1/2 z-20 grid size-6 -translate-y-1/2 place-items-center rounded-md text-muted-foreground opacity-0 outline-none transition-[background-color,color,opacity] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/50 group-hover/resource-row:opacity-100"
          aria-label={`Controls for ${label}`}
        >
          <MoreHorizontal className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6} className="min-w-44">
        <DropdownMenuItem onSelect={onTogglePin}>
          {pinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
          {pinned ? 'Unpin' : 'Pin'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={onRemove}>
          <Trash2 className="size-4" />
          Remove
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function SidebarEmptyState({
  description,
  icon: Icon,
  title,
}: {
  description: string
  icon: LucideIcon
  title: string
}) {
  return (
    <div className="grid justify-items-center gap-2 rounded-lg border border-dashed border-border px-4 py-8 text-center">
      <span className="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </span>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="max-w-56 text-xs leading-5 text-muted-foreground">{description}</p>
    </div>
  )
}

function resourceRowClassName(active: boolean, withAction = true) {
  return cn(
    'relative flex min-h-11 items-center gap-2 rounded-lg px-2 py-2 text-sm outline-none transition-[background-color,color,box-shadow] focus-visible:ring-2 focus-visible:ring-ring/50',
    withAction && 'pr-9',
    active
      ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
      : 'text-sidebar-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground',
  )
}

function isRoomPinned(pins: ReturnType<typeof useSidebarPins>, roomCode: string) {
  const normalizedCode = roomCode.toLowerCase()

  return pins.roomCodes.some((code) => code.toLowerCase() === normalizedCode)
}

function AppSidebarIdentity({
  initials,
  status,
  user,
  subtitle,
}: {
  initials: string
  status: AuthStatus
  subtitle?: string
  user: AuthUser | null
}) {
  const checkingSession = status === 'idle' || status === 'bootstrapping'

  if (checkingSession) {
    return (
      <SidebarBrand
        visual={
          <div className="grid size-14 place-items-center rounded-full border border-[color:var(--glass-border)] bg-[var(--glass-background)] shadow-sm backdrop-blur-xl">
            <SpinIcon size="md" speed="normal" label="Checking session" />
          </div>
        }
        title="Checking session"
        subtitle="Restoring rooms"
        meta={
          <span
            className="h-8 w-16 animate-pulse rounded-full bg-muted-foreground/20"
            aria-hidden
          />
        }
      />
    )
  }

  if (!user) {
    return (
      <SidebarBrand
        visual={<VewaveLogoMark className="size-14 text-lg" surfaceToken="sidebar" />}
        title="Guest mode"
        subtitle="Local rooms only"
        meta={
          <Link
            to="/sign-in"
            search={{ redirectTo: undefined }}
            className="inline-flex size-8 items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground/75 shadow-sm transition hover:text-sidebar-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45"
            aria-label="Sign in"
            title="Sign in"
          >
            <LogIn className="size-4" />
          </Link>
        }
      />
    )
  }

  return (
    <SidebarBrand
      visual={
        <Link
          to="/profile"
          aria-label="Open profile"
          className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/45"
        >
          <Avatar className="size-14 border border-[color:var(--glass-border)] shadow-sm">
            <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name ?? 'User avatar'} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Link>
      }
      title={
        <Link to="/profile" className="outline-none hover:text-primary focus-visible:underline">
          {user.name ?? 'Profile'}
        </Link>
      }
      subtitle={subtitle ?? user.email}
    />
  )
}

function AppSidebarFooter({
  onLogout,
  status,
}: {
  onLogout: () => Promise<void>
  status: AuthStatus
}) {
  const checkingSession = status === 'idle' || status === 'bootstrapping'
  const authenticated = status === 'authenticated'

  return (
    <SidebarFooter>
      <Dialog>
        <DialogTrigger asChild>
          <SidebarItem type="button" icon={<Settings />} value="settings">
            Settings
          </SidebarItem>
        </DialogTrigger>
        <AppSettingsDialog />
      </Dialog>

      <SidebarItem type="button" icon={<LifeBuoy />} value="support">
        Support
      </SidebarItem>

      {checkingSession || authenticated ? <Separator className="my-1 bg-sidebar-border" /> : null}

      {checkingSession ? (
        <SidebarItem type="button" icon={<SpinIcon size="sm" />} value="session-check" disabled>
          Checking session
        </SidebarItem>
      ) : authenticated ? (
        <SidebarItem
          type="button"
          icon={<LogOut />}
          value="sign-out"
          onClick={() => void onLogout()}
        >
          Sign out
        </SidebarItem>
      ) : null}
    </SidebarFooter>
  )
}
