import { InlineCardListItem } from './presentations/inline/inline-card-list-item'
import { MediaCardListItem } from './presentations/media/media-card-list-item'
import type { ResizableCardItem, ResizableCardListItemPresentationProps } from '../types'

type CardListItemProps<T extends ResizableCardItem> = ResizableCardListItemPresentationProps<T>

export function CardListItem<T extends ResizableCardItem>({
  presentation = 'inline',
  ...props
}: CardListItemProps<T>) {
  if (presentation === 'media') {
    return <MediaCardListItem presentation={presentation} {...props} />
  }

  return <InlineCardListItem presentation={presentation} {...props} />
}
