import type { ResizableCardItem } from '../../../types'

export function MediaDefaultImage<T extends ResizableCardItem>({ item }: { item: T }) {
  if (!item.src) return null

  return (
    <img
      src={item.src}
      alt={item.imageAlt ?? ''}
      className="h-full w-full object-cover object-top"
    />
  )
}
