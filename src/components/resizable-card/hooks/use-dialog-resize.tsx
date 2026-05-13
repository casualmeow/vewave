import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { DEFAULT_EXPANDED_SIZE } from '../constants'
import type { DialogSize, ExpandedCardSize } from '../types'
import { clamp } from '@/shared/lib/utils'

export function useDialogResize(
  expandedSize?: ExpandedCardSize,
  activeItem?: unknown,
  resizable = true,
) {
  const sizing = useMemo(
    () => ({
      ...DEFAULT_EXPANDED_SIZE,
      ...expandedSize,
    }),
    [expandedSize],
  )

  const getClampedDialogSize = useCallback(
    (nextSize?: Partial<DialogSize>): DialogSize => {
      const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : sizing.maxWidth

      const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : sizing.maxHeight

      const availableWidth = Math.max(0, viewportWidth - sizing.viewportPadding * 2)
      const availableHeight = Math.max(0, viewportHeight - sizing.viewportPadding * 2)

      const effectiveMinWidth = Math.min(sizing.minWidth, availableWidth)
      const effectiveMinHeight = Math.min(sizing.minHeight, availableHeight)

      const effectiveMaxWidth = Math.max(
        effectiveMinWidth,
        Math.min(sizing.maxWidth, availableWidth),
      )

      const effectiveMaxHeight = Math.max(
        effectiveMinHeight,
        Math.min(sizing.maxHeight, availableHeight),
      )

      return {
        width: clamp(nextSize?.width ?? sizing.initialWidth, effectiveMinWidth, effectiveMaxWidth),
        height: clamp(
          nextSize?.height ?? sizing.initialHeight,
          effectiveMinHeight,
          effectiveMaxHeight,
        ),
      }
    },
    [sizing],
  )

  const [dialogSize, setDialogSize] = useState<DialogSize>(() => getClampedDialogSize())

  useEffect(() => {
    if (!activeItem) return

    setDialogSize(getClampedDialogSize())
  }, [activeItem, getClampedDialogSize])

  useEffect(() => {
    if (!activeItem) return

    const handleWindowResize = () => {
      setDialogSize((current) =>
        getClampedDialogSize({
          width: current.width,
          height: current.height,
        }),
      )
    }

    window.addEventListener('resize', handleWindowResize)
    return () => window.removeEventListener('resize', handleWindowResize)
  }, [activeItem, getClampedDialogSize])

  const handleResizeStart = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (!resizable) return

      event.preventDefault()
      event.stopPropagation()

      const startX = event.clientX
      const startY = event.clientY
      const startWidth = dialogSize.width
      const startHeight = dialogSize.height

      const previousUserSelect = document.body.style.userSelect
      document.body.style.userSelect = 'none'

      const handlePointerMove = (moveEvent: PointerEvent) => {
        setDialogSize(
          getClampedDialogSize({
            width: startWidth + moveEvent.clientX - startX,
            height: startHeight + moveEvent.clientY - startY,
          }),
        )
      }

      const handlePointerUp = () => {
        document.body.style.userSelect = previousUserSelect
        window.removeEventListener('pointermove', handlePointerMove)
        window.removeEventListener('pointerup', handlePointerUp)
      }

      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerup', handlePointerUp)
    },
    [dialogSize, getClampedDialogSize, resizable],
  )

  return {
    dialogSize,
    handleResizeStart,
  }
}
