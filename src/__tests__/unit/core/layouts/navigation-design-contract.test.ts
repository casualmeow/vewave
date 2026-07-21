/**
 * Spelling-based design-contract tests — read before refactoring nearby source.
 *
 * These tests import files as raw text (`?raw`) and assert on literal source
 * strings, not runtime behavior. They encode design decisions ("navigation
 * stays calm", "no decorative liquid effects in production", "use the
 * theme-aware brand mark") as regression alarms.
 *
 * When you refactor an imported file (rename a const, extract a hook, move a
 * component, reformat JSX), assertions here MAY break. That is not a bug —
 * it is the contract asking you to confirm the decision still holds. Update
 * the assertion to match the new spelling, or weaken it only if the design
 * decision itself changed.
 *
 * Do not auto-rewrite these tests when they fail; do not convert them to
 * render tests unless one has broken 3+ times for non-substantive reasons.
 */
import { describe, expect, it } from 'vitest'

import sidebarVariantsSource from '@/components/sidebar/constants/variants.ts?raw'
import mobileSidebarDockSource from '@/components/sidebar/ui/mobile-sidebar-dock.tsx?raw'
import sidebarItemSource from '@/components/sidebar/ui/sidebar-item.tsx?raw'
import sidebarRootSource from '@/components/sidebar/ui/sidebar-root.tsx?raw'
import appSidebarItemsSource from '@/core/layouts/app-layout/app-sidebar-items.tsx?raw'
import appSidebarSource from '@/core/layouts/app-layout/ui/app-sidebar.tsx?raw'
import appSidebarAdminItemSource from '@/core/layouts/app-layout/ui/sidebar/components/app-sidebar-admin-item.tsx?raw'
import appSidebarFooterSource from '@/core/layouts/app-layout/ui/sidebar/components/app-sidebar-footer.tsx?raw'
import appSidebarIdentitySource from '@/core/layouts/app-layout/ui/sidebar/components/app-sidebar-identity.tsx?raw'
import newSidebarMenuSource from '@/core/layouts/app-layout/ui/sidebar/components/new-sidebar-menu.tsx?raw'
import resourceRowsSource from '@/core/layouts/app-layout/ui/sidebar/components/resource-rows.tsx?raw'
import sidebarCategoriesSource from '@/core/layouts/app-layout/ui/sidebar/components/sidebar-categories.tsx?raw'
import sidebarCategoryBlockSource from '@/core/layouts/app-layout/ui/sidebar/components/sidebar-category-block.tsx?raw'
import sidebarCategorySheetSource from '@/core/layouts/app-layout/ui/sidebar/components/sidebar-category-sheet.tsx?raw'
import sidebarEmptyStateSource from '@/core/layouts/app-layout/ui/sidebar/components/sidebar-empty-state.tsx?raw'
import sidebarResourceListSource from '@/core/layouts/app-layout/ui/sidebar/components/sidebar-resource-list.tsx?raw'
import studioSidebarSource from '@/core/layouts/studio-layout/studio-sidebar.tsx?raw'
import sidebarFluidConfigSource from '@/shared/hooks/use-resolved-fluid-config.ts?raw'

// The app sidebar is composed from `app-sidebar.tsx` plus extracted sub-components under
// `ui/sidebar/components/**`. Contract assertions about the whole product surface check this
// combined tree instead of a single file so they stay valid across internal decomposition.
const appSidebarTreeSource = [
  appSidebarSource,
  appSidebarAdminItemSource,
  appSidebarFooterSource,
  appSidebarIdentitySource,
  newSidebarMenuSource,
  resourceRowsSource,
  sidebarCategoriesSource,
  sidebarCategoryBlockSource,
  sidebarCategorySheetSource,
  sidebarEmptyStateSource,
  sidebarResourceListSource,
].join('\n')

const productionSidebars = [
  {
    name: 'app sidebar',
    source: appSidebarTreeSource,
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
    expect(appSidebarTreeSource).toContain('active={active}')
    expect(appSidebarTreeSource).not.toContain('Current')
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
    expect(sidebarFluidConfigSource).toContain('GLASS_FLUID_PRESETS[fluidPreset]')
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
    expect(mobileSidebarDockSource).toContain('expressiveDock && canAnimate')
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
    expect(sidebarItemSource).toContain('data-sidebar-active-indicator')
    expect(sidebarItemSource).toContain('className={sidebarActiveIndicatorVariants({ design })}')
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
    expect(appSidebarTreeSource).toContain('SheetContent')
    expect(appSidebarTreeSource).toContain('activeCategory')
  })

  it('app sidebar categories preview a few items inline under muted clickable headers', () => {
    expect(appSidebarTreeSource).toContain('sidebarCategoryPreviewLimit = 3')
    expect(appSidebarTreeSource).toContain('Show {count - sidebarCategoryPreviewLimit} more')
    expect(appSidebarTreeSource).toContain('uppercase tracking-[0.16em]')
  })

  it('empty sidebar categories explain themselves inline instead of opening a panel', () => {
    expect(appSidebarTreeSource).toContain('emptyHint')
    expect(appSidebarTreeSource).toContain('count === 0 ? (')
    expect(appSidebarTreeSource).not.toContain('bg-sidebar-accent/35')
  })

  it('active navigation state relies on the accent surface without a left bar marker', () => {
    expect(sidebarItemSource).not.toContain('w-1 rounded-full bg-sidebar-primary')
    expect(appSidebarSource).not.toContain('w-1 rounded-full bg-sidebar-primary')
  })

  it('new room and server actions open a dedicated modal instead of an inline flyout form', () => {
    expect(appSidebarTreeSource).toContain('DialogContent')
    expect(appSidebarTreeSource).not.toContain('variant="compact"')
    expect(appSidebarTreeSource).not.toContain('Create and open a watch room.')
  })

  it('sidebar rows stay quiet: no status chips, categories separated by hairlines', () => {
    expect(appSidebarSource).not.toContain('{room.badge')
    expect(appSidebarSource).toContain('border-t border-sidebar-border/60')
  })
})
