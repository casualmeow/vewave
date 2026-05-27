import { motion } from 'motion/react'
import { animatedLayoutId, resolveCardContent } from '../../../hooks/helpers'
import {
  resizableContentVariants,
  resizableDialogVariants,
  resizableIconButtonVariants,
  resizableResizeHandleVariants,
} from '../../../constants'
import { CloseIcon } from '../../close-icon'
import { ResizeHandleIcon } from '../../resize-handle-icon'
import { DefaultAction, DefaultMedia } from '../../default-renders'
import type {
  CardRenderState,
  ResizableCardDialogPresentationProps,
  ResizableCardItem,
} from '../../../types'
import { cx } from '@/shared/lib/utils'

export type InlineCardDialogSurfaceProps<T extends ResizableCardItem> =
  ResizableCardDialogPresentationProps<T>

export function InlineCardDialogSurface<T extends ResizableCardItem>({
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
}: InlineCardDialogSurfaceProps<T>) {
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
        className="shrink-0"
      >
        {renderMedia ? (
          renderMedia(activeItem, state)
        ) : (
          <DefaultMedia item={activeItem} state={state} />
        )}
      </motion.div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border p-5">
          <div className="min-w-0">
            <motion.h3
              id={`${scopeId}-${activeItem.id}-title`}
              layoutId={animatedLayoutId(animation, scopeId, 'title', activeItem.id)}
              layout="position"
              transition={animation.text}
              className="text-lg font-semibold text-foreground"
            >
              {renderTitle ? renderTitle(activeItem, state) : activeItem.title}
            </motion.h3>

            {activeItem.description ? (
              <motion.div
                id={`${scopeId}-${activeItem.id}-description`}
                layoutId={animatedLayoutId(animation, scopeId, 'description', activeItem.id)}
                layout="position"
                transition={animation.text}
                className="mt-1 text-sm text-muted-foreground"
              >
                {renderDescription ? renderDescription(activeItem, state) : activeItem.description}
              </motion.div>
            ) : null}
          </div>

          <motion.div
            layoutId={animatedLayoutId(animation, scopeId, 'action', activeItem.id)}
            transition={animation.action}
            className="shrink-0 pr-12"
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
