'use client'

import { LayoutGroup, useReducedMotion } from 'motion/react'
import { resolveResizableCardAnimation } from './animations'
import { DEFAULT_COMPACT_SIZE } from './constants'
import { useDialogResize, useResizableCards, useResizableCardModalEffects } from './hooks'
import { ResizableCardDialog, ResizableCardList } from './ui'
import type { ResizableCardItem, ResizableCardsProps } from './types'

export function ResizableCards<T extends ResizableCardItem>({
  items,
  resizable = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  lockBodyScroll = true,
  compactSize,
  expandedSize,
  presentation = 'inline',
  animationPreset,
  onActiveItemChange,
  ...props
}: ResizableCardsProps<T>) {
  const shouldReduceMotion = useReducedMotion()
  const controller = useResizableCards({
    items,
    onActiveItemChange,
  })

  const resize = useDialogResize(expandedSize, controller.activeItem, resizable)

  useResizableCardModalEffects({
    activeItem: controller.activeItem,
    closeItem: controller.closeItem,
    closeButtonRef: controller.closeButtonRef,
    lockBodyScroll,
    closeOnEscape,
  })

  const resolvedCompactSize = {
    ...DEFAULT_COMPACT_SIZE,
    ...compactSize,
  }

  const animation = resolveResizableCardAnimation({
    presentation,
    animationPreset,
    reducedMotion: Boolean(shouldReduceMotion),
  })

  return (
    <LayoutGroup id={controller.scopeId}>
      <ResizableCardList
        {...props}
        presentation={presentation}
        animation={animation}
        items={items}
        scopeId={controller.scopeId}
        activeId={controller.activeId}
        compactSize={resolvedCompactSize}
        openItem={controller.openItem}
        closeItem={controller.closeItem}
      />

      <ResizableCardDialog
        {...props}
        presentation={presentation}
        animation={animation}
        activeItem={controller.activeItem}
        scopeId={controller.scopeId}
        dialogSize={resize.dialogSize}
        closeItem={controller.closeItem}
        openItem={controller.openItem}
        closeButtonRef={controller.closeButtonRef}
        handleResizeStart={resize.handleResizeStart}
        resizable={resizable}
        closeOnBackdropClick={closeOnBackdropClick}
      />
    </LayoutGroup>
  )
}
