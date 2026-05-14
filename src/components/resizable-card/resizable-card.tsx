'use client'

import { LayoutGroup, useReducedMotion } from 'motion/react'
import { resolveResizableCardAnimation } from './animations'
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
  presentation = 'inline',
  animationPreset,
  transitionPreset,
  onActiveItemChange,
  ...props
}: ExpandableCardsProps<T>) {
  const shouldReduceMotion = useReducedMotion()
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

  const animation = resolveResizableCardAnimation({
    presentation,
    animationPreset,
    transitionPreset,
    reducedMotion: Boolean(shouldReduceMotion),
  })

  return (
    <LayoutGroup id={controller.scopeId}>
      <ExpandableCardList
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

      <ExpandableCardDialog
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

export function ResizableCard<T extends ExpandableCardItem>(props: ExpandableCardsProps<T>) {
  return <ExpandableCards {...props} />
}
