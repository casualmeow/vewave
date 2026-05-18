import {
  type CSSProperties,
  type ReactNode,
  type RefObject,
  type PointerEvent as ReactPointerEvent,
  type PointerEventHandler,
} from 'react'
import { type VariantProps } from 'class-variance-authority'
import { type resizableCardVariants } from '../constants/variants'
import type { Transition } from 'motion/react'

export type CardRenderState = {
  expanded: boolean
  open: () => void
  close: () => void
}

export type ResizableCardVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive'

export type ResizableCardPresentation = 'inline' | 'media'

export type ResizableCardSizeVariant = 'sm' | 'default' | 'lg'

export type ResizableCardAnimationPreset =
  | 'container-morph'
  | 'soft-container-morph'
  | 'media-led-morph'
  | 'content-led-morph'
  | 'shape-shift'
  | 'elevation-lift'
  | 'surface-grow'
  | 'slide-up-expand'
  | 'slide-down-expand'
  | 'slide-left-expand'
  | 'slide-right-expand'
  | 'shared-axis-x'
  | 'shared-axis-y'
  | 'fade-scale'
  | 'container-fade'
  | 'crossfade-details'
  | 'fade-through'
  | 'spring-pop'
  | 'elastic-settle'
  | 'squash-lift'
  | 'overshoot-settle'
  | 'tilt-unfold'
  | 'flip-lite'
  | 'media-spotlight'
  | 'blur-reveal'
  | 'shimmer-handoff'
  | 'staggered-details'
  | 'instant'

export type ResizableCardAnimationFamily = 'morph' | 'axis' | 'fade' | 'expressive' | 'content'

export type ResizableCardPresetRecommendation = 'inline' | 'media' | 'both'

export type ResizableCardSharedLayoutPart = 'card' | 'media' | 'title' | 'description' | 'action'

export type ResizableCardSharedLayoutConfig = Record<ResizableCardSharedLayoutPart, boolean>

type ResizableCardMotionTarget = {
  opacity?: number
  scale?: number
  scaleX?: number
  scaleY?: number
  x?: number | string
  y?: number
  rotate?: number
  rotateX?: number
  rotateY?: number
  filter?: string
  transformPerspective?: number
}

export type ResizableCardPresenceConfig = {
  initial?: ResizableCardMotionTarget
  animate?: ResizableCardMotionTarget
  exit?: ResizableCardMotionTarget
}

export type ResizableCardAnimationPresetDefinition = {
  id: ResizableCardAnimationPreset
  label: string
  family: ResizableCardAnimationFamily
  description: string
  recommendedPresentation: ResizableCardPresetRecommendation
  sharedLayout: ResizableCardSharedLayoutConfig
  container: Transition
  backdrop: Transition
  media: Transition
  text: Transition
  action: Transition
  content: Transition
  presence: {
    dialog: ResizableCardPresenceConfig
    backdrop: ResizableCardPresenceConfig
    action: ResizableCardPresenceConfig
    content: ResizableCardPresenceConfig
  }
  layout: {
    action: boolean
    content: boolean
  }
  backdropClassName?: string
  dialogClassName?: string
  contentClassName?: string
}

export type ResizableCardResolvedTransition = ResizableCardAnimationPresetDefinition

export type ResizableCardItem = {
  id: string
  title: ReactNode
  description?: ReactNode
  src?: string
  imageAlt?: string
  ctaText?: ReactNode
  ctaLink?: string
  content?: ReactNode | (() => ReactNode)
}

export type CompactCardSize = {
  width?: CSSProperties['width']
  minHeight?: CSSProperties['minHeight']
}

export type ExpandedCardSize = {
  initialWidth?: number
  initialHeight?: number
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  viewportPadding?: number
}

export type DialogSize = {
  width: number
  height: number
}

export type CardVariants = VariantProps<typeof resizableCardVariants>

export type ResizableCardsProps<T extends ResizableCardItem> = {
  items: ReadonlyArray<T>

  /**
   * Structural presentation for compact and expanded card geometry.
   */
  presentation?: ResizableCardPresentation

  /**
   * Shared visual tone for the compact card and expanded dialog.
   */
  variant?: ResizableCardVariant

  /**
   * Shared structural size for the compact card and dialog corner treatment.
   */
  size?: ResizableCardSizeVariant

  /**
   * Motion strategy used when compact cards open into the expanded dialog.
   */
  animationPreset?: ResizableCardAnimationPreset

  /**
   * Optional visual overrides for internal sub-parts.
   */
  dialogVariant?: ResizableCardVariant
  actionVariant?: ResizableCardVariant
  actionSize?: ResizableCardSizeVariant
  iconButtonVariant?: ResizableCardVariant
  iconButtonSize?: ResizableCardSizeVariant

  compactSize?: CompactCardSize
  expandedSize?: ExpandedCardSize

  resizable?: boolean
  closeOnBackdropClick?: boolean
  closeOnEscape?: boolean
  lockBodyScroll?: boolean

  className?: string
  listClassName?: string
  cardClassName?: string
  dialogClassName?: string
  contentClassName?: string
  backdropClassName?: string

  renderMedia?: (item: T, state: CardRenderState) => ReactNode
  renderTitle?: (item: T, state: CardRenderState) => ReactNode
  renderDescription?: (item: T, state: CardRenderState) => ReactNode
  renderAction?: (item: T, state: CardRenderState) => ReactNode
  renderContent?: (item: T) => ReactNode

  onActiveItemChange?: (item: T | null) => void
}

export type ResizableCardListItemController<T extends ResizableCardItem> = {
  item: T
  scopeId: string
  isActive: boolean
  compactSize: CompactCardSize
  openItem: (item: T) => void
  closeItem: () => void
}

export type ResizableCardListItemPresentationProps<T extends ResizableCardItem> = Omit<
  ResizableCardsProps<T>,
  'items'
> &
  ResizableCardListItemController<T> & {
    animation: ResizableCardResolvedTransition
  }

export type ResizableCardDialogController<T extends ResizableCardItem> = {
  activeItem: T | null
  scopeId: string
  dialogSize: DialogSize
  closeItem: () => void
  openItem: (item: T) => void
  closeButtonRef: RefObject<HTMLButtonElement | null>
  handleResizeStart: (event: ReactPointerEvent<HTMLButtonElement>) => void
}

export type ResizableCardDialogPresentationProps<T extends ResizableCardItem> = Omit<
  ResizableCardsProps<T>,
  'items'
> &
  Omit<ResizableCardDialogController<T>, 'activeItem' | 'handleResizeStart'> & {
    activeItem: T
    animation: ResizableCardResolvedTransition
    handleResizeStart: PointerEventHandler<HTMLButtonElement>
  }
