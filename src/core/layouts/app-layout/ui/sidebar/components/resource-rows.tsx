import { Link } from '@tanstack/react-router'
import { MoreHorizontal, Pin, PinOff, Server, Trash2, type LucideIcon } from 'lucide-react'
import { getRoomIcon, type AppSidebarRoomItem } from '../../../app-sidebar-items'
import type { GetApiServers200ServersItem } from '@/core/api/generated/model'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui'
import { cn } from '@/shared/lib/utils'

export type AppSidebarServerItem = GetApiServers200ServersItem

const numberFormatter = new Intl.NumberFormat(undefined, { notation: 'compact' })

export function getServerAccent(visibility: string) {
  if (visibility === 'community') return 'from-primary/45 via-accent/25 to-secondary'
  if (visibility === 'invite') return 'from-accent/35 via-secondary to-muted'

  return 'from-muted via-secondary to-primary/20'
}

export function resourceRowClassName(active: boolean, withAction = true) {
  return cn(
    'relative flex min-h-11 items-center gap-2 rounded-lg px-2 py-2 text-sm outline-none transition-[background-color,color,box-shadow] focus-visible:ring-2 focus-visible:ring-ring/50',
    withAction && 'pr-9',
    active
      ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
      : 'text-sidebar-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground',
  )
}

export function sidebarInlineRowClassName(active: boolean) {
  return cn(
    'relative flex min-h-8 items-center gap-2 rounded-md px-2 py-1.5 pr-8 text-sm outline-none transition-[background-color,color] focus-visible:ring-2 focus-visible:ring-sidebar-ring/50',
    active
      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
      : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
  )
}

export function ResourceActionMenu({
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

export function RoomResourceRow({
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

export function ServerResourceRow({
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

export function PanelRouteLink({
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

export function SidebarRoomListItem({
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

export function SidebarServerListItem({
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
