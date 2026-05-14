import { type PointerEventHandler, type RefObject } from 'react'
import { motion } from 'motion/react'
import { animatedLayoutId, resolveCardContent } from '../../../helpers'
import {
  expandableContentVariants,
  expandableDialogVariants,
  expandableIconButtonVariants,
  expandableResizeHandleVariants,
} from '../../../constants'
import { CloseIcon } from '../../close-icon'
import { ResizeHandleIcon } from '../../resize-handle-icon'
import { DefaultAction } from '../../default-renders'
import type {
  CardRenderState,
  DialogSize,
  ExpandableCardItem,
  ExpandableCardsProps,
  ResizableCardResolvedTransition,
} from '../../../types'
import { cx } from '@/shared/lib/utils'

export type MediaCardDialogSurfaceProps<T extends ExpandableCardItem> = Omit<
  ExpandableCardsProps<T>,
  'items'
> & {
  activeItem: T
  scopeId: string
  dialogSize: DialogSize
  animation: ResizableCardResolvedTransition
  closeItem: () => void
  openItem: (item: T) => void
  closeButtonRef: RefObject<HTMLButtonElement | null>
  handleResizeStart: PointerEventHandler<HTMLButtonElement>
}

const mediaHeightBySize = {
  sm: 'h-52',
  default: 'h-64',
  lg: 'h-80',
}

export function MediaCardDialogSurface<T extends ExpandableCardItem>({
  activeItem,
  scopeId,
  dialogSize,
  animation,
  closeItem,
  openItem,
  closeButtonRef,
  handleResizeStart,
  variant = 'default',
  size = 'default',
  dialogVariant,
  actionVariant,
  actionSize = 'default',
  iconButtonVariant,
  iconButtonSize = 'default',
  resizable = true,
  dialogClassName,
  contentClassName,
  renderMedia,
  renderTitle,
  renderDescription,
  renderAction,
  renderContent,
}: MediaCardDialogSurfaceProps<T>) {
  const state: CardRenderState = {
    expanded: true,
    open: () => openItem(activeItem),
    close: closeItem,
  }

  return (
    <motion.section
      layoutId={animatedLayoutId(animation, scopeId, 'card', activeItem.id)}
      initial={animation.presence.dialog.initial}
      animate={animation.presence.dialog.animate}
      exit={animation.presence.dialog.exit}
      transition={animation.container}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${scopeId}-${activeItem.id}-title`}
      aria-describedby={
        activeItem.description ? `${scopeId}-${activeItem.id}-description` : undefined
      }
      style={{
        width: dialogSize.width,
        height: dialogSize.height,
      }}
      className={cx(
        expandableDialogVariants({
          variant: dialogVariant ?? variant,
          size,
        }),
        animation.dialogClassName,
        dialogClassName,
      )}
    >
      <button
        ref={closeButtonRef}
        type="button"
        aria-label="Close expanded card"
        onClick={closeItem}
        className={cx(
          'absolute right-4 top-4 z-20',
          expandableIconButtonVariants({
            variant: iconButtonVariant ?? variant,
            size: iconButtonSize,
          }),
        )}
      >
        <CloseIcon />
      </button>

      <motion.div
        layoutId={animatedLayoutId(animation, scopeId, 'media', activeItem.id)}
        transition={animation.media}
        className={cx('relative w-full shrink-0 overflow-hidden bg-muted', mediaHeightBySize[size])}
      >
        {renderMedia ? renderMedia(activeItem, state) : <MediaDefaultImage item={activeItem} />}
      </motion.div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="grid shrink-0 gap-4 border-b border-border p-5 pr-16 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
          <div className="min-w-0">
            <motion.h3
              id={`${scopeId}-${activeItem.id}-title`}
              layoutId={animatedLayoutId(animation, scopeId, 'title', activeItem.id)}
              layout="position"
              transition={animation.text}
              className="text-2xl font-semibold tracking-tight text-foreground"
            >
              {renderTitle ? renderTitle(activeItem, state) : activeItem.title}
            </motion.h3>

            {activeItem.description ? (
              <motion.div
                id={`${scopeId}-${activeItem.id}-description`}
                layoutId={animatedLayoutId(animation, scopeId, 'description', activeItem.id)}
                layout="position"
                transition={animation.text}
                className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground"
              >
                {renderDescription ? renderDescription(activeItem, state) : activeItem.description}
              </motion.div>
            ) : null}
          </div>

          <motion.div
            layout={animation.layout.action}
            initial={animation.presence.action.initial}
            animate={animation.presence.action.animate}
            exit={animation.presence.action.exit}
            transition={animation.action}
            className="shrink-0"
          >
            {renderAction ? (
              renderAction(activeItem, state)
            ) : (
              <DefaultAction
                item={activeItem}
                state={state}
                variant={actionVariant ?? variant}
                size={actionSize}
              />
            )}
          </motion.div>
        </div>

        <motion.div
          layout={animation.layout.content}
          initial={animation.presence.content.initial}
          animate={animation.presence.content.animate}
          exit={animation.presence.content.exit}
          transition={animation.content}
          className={cx(
            expandableContentVariants({
              variant: dialogVariant ?? variant,
            }),
            '[mask:linear-gradient(to_bottom,white_85%,transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
            animation.contentClassName,
            contentClassName,
          )}
        >
          {resolveCardContent(activeItem, renderContent)}
        </motion.div>
      </div>

      {resizable ? (
        <button
          type="button"
          aria-label="Resize expanded card"
          onPointerDown={handleResizeStart}
          className={expandableResizeHandleVariants({
            variant: iconButtonVariant ?? variant,
            size: iconButtonSize,
          })}
        >
          <ResizeHandleIcon />
        </button>
      ) : null}
    </motion.section>
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
