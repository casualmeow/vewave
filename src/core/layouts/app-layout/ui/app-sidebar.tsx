import { Link, useLocation } from '@tanstack/react-router'
import {
  FolderKanban,
  LifeBuoy,
  LogOut,
  PlaySquare,
  PlusCircle,
  Settings,
  SlidersHorizontal,
  UserRound,
} from 'lucide-react'
import { useLogout } from '@/modules/auth'
import { useAuthStore } from '@/modules/auth/model'
import {
  SidebarBrand,
  SidebarFooter,
  SidebarItem,
  SidebarItemIcon,
  SidebarItemLabel,
  SidebarRoot,
  SidebarSection,
} from '@/components/sidebar'
import {
  Avatar,
  AvatarFallback,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Separator,
} from '@/shared/ui'

const appLinks = [
  {
    label: 'Projects',
    to: '/projects',
    icon: FolderKanban,
  },
  {
    label: 'New room',
    to: '/create',
    icon: PlusCircle,
  },
] as const

function getInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || 'Vewave User'
  const parts = source.split(/\s+/).filter(Boolean)

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

function isActivePath(pathname: string, to: string) {
  return pathname === to || pathname.startsWith(`${to}/`)
}

export function AppSidebar() {
  const { pathname } = useLocation()
  const logout = useLogout()
  const user = useAuthStore((state) => state.user)
  const initials = getInitials(user?.name, user?.email)

  return (
    <nav className="shrink-0" aria-label="Application navigation">
      <SidebarRoot design="liquidGlass" size="md" density="comfortable" motion="fluid">
        <SidebarBrand
          visual={
            <Avatar className="size-12 border border-white/60 shadow-[0_12px_30px_rgba(15,23,42,0.16)]">
              <AvatarFallback className="bg-zinc-950 text-sm font-semibold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
          }
          title={user?.name ?? 'Vewave'}
          subtitle={user?.email ?? 'Project workspace'}
          meta={
            <span className="inline-flex items-center gap-1 rounded-full bg-white/62 px-2 py-0.5 text-[0.68rem] font-medium text-zinc-600 shadow-sm">
              <PlaySquare className="size-3" />
              Watch projects
            </span>
          }
        />

        <div className="min-h-0 flex-1 overflow-y-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <SidebarSection title="Workspace">
            {appLinks.map((item) => {
              const Icon = item.icon

              return (
                <SidebarItem key={item.to} asChild active={isActivePath(pathname, item.to)}>
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
        </div>

        <SidebarFooter>
          <Dialog>
            <DialogTrigger asChild>
              <SidebarItem type="button">
                <SidebarItemIcon>
                  <Settings />
                </SidebarItemIcon>
                <SidebarItemLabel>Settings</SidebarItemLabel>
              </SidebarItem>
            </DialogTrigger>
            <DialogContent className="overflow-hidden border-white/50 bg-white/88 p-0 shadow-[0_30px_90px_rgba(15,23,42,0.24)] backdrop-blur-2xl sm:max-w-2xl">
              <div className="border-b border-zinc-200/70 px-6 py-5">
                <DialogTitle>Workspace settings</DialogTitle>
                <DialogDescription>
                  Mock controls for project defaults, notifications, and account preferences.
                </DialogDescription>
              </div>
              <div className="grid gap-4 p-6 sm:grid-cols-2">
                {[
                  {
                    icon: UserRound,
                    title: 'Profile',
                    text: 'Avatar, display name, and creator identity.',
                  },
                  {
                    icon: SlidersHorizontal,
                    title: 'Project defaults',
                    text: 'Default privacy, playback sync, and room templates.',
                  },
                  {
                    icon: LifeBuoy,
                    title: 'Support',
                    text: 'Feedback routing and workspace diagnostics.',
                  },
                  {
                    icon: PlaySquare,
                    title: 'Playback',
                    text: 'Host controls, viewer permissions, and latency tolerance.',
                  },
                ].map((item) => {
                  const Icon = item.icon

                  return (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-zinc-200/80 bg-white/80 p-4 shadow-sm"
                    >
                      <div className="grid size-10 place-items-center rounded-xl bg-zinc-950 text-white">
                        <Icon className="size-4" />
                      </div>
                      <div className="mt-3 text-sm font-semibold text-zinc-950">{item.title}</div>
                      <p className="mt-1 text-sm leading-6 text-zinc-600">{item.text}</p>
                    </div>
                  )
                })}
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-4 px-6 py-4">
                <div className="text-sm text-zinc-600">Signed in as {user?.email ?? 'you'}</div>
                <Button type="button" variant="outline" onClick={() => void logout()}>
                  <LogOut className="size-4" />
                  Sign out
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </SidebarFooter>
      </SidebarRoot>
    </nav>
  )
}
