import {
  Activity,
  FolderKanban,
  History,
  PlusCircle,
  Radio,
  ShieldCheck,
  Sparkles,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'
import type { MobileSidebarDockItem } from '@/components/sidebar'

export type AppSidebarRoute = '/projects' | '/create' | '/healthcheck' | '/admin' | '/room/$code'

export type AppSidebarItem = {
  label: string
  shortLabel?: string
  to: AppSidebarRoute
  params?: { code: string }
  icon: LucideIcon
  badge?: string
}

export type AppSidebarRoomItem = {
  code: string
  label: string
  description: string
  accent: string
  badge?: string
}

export type AppSidebarServerItem = {
  id: string
  label: string
  description: string
  accent: string
  status: 'Live' | 'Idle' | 'Beta'
}

export const appPrimaryItems: ReadonlyArray<AppSidebarItem> = [
  { label: 'Projects', to: '/projects', icon: FolderKanban },
  { label: 'New project', shortLabel: 'Create', to: '/create', icon: PlusCircle, badge: 'New' },
  { label: 'Healthcheck', shortLabel: 'Health', to: '/healthcheck', icon: Activity },
]

export const appAdminItem: AppSidebarItem = {
  label: 'Admin',
  to: '/admin',
  icon: ShieldCheck,
}

export const appRecentRooms: ReadonlyArray<AppSidebarRoomItem> = [
  {
    code: 'DEMO42',
    label: 'Friday watch room',
    description: 'Joined 12 min ago',
    accent: 'bg-primary',
    badge: 'Live',
  },
  {
    code: 'SYNC7',
    label: 'Design review',
    description: 'Last opened yesterday',
    accent: 'bg-accent',
  },
  {
    code: 'LOFI9',
    label: 'Lofi cinema',
    description: 'Shared playlist',
    accent: 'bg-secondary-foreground',
  },
]

export const appPinnedRooms: ReadonlyArray<AppSidebarRoomItem> = [
  {
    code: 'TEAM1',
    label: 'Team premiere',
    description: 'Pinned room',
    accent: 'bg-primary',
    badge: 'Host',
  },
  {
    code: 'QA234',
    label: 'QA screening',
    description: 'Private test room',
    accent: 'bg-accent',
  },
  {
    code: 'OPEN8',
    label: 'Open lounge',
    description: 'Public room',
    accent: 'bg-muted-foreground',
  },
]

export const appServers: ReadonlyArray<AppSidebarServerItem> = [
  {
    id: 'edge-sync',
    label: 'Edge sync',
    description: 'Nearest playback relay',
    accent: 'bg-primary',
    status: 'Live',
  },
  {
    id: 'media-parser',
    label: 'Media parser',
    description: 'URL metadata service',
    accent: 'bg-accent',
    status: 'Idle',
  },
  {
    id: 'presence-hub',
    label: 'Presence hub',
    description: 'Room member events',
    accent: 'bg-muted-foreground',
    status: 'Beta',
  },
]

export function isAppPrimaryItemActive(pathname: string, item: AppSidebarItem) {
  if (item.to === '/room/$code') return pathname.startsWith('/room/')

  return pathname === item.to || pathname.startsWith(`${item.to}/`)
}

export function isRoomActive(pathname: string, code: string) {
  return pathname === `/room/${code}`
}

export function getAppMobileDockItems(): Array<MobileSidebarDockItem> {
  const primaryItems = appPrimaryItems.map((item) => {
    const Icon = item.icon

    return {
      id: item.to,
      label: item.label,
      shortLabel: item.shortLabel,
      to: item.to,
      params: item.params,
      icon: <Icon />,
      badge: item.badge,
    }
  })

  const roomItems = appRecentRooms.slice(0, 3).map((room) => ({
    id: `room-${room.code}`,
    label: room.label,
    shortLabel: room.code,
    to: '/room/$code' as const,
    params: { code: room.code },
    icon: <UsersRound />,
    badge: room.badge,
  }))

  return [...primaryItems, ...roomItems]
}

export function getRoomIcon(room: AppSidebarRoomItem) {
  return room.badge === 'Live' ? Radio : room.badge === 'Host' ? Sparkles : History
}

export const roomsCollapseValue = 'rooms'
export const serversCollapseValue = 'servers'
