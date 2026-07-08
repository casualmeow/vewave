import type { SavedRoomSummary } from '@/modules/watch-together/room'
import type { AppSidebarRoomItem } from '../../app-sidebar-items'

export function getInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || 'Vewave User'
  const parts = source.split(/\s+/).filter(Boolean)

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }

  return source.slice(0, 2).toUpperCase()
}

export function getSidebarRoomItem(room: SavedRoomSummary): AppSidebarRoomItem {
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
