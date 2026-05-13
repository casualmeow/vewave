'use client'

import { LayoutGroup } from 'motion/react'
import { DEFAULT_COMPACT_SIZE } from './constants'
import { useDialogResize, useExpandableCards, useExpandableCardModalEffects } from './hooks'
import { ExpandableCardDialog, ExpandableCardList } from './ui'
import type { ExpandableCardItem, ExpandableCardsProps } from './types'

export function ExpandableCards<T extends ExpandableCardItem>({
  items,
  resizable = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  lockBodyScroll = true,
  compactSize,
  expandedSize,
  onActiveItemChange,
  ...props
}: ExpandableCardsProps<T>) {
  const controller = useExpandableCards({
    items,
    onActiveItemChange,
  })

  const resize = useDialogResize(expandedSize, controller.activeItem, resizable)

  useExpandableCardModalEffects({
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

  return (
    <LayoutGroup id={controller.scopeId}>
      <ExpandableCardList
        {...props}
        items={items}
        scopeId={controller.scopeId}
        activeId={controller.activeId}
        compactSize={resolvedCompactSize}
        openItem={controller.openItem}
        closeItem={controller.closeItem}
      />

      <ExpandableCardDialog
        {...props}
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
