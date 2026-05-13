import { CardListItem } from './card-list-item'
import type { CompactCardSize, ExpandableCardItem, ExpandableCardsProps } from '../types'
import { cx } from '@/shared/lib/utils'

type ExpandableCardListProps<T extends ExpandableCardItem> = ExpandableCardsProps<T> & {
  scopeId: string
  activeId: string | null
  compactSize: CompactCardSize
  openItem: (item: T) => void
  closeItem: () => void
}

export function ExpandableCardList<T extends ExpandableCardItem>({
  items,
  scopeId,
  activeId,
  compactSize,
  openItem,
  closeItem,
  className,
  listClassName,
  ...props
}: ExpandableCardListProps<T>) {
  return (
    <div className={className}>
      <ul className={cx('mx-auto grid w-full max-w-3xl gap-3', listClassName)}>
        {items.map((item) => (
          <li key={item.id}>
            <CardListItem
              {...props}
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
