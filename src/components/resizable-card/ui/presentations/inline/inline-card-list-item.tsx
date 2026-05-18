import { motion } from 'motion/react'
import { animatedLayoutId } from '../../../helpers'
import { resizableCardVariants } from '../../../constants'
import { DefaultAction, DefaultMedia } from '../../default-renders'
import type {
  CardRenderState,
  ResizableCardItem,
  ResizableCardListItemPresentationProps,
} from '../../../types'
import { cx } from '@/shared/lib/utils'

export type InlineCardListItemProps<T extends ResizableCardItem> =
  ResizableCardListItemPresentationProps<T>

export function InlineCardListItem<T extends ResizableCardItem>({
  item,
  scopeId,
  isActive,
  compactSize,
  animation,
  openItem,
  closeItem,
  variant = 'default',
  size = 'default',
  actionVariant,
  actionSize = 'default',
  cardClassName,
  renderMedia,
  renderTitle,
  renderDescription,
  renderAction,
}: InlineCardListItemProps<T>) {
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
        resizableCardVariants({
          variant,
          size,
          active: isActive,
        }),
        cardClassName,
      )}
    >
      <div className="flex min-w-0 items-center gap-4">
        <motion.div
          layoutId={animatedLayoutId(animation, scopeId, 'media', item.id)}
          transition={animation.media}
          className="shrink-0"
        >
          {renderMedia ? renderMedia(item, state) : <DefaultMedia item={item} state={state} />}
        </motion.div>

        <div className="min-w-0">
          <motion.h3
            layoutId={animatedLayoutId(animation, scopeId, 'title', item.id)}
            layout="position"
            transition={animation.text}
            className="truncate font-semibold text-foreground"
          >
            {renderTitle ? renderTitle(item, state) : item.title}
          </motion.h3>

          {item.description ? (
            <motion.div
              layoutId={animatedLayoutId(animation, scopeId, 'description', item.id)}
              layout="position"
              transition={animation.text}
              className="mt-1 line-clamp-2 text-sm text-muted-foreground"
            >
              {renderDescription ? renderDescription(item, state) : item.description}
            </motion.div>
          ) : null}
        </div>
      </div>

      <motion.div
        layoutId={animatedLayoutId(animation, scopeId, 'action', item.id)}
        transition={animation.action}
        className="shrink-0"
      >
        {renderAction ? (
          renderAction(item, state)
        ) : (
          <DefaultAction
            item={item}
            state={state}
            variant={actionVariant ?? variant}
            size={actionSize}
          />
        )}
      </motion.div>
    </motion.button>
  )
}
