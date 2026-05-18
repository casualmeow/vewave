import type {
  ResizableCardPresentation as ComponentResizableCardPresentation,
  ResizableCardAnimationFamily,
  ResizableCardAnimationPreset,
  ResizableCardVariant,
  ResizableCardSizeVariant,
} from '@/components/resizable-card'
import type {
  HeaderSize,
  HeaderVariant,
  HeaderBlurIntensity,
  HeaderCollapseBehavior,
  HeaderMotionPreset,
} from '@/components/header'

export type ContentDensity = 'compact' | 'comfortable' | 'dense'

export type ResizableCardPresentation = ComponentResizableCardPresentation
export type ResizableCardAnimationFamilyFilter = ResizableCardAnimationFamily | 'all'

export type ResizableCardShowcaseState = {
  presentation: ResizableCardPresentation
  animationPreset: ResizableCardAnimationPreset
  animationFamily: ResizableCardAnimationFamilyFilter
  variant: ResizableCardVariant
  size: ResizableCardSizeVariant
  resizable: boolean
  closeOnBackdropClick: boolean
  closeOnEscape: boolean
  lockBodyScroll: boolean
  showMedia: boolean
  showAction: boolean
  density: ContentDensity
  compactMinHeight: number
  initialWidth: number
  initialHeight: number
  minWidth: number
  minHeight: number
  maxWidth: number
  maxHeight: number
}

type HeaderButtonVariant = 'default' | 'ghost' | 'outline' | 'soft'
type ActiveNavItem = 'overview' | 'rooms' | 'studio' | 'billing'

export type HeaderPlaygroundState = {
  variant: HeaderVariant
  size: HeaderSize
  blurIntensity: HeaderBlurIntensity
  showGlow: boolean
  glowColor: string
  initialWidth: number
  collapsedWidth: number
  topOffset: number
  borderRadiusExpanded: number
  borderRadiusCollapsed: number
  collapseBehavior: HeaderCollapseBehavior
  collapsed: boolean
  hideNavOnCollapse: boolean
  hideOnScrollDown: boolean
  scrollDistance: number
  collapseThreshold: number
  motionPreset: HeaderMotionPreset
  smoothScrollMotion: boolean
  showLogo: boolean
  showNavigation: boolean
  showActions: boolean
  activeNavItem: ActiveNavItem
  showDisabledNavItem: boolean
  loadingPrimaryAction: boolean
  primaryActionVariant: HeaderButtonVariant
}
