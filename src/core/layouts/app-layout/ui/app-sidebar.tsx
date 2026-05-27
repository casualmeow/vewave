import { Link, useLocation } from '@tanstack/react-router'
import {
  FolderKanban,
  LifeBuoy,
  LogOut,
  PlusCircle,
  Settings,
  Sparkles,
  UsersRound,
} from 'lucide-react'

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
import { useLogout, useAuthStore } from '@/modules/auth'
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
  Separator,
} from '@/shared/ui'
import { cn } from '@/shared/lib/utils'

type AppNavItem = {
  label: string
  shortLabel?: string
  to: '/projects' | '/create' | '/room/$code'
  params?: { code: string }
  icon: typeof FolderKanban
  badge?: string
}

const appNavItems: ReadonlyArray<AppNavItem> = [
  { label: 'Projects', to: '/projects', icon: FolderKanban },
  { label: 'New project', shortLabel: 'Create', to: '/create', icon: PlusCircle, badge: 'Create' },
  {
    label: 'Demo room',
    shortLabel: 'Room',
    to: '/room/$code',
    params: { code: 'DEMO42' },
    icon: UsersRound,
  },
]

function getInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || 'Vewave User'
  const parts = source.split(/\s+/).filter(Boolean)

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }

  return source.slice(0, 2).toUpperCase()
}

function isActiveRoute(pathname: string, item: AppNavItem) {
  if (item.to === '/room/$code') {
    return pathname.startsWith('/room/')
  }

  return pathname === item.to || pathname.startsWith(`${item.to}/`)
}

export function AppSidebar({ className }: { className?: string }) {
  const location = useLocation()
  const logout = useLogout()
  const user = useAuthStore((state) => state.user)
  const initials = getInitials(user?.name, user?.email)
  const mobileDockItems: Array<MobileSidebarDockItem> = appNavItems.map((item) => {
    const Icon = item.icon

    return {
      label: item.label,
      shortLabel: item.shortLabel,
      to: item.to,
      params: item.params,
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
      fluidPreset="balanced"
      hoverScale={1.035}
      activeHoverScale={1.02}
      dragScale={1.055}
      hoverSize={6}
      magneticStrength={7}
      magneticVerticalStrength={4}
      tiltStrength={2.2}
      focusBlur
      focusBlurAmount={2.4}
      focusDimOpacity={0.68}
      liquidIntensity={0.9}
      dragMode="none"
      mobileDockItems={mobileDockItems}
      mobileDockPathname={location.pathname}
      mobileDockPlacement="container"
      mobileDockClassName="inset-x-3"
      role="navigation"
      aria-label="App navigation"
      className={cn('hidden shrink-0 md:flex', className)}
    >
      <SidebarBrand
        visual={
          <Avatar className="size-13 border border-white/60 shadow-sm">
            <AvatarImage alt={user?.name ?? 'User avatar'} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        }
        title={user?.name ?? 'Vewave'}
        subtitle={user?.email ?? 'Watch workspace'}
        meta={
          <span className="inline-flex items-center gap-1 rounded-full bg-white/65 px-2 py-0.5 text-[0.68rem] font-medium text-zinc-600 shadow-sm">
            <Sparkles className="size-3" />
            Projects
          </span>
        }
      />

      <div className="min-h-0 flex-1 overflow-y-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <SidebarSection title="Workspace">
          {appNavItems.map((item) => {
            const Icon = item.icon

            return (
              <SidebarItem
                key={`${item.to}-${item.params?.code ?? 'root'}`}
                asChild
                active={isActiveRoute(location.pathname, item)}
              >
                <Link to={item.to} params={item.params}>
                  <SidebarItemIcon>
                    <Icon />
                  </SidebarItemIcon>
                  <SidebarItemLabel>{item.label}</SidebarItemLabel>
                  {item.badge ? (
                    <span className="relative z-10 ml-auto rounded-full bg-zinc-950/85 px-2 py-0.5 text-[0.68rem] font-semibold leading-none text-white shadow-sm">
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
            <SidebarItem type="button" icon={<Settings />}>
              Settings
            </SidebarItem>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Workspace settings</DialogTitle>
              <DialogDescription>
                Mock settings for the authenticated app shell. Real account and workspace settings
                can attach to this surface later.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3">
              {[
                ['Notifications', 'Room invites and playback alerts are enabled.'],
                ['Profile', 'Avatar, display name, and email are managed by auth.'],
                ['Playback sync', 'Host commands stay server-authoritative.'],
              ].map(([title, description]) => (
                <div key={title} className="rounded-2xl border bg-muted/35 p-4">
                  <div className="font-medium text-foreground">{title}</div>
                  <div className="mt-1 text-sm leading-6 text-muted-foreground">{description}</div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        <SidebarItem type="button" icon={<LifeBuoy />}>
          Support
        </SidebarItem>

        <Separator className="my-1 bg-white/30" />

        <SidebarItem type="button" icon={<LogOut />} onClick={() => void logout()}>
          Sign out
        </SidebarItem>
      </SidebarFooter>
    </Sidebar>
  )
}
