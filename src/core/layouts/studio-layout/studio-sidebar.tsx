import { Link, useLocation } from '@tanstack/react-router'
import { Clapperboard, MessageSquarePlus, Settings } from 'lucide-react'

import { StudioSettingsDialog } from './studio-settings-dialog'
import {
  getStudioDockPathname,
  getStudioMobileDockItems,
  isStudioSidebarItemActive,
  studioNavigationItems,
} from './studio-sidebar-items'
import {
  Sidebar,
  SidebarBrand,
  SidebarFooter,
  SidebarItem,
  SidebarItemIcon,
  SidebarItemLabel,
  SidebarSection,
  useStudioSidebar,
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

export function StudioSidebar({ className }: { className?: string }) {
  const location = useLocation()
  const { desktopOpen } = useStudioSidebar()
  const dockPathname = getStudioDockPathname(location.pathname)
  const mobileDockItems = getStudioMobileDockItems()

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
      className={cn('z-30 mr-2 shrink-0', !desktopOpen && 'md:hidden', className)}
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
            const active = isStudioSidebarItemActive(location.pathname, item.to)

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
