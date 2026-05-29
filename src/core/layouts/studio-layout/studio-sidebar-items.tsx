import {
  BarChart3,
  Home,
  MessageCircle,
  SlidersHorizontal,
  Video,
  type LucideIcon,
} from 'lucide-react'
import type { MobileSidebarDockItem } from '@/components/sidebar'

export type StudioSidebarRoute =
  | '/studio/home'
  | '/studio/channel-settings'
  | '/studio/analytics'
  | '/studio/content-manager'
  | '/studio/community'

export type StudioSidebarItem = {
  label: string
  shortLabel?: string
  to: StudioSidebarRoute
  icon: LucideIcon
  badge?: string
}

export const studioNavigationItems: ReadonlyArray<StudioSidebarItem> = [
  { label: 'Home', to: '/studio/home', icon: Home },
  {
    label: 'Channel Settings',
    shortLabel: 'Settings',
    to: '/studio/channel-settings',
    icon: SlidersHorizontal,
  },
  { label: 'Analytics', to: '/studio/analytics', icon: BarChart3 },
  {
    label: 'Content manager',
    shortLabel: 'Content',
    to: '/studio/content-manager',
    icon: Video,
    badge: '12',
  },
  { label: 'Community', shortLabel: 'Social', to: '/studio/community', icon: MessageCircle },
]

export function isStudioVideoEditRoute(pathname: string) {
  return /^\/studio\/video\/(?:edit\/[^/]+|[^/]+\/edit)\/?$/.test(pathname)
}

export function isStudioSidebarItemActive(pathname: string, to: StudioSidebarRoute) {
  if (to === '/studio/content-manager' && isStudioVideoEditRoute(pathname)) {
    return true
  }

  return pathname === to || pathname.startsWith(`${to}/`)
}

export function getStudioDockPathname(pathname: string) {
  return isStudioVideoEditRoute(pathname) ? '/studio/content-manager' : pathname
}

export function getStudioMobileDockItems(): Array<MobileSidebarDockItem> {
  return studioNavigationItems.map((item) => {
    const Icon = item.icon

    return {
      label: item.label,
      shortLabel: item.shortLabel,
      to: item.to,
      icon: <Icon />,
      badge: item.badge,
    }
  })
}
