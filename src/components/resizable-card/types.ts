import { type CSSProperties, type ReactNode } from 'react'

export type CardRenderState = {
  expanded: boolean
  open: () => void
  close: () => void
}

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

export type ExpandableCardsProps<T extends ExpandableCardItem> = {
  items: ReadonlyArray<T>

  compactSize?: {
    width?: CSSProperties['width']
    minHeight?: CSSProperties['minHeight']
  }

  expandedSize?: {
    initialWidth?: number
    initialHeight?: number
    minWidth?: number
    minHeight?: number
    maxWidth?: number
    maxHeight?: number
    viewportPadding?: number
  }

  resizable?: boolean
  closeOnBackdropClick?: boolean
  closeOnEscape?: boolean
  lockBodyScroll?: boolean

  className?: string
  listClassName?: string
  cardClassName?: string
  dialogClassName?: string
  contentClassName?: string

  renderMedia?: (item: T, state: CardRenderState) => ReactNode
  renderTitle?: (item: T, state: CardRenderState) => ReactNode
  renderDescription?: (item: T, state: CardRenderState) => ReactNode
  renderAction?: (item: T, state: CardRenderState) => ReactNode
  renderContent?: (item: T) => ReactNode

  onActiveItemChange?: (item: T | null) => void
}

export type DialogSize = {
  width: number
  height: number
}
