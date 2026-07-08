import { Link, useLocation } from '@tanstack/react-router'
import { Compass, LogIn, UserRound } from 'lucide-react'
import { useState, type ReactNode } from 'react'

import { getAppMobileDockItems } from '../app-sidebar-items'
import { getInitials } from './sidebar/utils'
import { useSidebarData } from './sidebar/hooks'
import {
  AppSidebarAdminItem,
  AppSidebarFooter,
  AppSidebarIdentity,
  NewSidebarMenu,
  SidebarCategories,
  SidebarCategorySheet,
} from './sidebar/components'
import type { AppSidebarMode } from '../app-sidebar-mode'
import type { AppShellSurfaceRenderer } from './app-shell-surfaces'
import type { AppSidebarSectionId } from './sidebar/types'
import {
  Sidebar,
  SidebarItem,
  SidebarItemIcon,
  SidebarItemLabel,
  SidebarSection,
} from '@/components/sidebar'
import { useLogout } from '@/modules/auth'
import { cn } from '@/shared/lib/utils'

export function AppSidebar({
  className,
  mode = 'expanded',
  renderSurface,
}: {
  className?: string
  mode?: AppSidebarMode
  renderSurface?: AppShellSurfaceRenderer
}) {
  const location = useLocation()
  const logout = useLogout()
  const { recentRoomItems, status, user } = useSidebarData()

  const [activeCategory, setActiveCategory] = useState<AppSidebarSectionId | null>(null)
  const [newMenuOpen, setNewMenuOpen] = useState(false)

  const collapsed = mode !== 'expanded'
  const initials = getInitials(user?.name, user?.email)
  const identitySubtitle = user?.username
    ? `@${user.username}`
    : user?.email
      ? `@${user.email.split('@')[0]}`
      : undefined

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

  const communityActive =
    location.pathname === '/servers/discover' || location.pathname.startsWith('/servers/discover/')

  const wrapSurface = (surface: Parameters<AppShellSurfaceRenderer>[0], children: ReactNode) =>
    renderSurface ? renderSurface(surface, children) : children

  const sidebarContent = (
    <>
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
            <div className="grid gap-2">
              <SidebarSection title="Workspace">
                <NewSidebarMenu open={newMenuOpen} onOpenChange={setNewMenuOpen} />

                <SidebarCategories
                  activeCategory={activeCategory}
                  collapsed={collapsed}
                  pathname={location.pathname}
                  onOpenCategory={setActiveCategory}
                />

                <div className={cn(!collapsed && 'mt-1 border-t border-sidebar-border/60 pt-2')}>
                  <SidebarItem asChild active={communityActive} value="community">
                    <Link to="/servers/discover">
                      <SidebarItemIcon>
                        <Compass />
                      </SidebarItemIcon>
                      <SidebarItemLabel>Community</SidebarItemLabel>
                    </Link>
                  </SidebarItem>
                </div>
              </SidebarSection>

              {user?.isAdmin ? <AppSidebarAdminItem pathname={location.pathname} /> : null}
            </div>,
          )}
        </div>
      </div>

      {wrapSurface('sidebarFooter', <AppSidebarFooter status={status} onLogout={logout} />)}
    </>
  )

  const sidebarShell = (
    <Sidebar
      collapsed={collapsed}
      hidden={mode === 'hidden'}
      data-app-sidebar-mode={mode}
      mobileDockItems={sessionMobileDockItems}
      mobileDockPathname={location.pathname}
      mobileDockPlacement="container"
      mobileDockClassName="inset-x-3 z-50"
      mobileMaxItems={6}
      aria-label="App navigation"
      className={cn(
        'z-30 shrink-0 transition-[margin] duration-300 motion-reduce:transition-none',
        mode === 'hidden' ? '-ml-3 mr-0' : 'ml-0 mr-2',
        className,
      )}
    >
      {sidebarContent}
    </Sidebar>
  )

  return (
    <>
      {sidebarShell}

      <SidebarCategorySheet
        activeCategory={activeCategory}
        onClose={() => setActiveCategory(null)}
        pathname={location.pathname}
      />
    </>
  )
}
