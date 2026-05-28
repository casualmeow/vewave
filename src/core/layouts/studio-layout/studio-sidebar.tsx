import { Link, useLocation } from '@tanstack/react-router'
import {
  BarChart3,
  Clapperboard,
  Home,
  MessageCircle,
  MessageSquarePlus,
  Settings,
  SlidersHorizontal,
  Video,
} from 'lucide-react'

import { StudioSettingsDialog } from './studio-settings-dialog'
import type { LucideIcon } from 'lucide-react'
import type { MobileSidebarDockItem } from '@/components/sidebar'
import {
  Sidebar,
  SidebarBrand,
  SidebarFooter,
  SidebarItem,
  SidebarItemIcon,
  SidebarItemLabel,
  SidebarSection,
} from '@/components/sidebar'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/shared/ui'
import { cn } from '@/shared/lib/utils'

type StudioSidebarItem = {
  label: string
  shortLabel?: string
  to:
    | '/studio/home'
    | '/studio/channel-settings'
    | '/studio/analytics'
    | '/studio/content-manager'
    | '/studio/community'
  icon: LucideIcon
  badge?: string
}

const studioNavigationItems: ReadonlyArray<StudioSidebarItem> = [
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

function isVideoEditRoute(pathname: string) {
  return /^\/studio\/video\/(?:edit\/[^/]+|[^/]+\/edit)\/?$/.test(pathname)
}

function isActiveRoute(pathname: string, to: StudioSidebarItem['to']) {
  if (to === '/studio/content-manager' && isVideoEditRoute(pathname)) {
    return true
  }

  return pathname === to || pathname.startsWith(`${to}/`)
}

function getDockPathname(pathname: string) {
  return isVideoEditRoute(pathname) ? '/studio/content-manager' : pathname
}

export function StudioSidebar({ className }: { className?: string }) {
  const location = useLocation()
  const dockPathname = getDockPathname(location.pathname)
  const mobileDockItems: Array<MobileSidebarDockItem> = studioNavigationItems.map((item) => {
    const Icon = item.icon

    return {
      label: item.label,
      shortLabel: item.shortLabel,
      to: item.to,
      icon: <Icon />,
      badge: item.badge,
    }
  })

  return (
    <Sidebar
      design="liquidGlass"
      size="md"
      density="comfortable"
      motion="fluid"
      mobileMode="auto"
      mobileDockItems={mobileDockItems}
      mobileDockPathname={dockPathname}
      mobileDockPlacement="app"
      mobileDockClassName="inset-x-3 z-50"
      aria-label="Studio navigation"
      className={cn('z-30 mr-2 shrink-0', className)}
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <SidebarBrand
          visual={
            <Avatar className="size-14 border border-white/55 shadow-sm">
              <AvatarImage src="https://github.com/shadcn.png" alt="Studio channel avatar" />
              <AvatarFallback>VC</AvatarFallback>
            </Avatar>
          }
          title="Your channel"
          subtitle="Channel name"
          meta={
            <span className="inline-flex items-center gap-1 rounded-full bg-white/65 px-2 py-0.5 text-[0.68rem] font-medium text-zinc-600 shadow-sm">
              <Clapperboard className="size-3" />
              Creator studio
            </span>
          }
        />

        <SidebarSection title="Studio">
          {studioNavigationItems.map((item) => {
            const Icon = item.icon
            const active = isActiveRoute(location.pathname, item.to)

            return (
              <SidebarItem key={item.to} asChild active={active} value={item.to} badge={item.badge}>
                <Link to={item.to}>
                  <SidebarItemIcon>
                    <Icon />
                  </SidebarItemIcon>
                  <SidebarItemLabel>{item.label}</SidebarItemLabel>
                  {item.badge ? (
                    <span className="ml-auto rounded-full bg-zinc-950/85 px-2 py-0.5 text-[0.68rem] font-semibold leading-none text-white shadow-sm">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              </SidebarItem>
            )
          })}
        </SidebarSection>
      </div>

      <SidebarFooter>
        <Dialog>
          <DialogTrigger asChild>
            <SidebarItem type="button" icon={<Settings />} value="settings">
              Settings
            </SidebarItem>
          </DialogTrigger>
          <DialogContent className="flex min-h-[80vh] min-w-[60vw] flex-col">
            <DialogTitle>Settings</DialogTitle>
            <StudioSettingsDialog />
          </DialogContent>
        </Dialog>

        <Sheet>
          <SheetTrigger asChild>
            <SidebarItem type="button" icon={<MessageSquarePlus />} value="feedback">
              Feedback
            </SidebarItem>
          </SheetTrigger>
          <SheetContent side="right" />
        </Sheet>
      </SidebarFooter>
    </Sidebar>
  )
}
