import {
  Activity,
  FolderKanban,
  History,
  PlusCircle,
  Radio,
  Sparkles,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'
import type { MobileSidebarDockItem } from '@/components/sidebar'

export type AppSidebarRoute = '/projects' | '/create' | '/healthcheck' | '/room/$code'

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

export const appRecentRooms: ReadonlyArray<AppSidebarRoomItem> = [
  {
    code: 'DEMO42',
    label: 'Friday watch room',
    description: 'Joined 12 min ago',
    accent: 'bg-teal-400',
    badge: 'Live',
  },
  {
    code: 'SYNC7',
    label: 'Design review',
    description: 'Last opened yesterday',
    accent: 'bg-sky-400',
  },
  {
    code: 'LOFI9',
    label: 'Lofi cinema',
    description: 'Shared playlist',
    accent: 'bg-emerald-400',
  },
]

export const appPinnedRooms: ReadonlyArray<AppSidebarRoomItem> = [
  {
    code: 'TEAM1',
    label: 'Team premiere',
    description: 'Pinned room',
    accent: 'bg-cyan-400',
    badge: 'Host',
  },
  {
    code: 'QA234',
    label: 'QA screening',
    description: 'Private test room',
    accent: 'bg-indigo-400',
  },
  {
    code: 'OPEN8',
    label: 'Open lounge',
    description: 'Public room',
    accent: 'bg-lime-400',
  },
]

export const appServers: ReadonlyArray<AppSidebarServerItem> = [
  {
    id: 'edge-sync',
    label: 'Edge sync',
    description: 'Nearest playback relay',
    accent: 'bg-teal-400',
    status: 'Live',
  },
  {
    id: 'media-parser',
    label: 'Media parser',
    description: 'URL metadata service',
    accent: 'bg-sky-400',
    status: 'Idle',
  },
  {
    id: 'presence-hub',
    label: 'Presence hub',
    description: 'Room member events',
    accent: 'bg-amber-400',
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
