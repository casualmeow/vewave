import { Link, useLocation } from '@tanstack/react-router'
import { LifeBuoy, LogIn, LogOut, Settings, UserRound } from 'lucide-react'

import {
  appAdminItem,
  appPrimaryItems,
  getAppMobileDockItems,
  getRoomIcon,
  isAppPrimaryItemActive,
  type AppSidebarRoomItem,
} from '../app-sidebar-items'
import { AppSettingsDialog } from './app-settings-dialog'
import type { AppShellSurfaceRenderer } from './app-shell-surfaces'
import type { ReactNode } from 'react'
import type { AuthStatus, AuthUser } from '@/modules/auth/model/types'
import {
  Sidebar,
  SidebarBrand,
  SidebarFooter,
  SidebarItem,
  SidebarItemBadge,
  SidebarItemIcon,
  SidebarItemLabel,
  SidebarSection,
} from '@/components/sidebar'
import { useAuthStore, useLogout } from '@/modules/auth'
import { useSavedRooms, type SavedRoomSummary } from '@/modules/watch-together/room'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Dialog,
  DialogTrigger,
  Separator,
  SpinIcon,
} from '@/shared/ui'
import { cn } from '@/shared/lib/utils'
import { VewaveLogoMark } from '@/shared/theme'

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

export function AppSidebar({
  className,
  renderSurface,
}: {
  className?: string
  renderSurface?: AppShellSurfaceRenderer
}) {
  const location = useLocation()
  const logout = useLogout()
  const status = useAuthStore((state) => state.status)
  const user = useAuthStore((state) => state.user)
  const initials = getInitials(user?.name, user?.email)
  const identitySubtitle = user?.username ? `@${user.username}` : user?.email
  const savedRooms = useSavedRooms(user?.id ?? null)
  const recentRoomItems = savedRooms.slice(0, 5).map(getSidebarRoomItem)
  const primaryItems = user?.isAdmin ? [...appPrimaryItems, appAdminItem] : appPrimaryItems
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
  const wrapSurface = (surface: Parameters<AppShellSurfaceRenderer>[0], children: ReactNode) =>
    renderSurface ? renderSurface(surface, children) : children

  return (
    <Sidebar
      mobileDockItems={sessionMobileDockItems}
      mobileDockPathname={location.pathname}
      mobileDockPlacement="container"
      mobileDockClassName="inset-x-3 z-50"
      aria-label="App navigation"
      className={cn('z-30 mr-2 shrink-0', className)}
    >
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
            <div className="grid gap-3">
              <SidebarSection title="Watch">
                {primaryItems.map((item) => {
                  const Icon = item.icon
                  const active = isAppPrimaryItemActive(location.pathname, item)

                  return (
                    <SidebarItem key={item.to} asChild active={active} value={item.to}>
                      <Link to={item.to}>
                        <SidebarItemIcon>
                          <Icon />
                        </SidebarItemIcon>
                        <SidebarItemLabel>{item.label}</SidebarItemLabel>
                      </Link>
                    </SidebarItem>
                  )
                })}
              </SidebarSection>

              {recentRoomItems.length > 0 ? (
                <SidebarSection title="Recent rooms">
                  {recentRoomItems.map((room) => {
                    const Icon = getRoomIcon(room)
                    const active = location.pathname === `/room/${room.code}`

                    return (
                      <SidebarItem
                        key={room.code}
                        asChild
                        active={active}
                        value={`room-${room.code}`}
                      >
                        <Link to="/room/$code" params={{ code: room.code }}>
                          <SidebarItemIcon>
                            <Icon />
                          </SidebarItemIcon>
                          <SidebarItemLabel>{room.label}</SidebarItemLabel>
                          {room.badge ? <SidebarItemBadge>{room.badge}</SidebarItemBadge> : null}
                        </Link>
                      </SidebarItem>
                    )
                  })}
                </SidebarSection>
              ) : null}
            </div>,
          )}
        </div>
      </div>

      {wrapSurface('sidebarFooter', <AppSidebarFooter status={status} onLogout={logout} />)}
    </Sidebar>
  )
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
