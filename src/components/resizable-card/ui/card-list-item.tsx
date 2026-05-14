import { InlineCardListItem } from './presentations/inline/inline-card-list-item'
import { MediaCardListItem } from './presentations/media/media-card-list-item'
import { StandardCardListItem } from './presentations/standard/standard-card-list-item'
import type { InlineCardListItemProps } from './presentations/inline/inline-card-list-item'
import type { ExpandableCardItem } from '../types'

type CardListItemProps<T extends ExpandableCardItem> = InlineCardListItemProps<T>

export function CardListItem<T extends ExpandableCardItem>({
  presentation = 'inline',
  ...props
}: CardListItemProps<T>) {
  if (presentation === 'media') {
    return <MediaCardListItem presentation={presentation} {...props} />
  }

  if (presentation === 'standard') {
    return <StandardCardListItem presentation={presentation} {...props} />
  }

  return <InlineCardListItem presentation={presentation} {...props} />
}
