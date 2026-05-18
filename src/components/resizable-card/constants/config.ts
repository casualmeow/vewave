import { type ResizableCardItem, type ResizableCardsProps } from '../types'

export const DEFAULT_COMPACT_SIZE = {
  width: '100%',
  minHeight: '7rem',
} satisfies NonNullable<ResizableCardsProps<ResizableCardItem>['compactSize']>

export const DEFAULT_EXPANDED_SIZE = {
  initialWidth: 720,
  initialHeight: 640,
  minWidth: 360,
  minHeight: 420,
  maxWidth: 1100,
  maxHeight: 900,
  viewportPadding: 16,
} satisfies NonNullable<ResizableCardsProps<ResizableCardItem>['expandedSize']>
