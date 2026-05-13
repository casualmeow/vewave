import { type PointerEventHandler, type RefObject, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { layoutId, resolveCardContent } from '../helpers'
import {
  expandableContentVariants,
  expandableDialogVariants,
  expandableIconButtonVariants,
  expandableResizeHandleVariants,
} from '../constants'
import { CloseIcon } from './close-icon'
import { ResizeHandleIcon } from './resize-handle-icon'
import { DefaultAction, DefaultMedia } from './default-renders'
import type {
  CardRenderState,
  DialogSize,
  ExpandableCardItem,
  ExpandableCardsProps,
} from '../types'
import { cx } from '@/shared/lib/utils'

type ExpandableCardDialogProps<T extends ExpandableCardItem> = Omit<
  ExpandableCardsProps<T>,
  'items'
> & {
  activeItem: T | null
  scopeId: string
  dialogSize: DialogSize
  closeItem: () => void
  openItem: (item: T) => void
  closeButtonRef: RefObject<HTMLButtonElement | null>
  handleResizeStart: PointerEventHandler<HTMLButtonElement>
}

export function ExpandableCardDialog<T extends ExpandableCardItem>({
  activeItem,
  scopeId,
  dialogSize,
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
  closeOnBackdropClick = true,
  dialogClassName,
  contentClassName,
  backdropClassName,
  renderMedia,
  renderTitle,
  renderDescription,
  renderAction,
  renderContent,
}: ExpandableCardDialogProps<T>) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {activeItem ? (
        <>
          <motion.div
            key="expandable-card-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cx(
              'fixed inset-0 z-[90] bg-black/40 backdrop-blur-[2px]',
              backdropClassName,
            )}
          />

          <div
            className="fixed inset-0 z-[100] grid place-items-center p-4"
            onMouseDown={(event) => {
              if (closeOnBackdropClick && event.target === event.currentTarget) {
                closeItem()
              }
            }}
          >
            <DialogSurface
              activeItem={activeItem}
              scopeId={scopeId}
              dialogSize={dialogSize}
              closeItem={closeItem}
              openItem={openItem}
              closeButtonRef={closeButtonRef}
              handleResizeStart={handleResizeStart}
              variant={variant}
              size={size}
              dialogVariant={dialogVariant}
              actionVariant={actionVariant}
              actionSize={actionSize}
              iconButtonVariant={iconButtonVariant}
              iconButtonSize={iconButtonSize}
              resizable={resizable}
              dialogClassName={dialogClassName}
              contentClassName={contentClassName}
              renderMedia={renderMedia}
              renderTitle={renderTitle}
              renderDescription={renderDescription}
              renderAction={renderAction}
              renderContent={renderContent}
            />
          </div>
        </>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}

type DialogSurfaceProps<T extends ExpandableCardItem> = Omit<
  ExpandableCardDialogProps<T>,
  'activeItem'
> & {
  activeItem: T
}

function DialogSurface<T extends ExpandableCardItem>({
  activeItem,
  scopeId,
  dialogSize,
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
}: DialogSurfaceProps<T>) {
  const state: CardRenderState = {
    expanded: true,
    open: () => openItem(activeItem),
    close: closeItem,
  }

  return (
    <motion.section
      layoutId={layoutId(scopeId, 'card', activeItem.id)}
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

      <motion.div layoutId={layoutId(scopeId, 'media', activeItem.id)} className="shrink-0">
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
              layoutId={layoutId(scopeId, 'title', activeItem.id)}
              className="text-lg font-semibold text-foreground"
            >
              {renderTitle ? renderTitle(activeItem, state) : activeItem.title}
            </motion.h3>

            {activeItem.description ? (
              <motion.div
                id={`${scopeId}-${activeItem.id}-description`}
                layoutId={layoutId(scopeId, 'description', activeItem.id)}
                className="mt-1 text-sm text-muted-foreground"
              >
                {renderDescription ? renderDescription(activeItem, state) : activeItem.description}
              </motion.div>
            ) : null}
          </div>

          <motion.div
            layoutId={layoutId(scopeId, 'action', activeItem.id)}
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
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cx(
            expandableContentVariants({
              variant: dialogVariant ?? variant,
            }),
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
