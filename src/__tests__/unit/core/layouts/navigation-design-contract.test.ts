import { describe, expect, it } from 'vitest'

import sidebarVariantsSource from '@/components/sidebar/constants/variants.ts?raw'
import sidebarFluidConfigSource from '@/components/sidebar/hooks/use-resolved-fluid-config.ts?raw'
import mobileSidebarDockSource from '@/components/sidebar/ui/mobile-sidebar-dock.tsx?raw'
import sidebarItemSource from '@/components/sidebar/ui/sidebar-item.tsx?raw'
import sidebarRootSource from '@/components/sidebar/ui/sidebar-root.tsx?raw'
import appSidebarItemsSource from '@/core/layouts/app-layout/app-sidebar-items.tsx?raw'
import appSidebarSource from '@/core/layouts/app-layout/ui/app-sidebar.tsx?raw'
import studioSidebarSource from '@/core/layouts/studio-layout/studio-sidebar.tsx?raw'

const productionSidebars = [
  {
    name: 'app sidebar',
    source: appSidebarSource,
  },
  {
    name: 'studio sidebar',
    source: studioSidebarSource,
  },
] as const

const localMotionTuningProps = [
  'fluidPreset=',
  'hoverScale=',
  'activeHoverScale=',
  'dragScale=',
  'hoverSize=',
  'magneticStrength=',
  'magneticVerticalStrength=',
  'tiltStrength=',
  'focusBlur=',
  'focusBlurAmount=',
  'focusDimOpacity=',
  'liquidIntensity=',
  'dragMode=',
  'mobileFluidPreset=',
  'mobileHoverScale=',
  'mobileActiveHoverScale=',
  'mobileDragScale=',
  'mobileHoverSize=',
  'mobileMagneticStrength=',
  'mobileMagneticVerticalStrength=',
  'mobileTiltStrength=',
  'mobileFocusBlur=',
  'mobileFocusBlurAmount=',
  'mobileFocusDimOpacity=',
  'mobileLiquidIntensity=',
  'mobileDragMode=',
  'mobileDockDragMode=',
] as const

describe('production navigation design contract', () => {
  it.each(productionSidebars)('$name uses calm persistent navigation defaults', ({ source }) => {
    expect(source).not.toContain('design="liquidGlass"')
    expect(source).not.toContain('motion="fluid"')
    expect(source).not.toContain('dragMode="both"')
    expect(source).not.toContain('mobileDockDragMode="both"')
    expect(source).not.toContain('role="navigation"')
  })

  it.each(productionSidebars)('$name exposes navigation semantics', ({ source }) => {
    expect(source).toContain('aria-label=')
  })

  it('app sidebar keeps active state visual without the current text pill', () => {
    expect(appSidebarSource).toContain('active={active}')
    expect(appSidebarSource).not.toContain('Current')
  })

  it('studio sidebar keeps current state explicit', () => {
    expect(studioSidebarSource).toContain('Current')
  })

  it.each(productionSidebars)('$name relies on shared motion defaults', ({ source }) => {
    localMotionTuningProps.forEach((prop) => {
      expect(source).not.toContain(prop)
    })
  })

  it.each(productionSidebars)('$name uses the theme-aware brand mark', ({ source }) => {
    expect(source).toContain('VewaveLogoMark')
    expect(source).not.toContain('/vewave-mark.svg')
  })

  it('shared sidebar primitives default to calm production behavior', () => {
    expect(sidebarRootSource).toContain("design = 'glass'")
    expect(sidebarRootSource).toContain("motion: motionPreset = 'soft'")
    expect(sidebarRootSource).toContain("fluidPreset = 'subtle'")
    expect(sidebarRootSource).toContain("motionPreset === 'fluid'")
    expect(sidebarRootSource).toContain("shouldRenderLiquidFilters = design === 'liquidGlass'")
    expect(sidebarRootSource).toContain(
      'filterIds={shouldRenderLiquidFilters ? filterIds : undefined}',
    )
    expect(sidebarRootSource).toContain('data-slot="sidebar"')
    expect(sidebarRootSource).not.toContain("design = 'liquidGlass'")
    expect(sidebarRootSource).not.toContain("motion: motionPreset = 'fluid'")
    expect(sidebarRootSource).not.toContain('data-slot="liquid-sidebar"')
    expect(sidebarFluidConfigSource).toContain("fluidPreset = 'subtle'")
    expect(sidebarVariantsSource).toContain('hoverScale: 1.018')
    expect(sidebarVariantsSource).toContain('activeHoverScale: 1.01')
    expect(sidebarVariantsSource).toContain('magneticStrength: 0')
    expect(sidebarVariantsSource).toContain('focusBlur: false')
    expect(sidebarVariantsSource).toContain("dragMode: 'none'")
  })

  it('shared mobile dock defaults are calm and non-draggable', () => {
    expect(mobileSidebarDockSource).toContain("fluidPreset = 'subtle'")
    expect(mobileSidebarDockSource).toContain("dragMode = 'none'")
    expect(mobileSidebarDockSource).toContain("dockDragMode = 'none'")
    expect(mobileSidebarDockSource).toContain('showLiquidEffects')
    expect(mobileSidebarDockSource).toContain('showLiquidEffects && canAnimate')
    expect(mobileSidebarDockSource).toContain(
      'drag={showLiquidEffects ? toMotionDragMode(dockDragMode) : false}',
    )
    expect(mobileSidebarDockSource).toContain('data-slot="mobile-sidebar-dock"')
    expect(mobileSidebarDockSource).not.toContain("fluidPreset = 'extreme'")
    expect(mobileSidebarDockSource).not.toContain("dockDragMode = 'both'")
    expect(mobileSidebarDockSource).not.toContain('liquid-mobile-sidebar-dock')
  })

  it('desktop sidebar items gate decorative liquid behavior behind expressive mode', () => {
    expect(sidebarItemSource).toContain('showLiquidEffects = canFluid')
    expect(sidebarItemSource).toContain('showLiquidEffects &&')
    expect(sidebarItemSource).toContain(
      'drag={showLiquidEffects ? toMotionDragMode(resolvedDragMode) : false}',
    )
    expect(sidebarItemSource).toContain('showLiquidEffects && (isHovered || isDragging)')
    expect(sidebarItemSource).toMatch(/active \? \(\s+showLiquidEffects \? \(\s+<motion\.span/)
    expect(sidebarItemSource).toContain(
      '<span aria-hidden="true" className={sidebarActiveIndicatorVariants({ design })}>',
    )
    expect(sidebarItemSource).toContain("'data-slot': 'sidebar-item'")
    expect(sidebarItemSource).not.toContain("design === 'liquidGlass'")
    expect(sidebarItemSource).not.toContain('data-slot="liquid-sidebar-item"')
  })

  it('app sidebar items do not ship mock room or server fixtures', () => {
    expect(appSidebarItemsSource).not.toContain('appRecentRooms')
    expect(appSidebarItemsSource).not.toContain('appPinnedRooms')
    expect(appSidebarItemsSource).not.toContain('appServers')
    expect(appSidebarItemsSource).not.toContain('DEMO42')
    expect(appSidebarItemsSource).not.toContain('TEAM1')
  })

  it('mobile room dock labels use room names, not room codes', () => {
    expect(appSidebarItemsSource).toContain('shortLabel: room.label')
    expect(appSidebarItemsSource).not.toContain('shortLabel: room.code')
  })

  it('app sidebar exposes core room routes without operational routes', () => {
    expect(appSidebarItemsSource).toContain("label: 'Rooms'")
    expect(appSidebarItemsSource).toContain("to: '/projects'")
    expect(appSidebarItemsSource).not.toContain("label: 'Start room'")
    expect(appSidebarItemsSource).not.toContain("to: '/create'")
    expect(appSidebarItemsSource).not.toContain("label: 'Healthcheck'")
    expect(appSidebarItemsSource).not.toContain("to: '/healthcheck'")
    expect(appSidebarItemsSource).not.toContain("label: 'Appearance'")
    expect(appSidebarItemsSource).not.toContain("to: '/appearance'")
    expect(appSidebarItemsSource).toContain("label: 'Admin'")
    expect(appSidebarSource).toContain('user?.isAdmin')
  })

  it('app sidebar opens full category lists in a shared sheet', () => {
    expect(appSidebarSource).toContain('SheetContent')
    expect(appSidebarSource).toContain('activeCategory')
  })

  it('app sidebar categories preview a few items inline under muted clickable headers', () => {
    expect(appSidebarSource).toContain('sidebarCategoryPreviewLimit = 3')
    expect(appSidebarSource).toContain('Show {count - sidebarCategoryPreviewLimit} more')
    expect(appSidebarSource).toContain('uppercase tracking-[0.16em]')
  })

  it('empty sidebar categories explain themselves inline instead of opening a panel', () => {
    expect(appSidebarSource).toContain('emptyHint')
    expect(appSidebarSource).toContain('count === 0 ? (')
    expect(appSidebarSource).not.toContain('bg-sidebar-accent/35')
  })

  it('active navigation state relies on the accent surface without a left bar marker', () => {
    expect(sidebarItemSource).not.toContain('w-1 rounded-full bg-sidebar-primary')
    expect(appSidebarSource).not.toContain('w-1 rounded-full bg-sidebar-primary')
  })

  it('new room and server actions open a dedicated modal instead of an inline flyout form', () => {
    expect(appSidebarSource).toContain('DialogContent')
    expect(appSidebarSource).not.toContain('variant="compact"')
    expect(appSidebarSource).not.toContain('Create and open a watch room.')
  })

  it('sidebar rows stay quiet: no status chips, categories separated by hairlines', () => {
    expect(appSidebarSource).not.toContain('{room.badge')
    expect(appSidebarSource).toContain('border-t border-sidebar-border/60')
  })
})
