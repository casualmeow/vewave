import { CardListItem } from './card-list-item'
import type {
  CompactCardSize,
  ExpandableCardItem,
  ExpandableCardsProps,
  ResizableCardResolvedTransition,
} from '../types'
import { cx } from '@/shared/lib/utils'

type ExpandableCardListProps<T extends ExpandableCardItem> = ExpandableCardsProps<T> & {
  scopeId: string
  activeId: string | null
  compactSize: CompactCardSize
  animation: ResizableCardResolvedTransition
  openItem: (item: T) => void
  closeItem: () => void
}

export function ExpandableCardList<T extends ExpandableCardItem>({
  items,
  scopeId,
  activeId,
  compactSize,
  animation,
  openItem,
  closeItem,
  className,
  listClassName,
  presentation = 'inline',
  ...props
}: ExpandableCardListProps<T>) {
  const defaultListClassName =
    presentation === 'media'
      ? 'mx-auto grid w-full max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3'
      : presentation === 'standard'
        ? 'mx-auto grid w-full max-w-2xl gap-4'
        : 'mx-auto grid w-full max-w-3xl gap-3'

  return (
    <div className={className}>
      <ul className={cx(defaultListClassName, listClassName)}>
        {items.map((item) => (
          <li key={item.id}>
            <CardListItem
              {...props}
              presentation={presentation}
              animation={animation}
              item={item}
              scopeId={scopeId}
              isActive={item.id === activeId}
              compactSize={compactSize}
              openItem={openItem}
              closeItem={closeItem}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
