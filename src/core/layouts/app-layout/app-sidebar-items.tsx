import {
  Compass,
  History,
  Radio,
  ShieldCheck,
  Sparkles,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'
import type { MobileSidebarDockItem } from '@/components/sidebar'

export type AppSidebarRoute =
  | '/projects'
  | '/servers/discover'
  | '/admin'
  | '/room/$code'
  | '/servers/$serverId'

export type AppSidebarItem = {
  label: string
  shortLabel?: string
  to: AppSidebarRoute
  params?: { code: string } | { serverId: string }
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

export const appPrimaryItems: ReadonlyArray<AppSidebarItem> = [
  { label: 'Rooms', to: '/projects', icon: Radio },
  { label: 'Community', to: '/servers/discover', icon: Compass },
]

export const appAdminItem: AppSidebarItem = {
  label: 'Admin',
  to: '/admin',
  icon: ShieldCheck,
}

export function isAppPrimaryItemActive(pathname: string, item: AppSidebarItem) {
  if (item.to === '/room/$code') return pathname.startsWith('/room/')
  if (item.to === '/servers/$serverId') return pathname.startsWith('/servers/')
  if (item.to === '/projects') return pathname === item.to || pathname.startsWith('/room/')

  return pathname === item.to || pathname.startsWith(`${item.to}/`)
}

export function isRoomActive(pathname: string, code: string) {
  return pathname === `/room/${code}`
}

export function getAppMobileDockItems(
  rooms: ReadonlyArray<AppSidebarRoomItem> = [],
): Array<MobileSidebarDockItem> {
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

  const roomItems = rooms.slice(0, 3).map((room) => ({
    id: `room-${room.code}`,
    label: room.label,
    shortLabel: room.label,
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
