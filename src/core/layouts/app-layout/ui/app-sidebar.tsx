import { Link, useLocation } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'motion/react'
import {
  ChevronDown,
  LifeBuoy,
  LogIn,
  LogOut,
  Settings,
  Sparkles,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { useState } from 'react'

import {
  appPinnedRooms,
  appAdminItem,
  appPrimaryItems,
  appRecentRooms,
  appServers,
  getAppMobileDockItems,
  getRoomIcon,
  isAppPrimaryItemActive,
  isRoomActive,
  roomsCollapseValue,
  serversCollapseValue,
  type AppSidebarRoomItem,
  type AppSidebarServerItem,
} from '../app-sidebar-items'
import { AppSettingsDialog } from './app-settings-dialog'
import type { ReactNode } from 'react'
import type { AuthStatus, AuthUser } from '@/modules/auth/model/types'
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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
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

export function AppSidebar({ className }: { className?: string }) {
  const location = useLocation()
  const logout = useLogout()
  const status = useAuthStore((state) => state.status)
  const user = useAuthStore((state) => state.user)
  const initials = getInitials(user?.name, user?.email)
  const identitySubtitle = user?.username ? `@${user.username}` : user?.email
  const primaryItems = user?.isAdmin ? [...appPrimaryItems, appAdminItem] : appPrimaryItems
  const mobileDockItems = getAppMobileDockItems()
  const sessionMobileDockItems =
    status === 'authenticated'
      ? [
          ...mobileDockItems.slice(0, 4),
          {
            id: 'profile',
            label: 'Profile',
            to: '/profile' as const,
            icon: <UserRound />,
          },
        ]
      : status === 'anonymous'
        ? [
            ...mobileDockItems.slice(0, 4),
            {
              id: 'sign-in',
              label: 'Sign in',
              to: '/sign-in' as const,
              search: { redirectTo: undefined },
              icon: <LogIn />,
            },
          ]
        : mobileDockItems

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
      mobileMode="auto"
      mobileDockItems={sessionMobileDockItems}
      mobileDockPathname={location.pathname}
      mobileDockPlacement="container"
      mobileDockClassName="inset-x-3 z-50"
      mobileMaxItems={5}
      mobileFluidPreset="expressive"
      mobileHoverSize={18}
      mobileDragMode="both"
      mobileDockDragMode="both"
      role="navigation"
      aria-label="App navigation"
      className={cn('z-30 mr-2 shrink-0', className)}
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <AppSidebarIdentity
          status={status}
          user={user}
          initials={initials}
          subtitle={identitySubtitle}
        />

        <div className="min-h-0 flex-1 overflow-y-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <SidebarSection title="Workspace">
            {primaryItems.map((item) => {
              const Icon = item.icon

              return (
                <SidebarItem
                  key={item.to}
                  asChild
                  active={isAppPrimaryItemActive(location.pathname, item)}
                  value={item.to}
                  badge={item.badge}
                >
                  <Link to={item.to}>
                    <SidebarItemIcon>
                      <Icon />
                    </SidebarItemIcon>
                    <SidebarItemLabel>{item.label}</SidebarItemLabel>
                    {item.badge ? (
                      <span className="relative z-10 ml-auto rounded-full bg-sidebar-primary px-2 py-0.5 text-[0.68rem] font-semibold leading-none text-sidebar-primary-foreground shadow-sm">
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                </SidebarItem>
              )
            })}
          </SidebarSection>

          <SidebarSection title="History">
            {appRecentRooms.map((room) => (
              <RoomSidebarItem
                key={room.code}
                room={room}
                active={isRoomActive(location.pathname, room.code)}
              />
            ))}
          </SidebarSection>

          <AppSidebarDisclosure
            title="Rooms"
            icon={<UsersRound />}
            value={roomsCollapseValue}
            defaultOpen
            count={appPinnedRooms.length}
          >
            {appPinnedRooms.map((room) => (
              <RoomSidebarItem
                key={room.code}
                room={room}
                active={isRoomActive(location.pathname, room.code)}
                focusGroup={roomsCollapseValue}
              />
            ))}
          </AppSidebarDisclosure>

          <AppSidebarDisclosure
            title="Servers"
            icon={<Sparkles />}
            value={serversCollapseValue}
            count={appServers.length}
          >
            {appServers.map((server) => (
              <ServerSidebarItem
                key={server.id}
                server={server}
                focusGroup={serversCollapseValue}
              />
            ))}
          </AppSidebarDisclosure>
        </div>
      </div>

      <AppSidebarFooter status={status} onLogout={logout} />
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
        subtitle="Restoring your workspace"
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
        title="Guest workspace"
        subtitle="Sign in to sync rooms"
        meta={
          <Button asChild size="sm" variant="outline" className="rounded-full bg-card/70">
            <Link to="/sign-in" search={{ redirectTo: undefined }}>
              <LogIn className="size-3.5" />
              Sign in
            </Link>
          </Button>
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
      <SidebarItem type="button" icon={<LifeBuoy />} value="support">
        Support
      </SidebarItem>

      <Dialog>
        <DialogTrigger asChild>
          <SidebarItem type="button" icon={<Settings />} value="settings">
            Settings
          </SidebarItem>
        </DialogTrigger>
        <AppSettingsDialog />
      </Dialog>

      <Separator className="my-1 bg-sidebar-border" />

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
      ) : (
        <SidebarItem asChild value="sign-in">
          <Link to="/sign-in" search={{ redirectTo: undefined }}>
            <SidebarItemIcon>
              <LogIn />
            </SidebarItemIcon>
            <SidebarItemLabel>Sign in</SidebarItemLabel>
          </Link>
        </SidebarItem>
      )}
    </SidebarFooter>
  )
}

function AppSidebarDisclosure({
  children,
  count,
  defaultOpen = false,
  icon,
  title,
  value,
}: {
  children: ReactNode
  count: number
  defaultOpen?: boolean
  icon: ReactNode
  title: string
  value: string
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <SidebarSection title={title}>
      <SidebarItem
        type="button"
        value={value}
        focusGroup={value}
        icon={icon}
        badge={
          <span className="inline-flex items-center gap-1">
            {count}
            <ChevronDown
              className={cn('size-3.5 transition-transform duration-200', open && 'rotate-180')}
            />
          </span>
        }
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {title}
      </SidebarItem>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 38, mass: 0.7 }}
            className="overflow-hidden"
          >
            <div className="space-y-1 pt-1">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </SidebarSection>
  )
}

function RoomSidebarItem({
  active,
  focusGroup,
  room,
}: {
  active: boolean
  focusGroup?: string
  room: AppSidebarRoomItem
}) {
  const Icon = getRoomIcon(room)

  return (
    <SidebarItem
      asChild
      active={active}
      value={`room-${room.code}`}
      focusGroup={focusGroup}
      hoverSize={4}
    >
      <Link to="/room/$code" params={{ code: room.code }}>
        <SidebarItemIcon>
          <span className={cn('size-2.5 rounded-full shadow-sm', room.accent)} />
        </SidebarItemIcon>
        <SidebarItemLabel>
          <span className="block truncate">{room.label}</span>
          <span className="block truncate text-[0.68rem] font-normal text-muted-foreground">
            {room.description}
          </span>
        </SidebarItemLabel>
        {room.badge ? (
          <span className="relative z-10 ml-auto rounded-full bg-sidebar-primary px-2 py-0.5 text-[0.62rem] font-semibold leading-none text-sidebar-primary-foreground shadow-sm">
            {room.badge}
          </span>
        ) : (
          <Icon className="relative z-10 ml-auto size-3.5 text-muted-foreground" />
        )}
      </Link>
    </SidebarItem>
  )
}

function ServerSidebarItem({
  focusGroup,
  server,
}: {
  focusGroup?: string
  server: AppSidebarServerItem
}) {
  return (
    <SidebarItem
      type="button"
      value={`server-${server.id}`}
      focusGroup={focusGroup}
      hoverSize={4}
      icon={<span className={cn('size-2.5 rounded-full shadow-sm', server.accent)} />}
      badge={server.status}
    >
      <>
        <span className="block truncate">{server.label}</span>
        <span className="block truncate text-[0.68rem] font-normal text-muted-foreground">
          {server.description}
        </span>
      </>
    </SidebarItem>
  )
}
