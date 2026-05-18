import { type PointerEventHandler, type RefObject, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { InlineCardDialogSurface } from './presentations/inline/inline-card-dialog-surface'
import { MediaCardDialogSurface } from './presentations/media/media-card-dialog-surface'
import type {
  DialogSize,
  ResizableCardItem,
  ResizableCardsProps,
  ResizableCardResolvedTransition,
} from '../types'
import { cx } from '@/shared/lib/utils'

type ResizableCardDialogProps<T extends ResizableCardItem> = Omit<
  ResizableCardsProps<T>,
  'items'
> & {
  activeItem: T | null
  scopeId: string
  dialogSize: DialogSize
  animation: ResizableCardResolvedTransition
  closeItem: () => void
  openItem: (item: T) => void
  closeButtonRef: RefObject<HTMLButtonElement | null>
  handleResizeStart: PointerEventHandler<HTMLButtonElement>
}

export function ResizableCardDialog<T extends ResizableCardItem>({
  activeItem,
  scopeId,
  dialogSize,
  animation,
  closeItem,
  openItem,
  closeButtonRef,
  handleResizeStart,
  closeOnBackdropClick = true,
  backdropClassName,
  presentation = 'inline',
  ...props
}: ResizableCardDialogProps<T>) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence initial={false}>
      {activeItem ? (
        <>
          <motion.div
            key="resizable-card-backdrop"
            initial={animation.presence.backdrop.initial}
            animate={animation.presence.backdrop.animate}
            exit={animation.presence.backdrop.exit}
            transition={animation.backdrop}
            className={cx(
              'fixed inset-0 z-[90] bg-black/40 backdrop-blur-[2px]',
              animation.backdropClassName,
              backdropClassName,
            )}
          />

          <motion.div
            layoutRoot
            className="fixed inset-0 z-[100] grid place-items-center p-4"
            onPointerDown={(event) => {
              if (closeOnBackdropClick && event.target === event.currentTarget) {
                closeItem()
              }
            }}
          >
            {presentation === 'media' ? (
              <MediaCardDialogSurface
                {...props}
                presentation={presentation}
                activeItem={activeItem}
                scopeId={scopeId}
                dialogSize={dialogSize}
                animation={animation}
                closeItem={closeItem}
                openItem={openItem}
                closeButtonRef={closeButtonRef}
                handleResizeStart={handleResizeStart}
              />
            ) : (
              <InlineCardDialogSurface
                {...props}
                presentation={presentation}
                activeItem={activeItem}
                scopeId={scopeId}
                dialogSize={dialogSize}
                animation={animation}
                closeItem={closeItem}
                openItem={openItem}
                closeButtonRef={closeButtonRef}
                handleResizeStart={handleResizeStart}
              />
            )}
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
