import { motion } from 'motion/react'
import { layoutId } from '../helpers'
import { expandableCardVariants } from '../constants'
import { DefaultAction, DefaultMedia } from './default-renders'
import type {
  CardRenderState,
  CompactCardSize,
  ExpandableCardItem,
  ExpandableCardsProps,
} from '../types'
import { cx } from '@/shared/lib/utils'

type ExpandableCardListItemProps<T extends ExpandableCardItem> = Omit<
  ExpandableCardsProps<T>,
  'items'
> & {
  item: T
  scopeId: string
  isActive: boolean
  compactSize: CompactCardSize
  openItem: (item: T) => void
  closeItem: () => void
}

export function CardListItem<T extends ExpandableCardItem>({
  item,
  scopeId,
  isActive,
  compactSize,
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
}: ExpandableCardListItemProps<T>) {
  const state: CardRenderState = {
    expanded: false,
    open: () => openItem(item),
    close: closeItem,
  }

  return (
    <motion.button
      type="button"
      layoutId={layoutId(scopeId, 'card', item.id)}
      aria-haspopup="dialog"
      aria-expanded={isActive}
      onClick={state.open}
      style={{
        width: compactSize.width,
        minHeight: compactSize.minHeight,
      }}
      className={cx(
        expandableCardVariants({
          variant,
          size,
          active: isActive,
        }),
        cardClassName,
      )}
    >
      <div className="flex min-w-0 items-center gap-4">
        <motion.div layoutId={layoutId(scopeId, 'media', item.id)} className="shrink-0">
          {renderMedia ? renderMedia(item, state) : <DefaultMedia item={item} state={state} />}
        </motion.div>

        <div className="min-w-0">
          <motion.h3
            layoutId={layoutId(scopeId, 'title', item.id)}
            className="truncate font-semibold text-foreground"
          >
            {renderTitle ? renderTitle(item, state) : item.title}
          </motion.h3>

          {item.description ? (
            <motion.div
              layoutId={layoutId(scopeId, 'description', item.id)}
              className="mt-1 line-clamp-2 text-sm text-muted-foreground"
            >
              {renderDescription ? renderDescription(item, state) : item.description}
            </motion.div>
          ) : null}
        </div>
      </div>

      <motion.div layoutId={layoutId(scopeId, 'action', item.id)} className="shrink-0">
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
