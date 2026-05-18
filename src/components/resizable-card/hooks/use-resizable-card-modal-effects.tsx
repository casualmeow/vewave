import { type RefObject, useEffect } from 'react'

type Params = {
  activeItem: unknown
  closeItem: () => void
  closeButtonRef: RefObject<HTMLButtonElement | null>
  lockBodyScroll?: boolean
  closeOnEscape?: boolean
}

export function useResizableCardModalEffects({
  activeItem,
  closeItem,
  closeButtonRef,
  lockBodyScroll = true,
  closeOnEscape = true,
}: Params) {
  useEffect(() => {
    if (!activeItem || !lockBodyScroll) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [activeItem, lockBodyScroll])

  useEffect(() => {
    if (!activeItem || !closeOnEscape) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeItem()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeItem, closeItem, closeOnEscape])

  useEffect(() => {
    if (!activeItem) return

    const animationFrame = requestAnimationFrame(() => {
      closeButtonRef.current?.focus()
    })

    return () => cancelAnimationFrame(animationFrame)
  }, [activeItem, closeButtonRef])
}
