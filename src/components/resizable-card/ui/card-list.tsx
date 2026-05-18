import { CardListItem } from './card-list-item'
import type {
  CompactCardSize,
  ResizableCardItem,
  ResizableCardsProps,
  ResizableCardResolvedTransition,
} from '../types'
import { cx } from '@/shared/lib/utils'

type ResizableCardListProps<T extends ResizableCardItem> = ResizableCardsProps<T> & {
  scopeId: string
  activeId: string | null
  compactSize: CompactCardSize
  animation: ResizableCardResolvedTransition
  openItem: (item: T) => void
  closeItem: () => void
}

export function ResizableCardList<T extends ResizableCardItem>({
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
}: ResizableCardListProps<T>) {
  const defaultListClassName =
    presentation === 'media'
      ? 'mx-auto grid w-full max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3'
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
