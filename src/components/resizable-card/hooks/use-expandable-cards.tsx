import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import type { ExpandableCardItem } from '../types'

type UseExpandableCardsParams<T extends ExpandableCardItem> = {
  items: ReadonlyArray<T>
  onActiveItemChange?: (item: T | null) => void
}

export function useExpandableCards<T extends ExpandableCardItem>({
  items,
  onActiveItemChange,
}: UseExpandableCardsParams<T>) {
  const scopeId = useId()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null)

  const [activeId, setActiveId] = useState<string | null>(null)

  const activeItem = useMemo(
    () => items.find((item) => item.id === activeId) ?? null,
    [items, activeId],
  )

  useEffect(() => {
    onActiveItemChange?.(activeItem)
  }, [activeItem, onActiveItemChange])

  useEffect(() => {
    if (activeId && !activeItem) {
      setActiveId(null)
    }
  }, [activeId, activeItem])

  const openItem = useCallback((item: T) => {
    if (typeof document !== 'undefined') {
      previouslyFocusedElementRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null
    }

    setActiveId(item.id)
  }, [])

  const closeItem = useCallback(() => {
    setActiveId(null)

    requestAnimationFrame(() => {
      previouslyFocusedElementRef.current?.focus()
    })
  }, [])

  return {
    scopeId,
    activeId,
    activeItem,
    openItem,
    closeItem,
    closeButtonRef,
    previouslyFocusedElementRef,
  }
}
