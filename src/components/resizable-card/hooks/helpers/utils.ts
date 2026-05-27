import { type ReactNode } from 'react'
import {
  type ResizableCardItem,
  type ResizableCardResolvedTransition,
  type ResizableCardSharedLayoutPart,
} from '../../types/types'

export function defaultTitleRenderer<T extends ResizableCardItem>(item: T) {
  return item.title
}

export function defaultDescriptionRenderer<T extends ResizableCardItem>(item: T) {
  return item.description
}

export function layoutId(scopeId: string, part: string, itemId: string) {
  return `${scopeId}-${part}-${itemId}`
}

export function animatedLayoutId(
  animation: ResizableCardResolvedTransition,
  scopeId: string,
  part: ResizableCardSharedLayoutPart,
  itemId: string,
) {
  return animation.sharedLayout[part] ? layoutId(scopeId, part, itemId) : undefined
}

export function resolveCardContent<T extends ResizableCardItem>(
  item: T,
  renderContent?: (item: T) => ReactNode,
) {
  if (renderContent) return renderContent(item)

  if (typeof item.content === 'function') {
    return item.content()
  }

  return item.content
}
