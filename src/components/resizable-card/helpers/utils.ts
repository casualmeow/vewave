import { type ReactNode } from 'react'
import { type ExpandableCardItem } from '../types'

export function defaultTitleRenderer<T extends ExpandableCardItem>(item: T) {
  return item.title
}

export function defaultDescriptionRenderer<T extends ExpandableCardItem>(item: T) {
  return item.description
}

export function layoutId(scopeId: string, part: string, itemId: string) {
  return `${scopeId}-${part}-${itemId}`
}

export function resolveCardContent<T extends ExpandableCardItem>(
  item: T,
  renderContent?: (item: T) => ReactNode,
) {
  if (renderContent) return renderContent(item)

  if (typeof item.content === 'function') {
    return item.content()
  }

  return item.content
}
