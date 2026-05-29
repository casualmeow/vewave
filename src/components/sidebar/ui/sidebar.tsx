import { MobileSidebarDock, type MobileSidebarDockItem } from './mobile-sidebar-dock'
import { SidebarRoot } from './sidebar-root'
import type {
  SidebarDragMode,
  SidebarFluidPreset,
  SidebarMobileDockPlacement,
  SidebarMobileMode,
  SidebarRootProps,
} from '../types'
import { cn } from '@/shared/lib/utils'

export interface SidebarProps extends SidebarRootProps {
  mobileMode?: SidebarMobileMode
  mobileDockItems?: Array<MobileSidebarDockItem>
  mobileDockPathname?: string
  mobileDockAriaLabel?: string
  mobileFluidPreset?: SidebarFluidPreset
  mobileHoverScale?: number
  mobileActiveHoverScale?: number
  mobileDragScale?: number
  mobileHoverSize?: number
  mobileMagneticStrength?: number
  mobileMagneticVerticalStrength?: number
  mobileTiltStrength?: number
  mobileFocusBlur?: boolean
  mobileFocusBlurAmount?: number
  mobileFocusDimOpacity?: number
  mobileLiquidIntensity?: number
  mobileDragMode?: SidebarDragMode
  mobileDockDragMode?: SidebarDragMode
  mobileMaxItems?: number
  mobileDockPlacement?: SidebarMobileDockPlacement
  mobileDockClassName?: string
}

export function Sidebar({
  className,
  children,
  mobileMode = 'auto',
  mobileDockItems,
  mobileDockPathname = '',
  mobileDockAriaLabel,
  mobileDockClassName,
  mobileDockPlacement,
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
  mobileDockDragMode,
  mobileMaxItems,
  ...props
}: SidebarProps) {
  const hasMobileDock = Boolean(mobileDockItems?.length)
  const renderDesktopRail = mobileMode !== 'only'
  const renderMobileDock = mobileMode !== 'off' && hasMobileDock
  const responsiveDesktopRail = mobileMode === 'auto' && hasMobileDock

  return (
    <>
      {renderDesktopRail ? (
        <div className={cn(responsiveDesktopRail && 'flex shrink-0 max-md:hidden', className)}>
          <SidebarRoot {...props}>{children}</SidebarRoot>
        </div>
      ) : null}

      {renderMobileDock && mobileDockItems ? (
        <MobileSidebarDock
          items={mobileDockItems}
          pathname={mobileDockPathname}
          ariaLabel={mobileDockAriaLabel}
          className={mobileDockClassName}
          placement={mobileDockPlacement}
          fluidPreset={mobileFluidPreset}
          hoverScale={mobileHoverScale}
          activeHoverScale={mobileActiveHoverScale}
          dragScale={mobileDragScale}
          hoverSize={mobileHoverSize}
          magneticStrength={mobileMagneticStrength}
          magneticVerticalStrength={mobileMagneticVerticalStrength}
          tiltStrength={mobileTiltStrength}
          focusBlur={mobileFocusBlur}
          focusBlurAmount={mobileFocusBlurAmount}
          focusDimOpacity={mobileFocusDimOpacity}
          liquidIntensity={mobileLiquidIntensity}
          dragMode={mobileDragMode}
          dockDragMode={mobileDockDragMode}
          maxItems={mobileMaxItems}
        />
      ) : null}
    </>
  )
}
