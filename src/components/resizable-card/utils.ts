import { type ExpandableCardItem } from './types'

export function defaultTitleRenderer<T extends ExpandableCardItem>(item: T) {
  return item.title
}

export function defaultDescriptionRenderer<T extends ExpandableCardItem>(item: T) {
  return item.description
}

export function layoutId(scopeId: string, part: string, itemId: string) {
  return `${scopeId}-${part}-${itemId}`
}
