import { motion } from 'motion/react'
import { animatedLayoutId, resolveCardContent } from '../../../helpers/utils'
import {
  resizableContentVariants,
  resizableDialogVariants,
  resizableIconButtonVariants,
  resizableResizeHandleVariants,
} from '../../../constants'
import { CloseIcon } from '../../close-icon'
import { ResizeHandleIcon } from '../../resize-handle-icon'
import { DefaultAction } from '../../default-renders'
import { MediaDefaultImage } from './media-default-image'
import type {
  CardRenderState,
  ResizableCardDialogPresentationProps,
  ResizableCardItem,
} from '../../../types'
import { cx } from '@/shared/lib/utils'

export type MediaCardDialogSurfaceProps<T extends ResizableCardItem> =
  ResizableCardDialogPresentationProps<T>

const mediaHeightBySize = {
  sm: 'h-56',
  default: 'h-72',
  lg: 'h-80',
}

export function MediaCardDialogSurface<T extends ResizableCardItem>({
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
        resizableDialogVariants({
          variant: dialogVariant ?? variant,
          size,
        }),
        'shadow-[0_24px_80px_rgba(15,23,42,0.22)] ring-1 ring-border/60',
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
          resizableIconButtonVariants({
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
        <div className="grid shrink-0 gap-4 p-5 pr-16 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:p-6 sm:pr-16">
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
            resizableContentVariants({
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
          className={resizableResizeHandleVariants({
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
