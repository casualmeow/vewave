import { motion } from 'motion/react'
import { animatedLayoutId } from '../../../helpers/utils'
import { resizableMediaCardVariants } from '../../../constants'
import { MediaDefaultImage } from './media-default-image'
import type {
  CardRenderState,
  ResizableCardItem,
  ResizableCardListItemPresentationProps,
} from '../../../types'
import { cx } from '@/shared/lib/utils'

export type MediaCardListItemProps<T extends ResizableCardItem> =
  ResizableCardListItemPresentationProps<T>

const mediaHeightBySize = {
  sm: 'aspect-[4/3]',
  default: 'aspect-[4/3]',
  lg: 'aspect-[4/3]',
}

const contentPaddingBySize = {
  sm: 'px-3 pb-4 pt-3',
  default: 'px-4 pb-5 pt-4',
  lg: 'px-5 pb-6 pt-5',
}

export function MediaCardListItem<T extends ResizableCardItem>({
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
        resizableMediaCardVariants({
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
          'relative w-full shrink-0 overflow-hidden rounded-xl bg-muted',
          mediaHeightBySize[size],
        )}
      >
        {renderMedia ? renderMedia(item, state) : <MediaDefaultImage item={item} />}
      </motion.div>

      <div className={cx('flex flex-1 flex-col items-start text-left', contentPaddingBySize[size])}>
        <motion.h3
          layoutId={animatedLayoutId(animation, scopeId, 'title', item.id)}
          layout="position"
          transition={animation.text}
          className="text-base font-semibold leading-tight tracking-tight text-foreground"
        >
          {renderTitle ? renderTitle(item, state) : item.title}
        </motion.h3>

        {item.description ? (
          <motion.div
            layoutId={animatedLayoutId(animation, scopeId, 'description', item.id)}
            layout="position"
            transition={animation.text}
            className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground"
          >
            {renderDescription ? renderDescription(item, state) : item.description}
          </motion.div>
        ) : null}
      </div>
    </motion.button>
  )
}
