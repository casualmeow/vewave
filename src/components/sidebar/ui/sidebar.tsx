import { Link, useLocation } from '@tanstack/react-router'
import {
  BarChart3,
  Clapperboard,
  Home,
  MessageCircle,
  MessageSquare,
  Plus,
  Settings,
  SlidersHorizontal,
  Video,
} from 'lucide-react'

import { MobileSidebarDock } from './mobile-sidebar-dock'
import { SidebarSettingsDialog } from './settings'
import { SidebarBrand } from './sidebar-brand'
import { SidebarFooter } from './sidebar-footer'
import { SidebarItem, SidebarItemBadge, SidebarItemIcon, SidebarItemLabel } from './sidebar-item'
import { SidebarRoot } from './sidebar-root'
import { SidebarSection } from './sidebar-section'
import type { MobileSidebarDockItem } from './mobile-sidebar-dock'
import type { ReactNode } from 'react'
import type { SidebarRootProps } from '../types'
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/shared/ui'
import { cn } from '@/shared/lib/utils'

type StudioRoute =
  | '/studio/home'
  | '/studio/channel-settings'
  | '/studio/analytics'
  | '/studio/content-manager'
  | '/studio/community'
  | '/studio/video/create'

type StudioSidebarItem = {
  label: string
  shortLabel?: string
  to: StudioRoute
  icon: ReactNode
  badge?: ReactNode
  disabled?: boolean
}

type SidebarFluidProps = Pick<
  SidebarRootProps,
  | 'design'
  | 'size'
  | 'density'
  | 'collapsed'
  | 'motion'
  | 'fluidPreset'
  | 'hoverScale'
  | 'activeHoverScale'
  | 'dragScale'
  | 'hoverSize'
  | 'magneticStrength'
  | 'magneticVerticalStrength'
  | 'tiltStrength'
  | 'focusBlur'
  | 'focusBlurAmount'
  | 'focusDimOpacity'
  | 'liquidIntensity'
  | 'dragMode'
  | 'mobileMode'
  | 'mobileFluidPreset'
  | 'mobileHoverScale'
  | 'mobileActiveHoverScale'
  | 'mobileDragScale'
  | 'mobileHoverSize'
  | 'mobileMagneticStrength'
  | 'mobileMagneticVerticalStrength'
  | 'mobileTiltStrength'
  | 'mobileFocusBlur'
  | 'mobileFocusBlurAmount'
  | 'mobileFocusDimOpacity'
  | 'mobileLiquidIntensity'
  | 'mobileDragMode'
  | 'mobileDockDragMode'
  | 'mobileMaxItems'
  | 'mobileDockPlacement'
  | 'mobileDockClassName'
>

export type SidebarProps = Omit<SidebarRootProps, 'children'> &
  SidebarFluidProps & {
    children?: ReactNode
    mobileDockItems?: Array<MobileSidebarDockItem>
    mobileDockPathname?: string
  }

const primaryLinks: Array<StudioSidebarItem> = [
  { label: 'Home', to: '/studio/home', icon: <Home /> },
  {
    label: 'Channel Settings',
    shortLabel: 'Settings',
    to: '/studio/channel-settings',
    icon: <SlidersHorizontal />,
  },
  { label: 'Analytics', to: '/studio/analytics', icon: <BarChart3 /> },
  {
    label: 'Content manager',
    shortLabel: 'Content',
    to: '/studio/content-manager',
    icon: <Clapperboard />,
  },
  {
    label: 'Community',
    shortLabel: 'Social',
    to: '/studio/community',
    icon: <MessageCircle />,
    badge: 'New',
  },
]

const quickLinks: Array<StudioSidebarItem> = [
  { label: 'Create video', shortLabel: 'Create', to: '/studio/video/create', icon: <Plus /> },
]

function isActivePath(pathname: string, to: string) {
  return pathname === to || pathname.startsWith(`${to}/`)
}

export function Sidebar({
  children,
  className,
  design = 'liquidGlass',
  size = 'md',
  density = 'comfortable',
  collapsed = false,
  motion = 'fluid',
  fluidPreset = 'extreme',
  hoverScale,
  activeHoverScale,
  dragScale,
  hoverSize = 15,
  magneticStrength,
  magneticVerticalStrength,
  tiltStrength,
  focusBlur = true,
  focusBlurAmount = 5.5,
  focusDimOpacity = 0.38,
  liquidIntensity = 1.6,
  dragMode = 'both',
  mobileMode = 'auto',
  mobileFluidPreset,
  mobileHoverScale,
  mobileActiveHoverScale,
  mobileDragScale,
  mobileHoverSize,
  mobileMagneticStrength,
  mobileMagneticVerticalStrength,
  mobileTiltStrength,
  mobileFocusBlur,
  mobileFocusBlurAmount,
  mobileFocusDimOpacity,
  mobileLiquidIntensity,
  mobileDragMode,
  mobileDockDragMode = 'both',
  mobileMaxItems = 5,
  mobileDockPlacement = 'container',
  mobileDockClassName,
  mobileDockItems,
  mobileDockPathname,
  ...props
}: SidebarProps) {
  const { pathname } = useLocation()
  const dockPathname = mobileDockPathname ?? pathname
  const hasCustomMobileDock = Boolean(mobileDockItems?.length)
  const shouldRenderCustomMobileDock = mobileMode !== 'off' && hasCustomMobileDock
  const shouldUseCustomResponsiveRail = mobileMode === 'auto' && hasCustomMobileDock
  const mobileItems: Array<StudioSidebarItem> = [
    primaryLinks[0],
    primaryLinks[3],
    primaryLinks[2],
    primaryLinks[4],
    quickLinks[0],
  ].filter((item): item is StudioSidebarItem => Boolean(item))

  if (children !== undefined) {
    return (
      <nav className="contents" aria-label="Sidebar navigation" {...props}>
        {mobileMode !== 'only' ? (
          <div
            className={cn(
              shouldUseCustomResponsiveRail ? 'hidden shrink-0 md:block' : 'shrink-0',
              className,
            )}
          >
            <SidebarRoot
              design={design}
              size={size}
              density={density}
              collapsed={collapsed}
              motion={motion}
              fluidPreset={fluidPreset}
              hoverScale={hoverScale}
              activeHoverScale={activeHoverScale}
              dragScale={dragScale}
              hoverSize={hoverSize}
              magneticStrength={magneticStrength}
              magneticVerticalStrength={magneticVerticalStrength}
              tiltStrength={tiltStrength}
              focusBlur={focusBlur}
              focusBlurAmount={focusBlurAmount}
              focusDimOpacity={focusDimOpacity}
              liquidIntensity={liquidIntensity}
              dragMode={dragMode}
            >
              {children}
            </SidebarRoot>
          </div>
        ) : null}

        {shouldRenderCustomMobileDock && mobileDockItems ? (
          <MobileSidebarDock
            items={mobileDockItems}
            pathname={dockPathname}
            fluidPreset={mobileFluidPreset ?? fluidPreset}
            hoverScale={mobileHoverScale ?? hoverScale}
            activeHoverScale={mobileActiveHoverScale ?? activeHoverScale}
            dragScale={mobileDragScale ?? dragScale}
            hoverSize={mobileHoverSize ?? Math.max(18, hoverSize)}
            magneticStrength={mobileMagneticStrength ?? magneticStrength}
            magneticVerticalStrength={mobileMagneticVerticalStrength ?? magneticVerticalStrength}
            tiltStrength={mobileTiltStrength ?? tiltStrength}
            focusBlur={mobileFocusBlur ?? focusBlur}
            focusBlurAmount={mobileFocusBlurAmount ?? focusBlurAmount}
            focusDimOpacity={mobileFocusDimOpacity ?? focusDimOpacity}
            liquidIntensity={mobileLiquidIntensity ?? liquidIntensity}
            dragMode={mobileDragMode ?? dragMode}
            dockDragMode={mobileDockDragMode}
            maxItems={mobileMaxItems}
            placement={mobileDockPlacement}
            className={mobileDockClassName}
          />
        ) : null}
      </nav>
    )
  }

  return (
    <nav className="contents" aria-label="Studio navigation" {...props}>
      {mobileMode !== 'only' ? (
        <div
          className={cn(mobileMode === 'auto' ? 'hidden shrink-0 md:block' : 'shrink-0', className)}
        >
          <SidebarRoot
            design={design}
            size={size}
            density={density}
            collapsed={collapsed}
            motion={motion}
            fluidPreset={fluidPreset}
            hoverScale={hoverScale}
            activeHoverScale={activeHoverScale}
            dragScale={dragScale}
            hoverSize={hoverSize}
            magneticStrength={magneticStrength}
            magneticVerticalStrength={magneticVerticalStrength}
            tiltStrength={tiltStrength}
            focusBlur={focusBlur}
            focusBlurAmount={focusBlurAmount}
            focusDimOpacity={focusDimOpacity}
            liquidIntensity={liquidIntensity}
            dragMode={dragMode}
          >
            <SidebarBrand
              visual={
                <div className="grid size-11 place-items-center rounded-2xl bg-zinc-950 text-white shadow-[0_12px_30px_rgba(15,23,42,0.22),inset_0_1px_0_rgba(255,255,255,0.20)]">
                  <Video className="size-5" />
                </div>
              }
              title="Vewave Studio"
              subtitle="Your channel workspace"
            />

            <div className="min-h-0 flex-1 overflow-y-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <SidebarSection title="Studio">
                {primaryLinks.map((item) => (
                  <SidebarItem
                    key={item.to}
                    value={item.to}
                    asChild
                    active={isActivePath(pathname, item.to)}
                    disabled={item.disabled}
                  >
                    <Link to={item.to}>
                      <SidebarItemIcon>{item.icon}</SidebarItemIcon>
                      <SidebarItemLabel>{item.label}</SidebarItemLabel>
                      {item.badge ? <SidebarItemBadge>{item.badge}</SidebarItemBadge> : null}
                    </Link>
                  </SidebarItem>
                ))}
              </SidebarSection>

              <SidebarSection title="Quick actions" className="pt-1">
                {quickLinks.map((item) => (
                  <SidebarItem
                    key={item.to}
                    value={item.to}
                    asChild
                    active={isActivePath(pathname, item.to)}
                  >
                    <Link to={item.to}>
                      <SidebarItemIcon>{item.icon}</SidebarItemIcon>
                      <SidebarItemLabel>{item.label}</SidebarItemLabel>
                    </Link>
                  </SidebarItem>
                ))}
              </SidebarSection>
            </div>

            <SidebarFooter>
              <div className="space-y-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-2xl bg-white/10 hover:bg-white/20"
                    >
                      <Settings className="size-4" />
                      Settings
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="flex min-h-[70vh] flex-col sm:max-w-3xl">
                    <DialogTitle>Studio settings</DialogTitle>
                    <SidebarSettingsDialog />
                  </DialogContent>
                </Dialog>

                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-2xl bg-white/10 hover:bg-white/20"
                    >
                      <MessageSquare className="size-4" />
                      Feedback
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right">
                    <div className="space-y-2 pt-6">
                      <h2 className="text-lg font-semibold">Feedback</h2>
                      <p className="text-sm text-muted-foreground">
                        Share what should be improved in the studio sidebar experience.
                      </p>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </SidebarFooter>
          </SidebarRoot>
        </div>
      ) : null}

      {mobileMode !== 'off' ? (
        <MobileSidebarDock
          items={mobileItems}
          pathname={dockPathname}
          fluidPreset={mobileFluidPreset ?? fluidPreset}
          hoverScale={mobileHoverScale ?? hoverScale}
          activeHoverScale={mobileActiveHoverScale ?? activeHoverScale}
          dragScale={mobileDragScale ?? dragScale}
          hoverSize={mobileHoverSize ?? Math.max(18, hoverSize)}
          magneticStrength={mobileMagneticStrength ?? magneticStrength}
          magneticVerticalStrength={mobileMagneticVerticalStrength ?? magneticVerticalStrength}
          tiltStrength={mobileTiltStrength ?? tiltStrength}
          focusBlur={mobileFocusBlur ?? focusBlur}
          focusBlurAmount={mobileFocusBlurAmount ?? focusBlurAmount}
          focusDimOpacity={mobileFocusDimOpacity ?? focusDimOpacity}
          liquidIntensity={mobileLiquidIntensity ?? liquidIntensity}
          dragMode={mobileDragMode ?? dragMode}
          dockDragMode={mobileDockDragMode}
          maxItems={mobileMaxItems}
          placement={mobileDockPlacement}
          className={mobileDockClassName}
        />
      ) : null}
    </nav>
  )
}
