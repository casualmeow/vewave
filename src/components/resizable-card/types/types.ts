import {
  type CSSProperties,
  type ReactNode,
  type RefObject,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { type VariantProps } from 'class-variance-authority'
import { type expandableCardVariants } from './constants/variants'

export type CardRenderState = {
  expanded: boolean
  open: () => void
  close: () => void
}

export type ExpandableCardVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive'

export type ExpandableCardSizeVariant = 'sm' | 'default' | 'lg'

export type ExpandableCardItem = {
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

export type CardVariants = VariantProps<typeof expandableCardVariants>

export type ExpandableCardsProps<T extends ExpandableCardItem> = {
  items: ReadonlyArray<T>

  /**
   * Shared visual tone for the compact card and expanded dialog.
   */
  variant?: ExpandableCardVariant

  /**
   * Shared structural size for the compact card and dialog corner treatment.
   */
  size?: ExpandableCardSizeVariant

  /**
   * Optional visual overrides for internal sub-parts.
   */
  dialogVariant?: ExpandableCardVariant
  actionVariant?: ExpandableCardVariant
  actionSize?: ExpandableCardSizeVariant
  iconButtonVariant?: ExpandableCardVariant
  iconButtonSize?: ExpandableCardSizeVariant

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

export type ExpandableCardListItemController<T extends ExpandableCardItem> = {
  item: T
  scopeId: string
  isActive: boolean
  compactSize: CompactCardSize
  openItem: (item: T) => void
  closeItem: () => void
}

export type ExpandableCardDialogController<T extends ExpandableCardItem> = {
  activeItem: T | null
  scopeId: string
  dialogSize: DialogSize
  closeItem: () => void
  openItem: (item: T) => void
  closeButtonRef: RefObject<HTMLButtonElement | null>
  handleResizeStart: (event: ReactPointerEvent<HTMLButtonElement>) => void
}
