import { motion } from 'motion/react'
import { animatedLayoutId } from '../../../helpers'
import { expandableMediaCardVariants } from '../../../constants'
import type {
  CardRenderState,
  CompactCardSize,
  ExpandableCardItem,
  ExpandableCardsProps,
  ResizableCardResolvedTransition,
} from '../../../types'
import { cx } from '@/shared/lib/utils'

export type MediaCardListItemProps<T extends ExpandableCardItem> = Omit<
  ExpandableCardsProps<T>,
  'items'
> & {
  item: T
  scopeId: string
  isActive: boolean
  compactSize: CompactCardSize
  animation: ResizableCardResolvedTransition
  openItem: (item: T) => void
  closeItem: () => void
}

const mediaHeightBySize = {
  sm: 'h-48',
  default: 'h-60',
  lg: 'h-72',
}

const contentPaddingBySize = {
  sm: 'pt-3',
  default: 'pt-4',
  lg: 'pt-5',
}

export function MediaCardListItem<T extends ExpandableCardItem>({
  item,
  scopeId,
  isActive,
  compactSize,
  animation,
  openItem,
  closeItem,
  variant = 'default',
  size = 'default',
  cardClassName,
  renderMedia,
  renderTitle,
  renderDescription,
}: MediaCardListItemProps<T>) {
  const state: CardRenderState = {
    expanded: false,
    open: () => openItem(item),
    close: closeItem,
  }

  return (
    <motion.button
      type="button"
      layoutId={animatedLayoutId(animation, scopeId, 'card', item.id)}
      transition={animation.container}
      aria-haspopup="dialog"
      aria-expanded={isActive}
      onClick={state.open}
      style={{
        width: compactSize.width,
        minHeight: compactSize.minHeight,
      }}
      className={cx(
        expandableMediaCardVariants({
          variant,
          size,
          active: isActive,
        }),
        cardClassName,
      )}
    >
      <motion.div
        layoutId={animatedLayoutId(animation, scopeId, 'media', item.id)}
        transition={animation.media}
        className={cx(
          'relative w-full shrink-0 overflow-hidden rounded-lg bg-muted',
          mediaHeightBySize[size],
        )}
      >
        {renderMedia ? renderMedia(item, state) : <MediaDefaultImage item={item} />}
      </motion.div>

      <div
        className={cx(
          'flex flex-1 flex-col items-center justify-center text-center',
          contentPaddingBySize[size],
        )}
      >
        <motion.h3
          layoutId={animatedLayoutId(animation, scopeId, 'title', item.id)}
          layout="position"
          transition={animation.text}
          className="text-base font-medium leading-tight text-foreground"
        >
          {renderTitle ? renderTitle(item, state) : item.title}
        </motion.h3>

        {item.description ? (
          <motion.div
            layoutId={animatedLayoutId(animation, scopeId, 'description', item.id)}
            layout="position"
            transition={animation.text}
            className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground"
          >
            {renderDescription ? renderDescription(item, state) : item.description}
          </motion.div>
        ) : null}
      </div>
    </motion.button>
  )
}

function MediaDefaultImage<T extends ExpandableCardItem>({ item }: { item: T }) {
  if (!item.src) return null

  return (
    <img
      src={item.src}
      alt={item.imageAlt ?? ''}
      className="h-full w-full object-cover object-top"
    />
  )
}
