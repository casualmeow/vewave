'use client'

import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { defaultTitleRenderer, defaultDescriptionRenderer, layoutId } from './utils'
import { DEFAULT_COMPACT_SIZE, DEFAULT_EXPANDED_SIZE } from './config'
import {
  type CardRenderState,
  type ExpandableCardItem,
  type ExpandableCardsProps,
  type DialogSize,
} from './types'
import { CloseIcon } from './close-icon'
import { ResizeHandleIcon } from './resize-handle-icon'
import { cx, clamp } from '@/shared/lib/utils'

// type CardRenderState = {
//   expanded: boolean
//   open: () => void
//   close: () => void
// }

// export type ExpandableCardItem = {
//   id: string
//   title: ReactNode
//   description?: ReactNode
//   src?: string
//   imageAlt?: string
//   ctaText?: ReactNode
//   ctaLink?: string
//   content?: ReactNode | (() => ReactNode)
// }

// export type ExpandableCardsProps<T extends ExpandableCardItem> = {
//   items: ReadonlyArray<T>

//   compactSize?: {
//     width?: CSSProperties['width']
//     minHeight?: CSSProperties['minHeight']
//   }

//   expandedSize?: {
//     initialWidth?: number
//     initialHeight?: number
//     minWidth?: number
//     minHeight?: number
//     maxWidth?: number
//     maxHeight?: number
//     viewportPadding?: number
//   }

//   resizable?: boolean
//   closeOnBackdropClick?: boolean
//   closeOnEscape?: boolean
//   lockBodyScroll?: boolean

//   className?: string
//   listClassName?: string
//   cardClassName?: string
//   dialogClassName?: string
//   contentClassName?: string

//   renderMedia?: (item: T, state: CardRenderState) => ReactNode
//   renderTitle?: (item: T, state: CardRenderState) => ReactNode
//   renderDescription?: (item: T, state: CardRenderState) => ReactNode
//   renderAction?: (item: T, state: CardRenderState) => ReactNode
//   renderContent?: (item: T) => ReactNode

//   onActiveItemChange?: (item: T | null) => void
// }

// type DialogSize = {
//   width: number
//   height: number
// }

export function ExpandableCards<T extends ExpandableCardItem>({
  items,
  compactSize,
  expandedSize,
  resizable = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  lockBodyScroll = true,
  className,
  listClassName,
  cardClassName,
  dialogClassName,
  contentClassName,
  renderMedia,
  renderTitle,
  renderDescription,
  renderAction,
  renderContent,
  onActiveItemChange,
}: ExpandableCardsProps<T>) {
  const scopeId = useId()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null)

  const [mounted, setMounted] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [dialogSize, setDialogSize] = useState<DialogSize>({
    width: DEFAULT_EXPANDED_SIZE.initialWidth,
    height: DEFAULT_EXPANDED_SIZE.initialHeight,
  })

  const sizing = useMemo(
    () => ({
      ...DEFAULT_EXPANDED_SIZE,
      ...expandedSize,
    }),
    [expandedSize],
  )

  const activeItem = useMemo(
    () => items.find((item) => item.id === activeId) ?? null,
    [items, activeId],
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    onActiveItemChange?.(activeItem)
  }, [activeItem, onActiveItemChange])

  useEffect(() => {
    if (activeId && !activeItem) {
      setActiveId(null)
    }
  }, [activeId, activeItem])

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

      const requestedWidth = nextSize?.width ?? sizing.initialWidth
      const requestedHeight = nextSize?.height ?? sizing.initialHeight

      return {
        width: clamp(requestedWidth, effectiveMinWidth, effectiveMaxWidth),
        height: clamp(requestedHeight, effectiveMinHeight, effectiveMaxHeight),
      }
    },
    [sizing],
  )

  const openItem = useCallback(
    (item: T) => {
      if (typeof document !== 'undefined') {
        previouslyFocusedElementRef.current =
          document.activeElement instanceof HTMLElement ? document.activeElement : null
      }

      setDialogSize(getClampedDialogSize())
      setActiveId(item.id)
    },
    [getClampedDialogSize],
  )

  const closeItem = useCallback(() => {
    setActiveId(null)

    requestAnimationFrame(() => {
      previouslyFocusedElementRef.current?.focus()
    })
  }, [])

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
  }, [activeItem, closeOnEscape, closeItem])

  useEffect(() => {
    if (!activeItem) return

    const animationFrame = requestAnimationFrame(() => {
      closeButtonRef.current?.focus()
    })

    return () => cancelAnimationFrame(animationFrame)
  }, [activeItem])

  useEffect(() => {
    if (!activeItem) return

    const handleResize = () => {
      setDialogSize((currentSize) =>
        getClampedDialogSize({
          width: currentSize.width,
          height: currentSize.height,
        }),
      )
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
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
        const deltaX = moveEvent.clientX - startX
        const deltaY = moveEvent.clientY - startY

        setDialogSize(
          getClampedDialogSize({
            width: startWidth + deltaX,
            height: startHeight + deltaY,
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
    [dialogSize.height, dialogSize.width, getClampedDialogSize, resizable],
  )

  const renderResolvedContent = useCallback(
    (item: T) => {
      if (renderContent) return renderContent(item)

      if (typeof item.content === 'function') {
        return item.content()
      }

      return item.content
    },
    [renderContent],
  )

  const renderDefaultMedia = useCallback((item: T, state: CardRenderState) => {
    if (!item.src) return null

    return (
      <img
        src={item.src}
        alt={item.imageAlt ?? ''}
        className={
          state.expanded
            ? 'h-64 w-full object-cover object-top sm:rounded-t-3xl'
            : 'h-20 w-20 shrink-0 rounded-2xl object-cover object-top'
        }
      />
    )
  }, [])

  const renderDefaultAction = useCallback((item: T, state: CardRenderState) => {
    if (!item.ctaText) return null

    if (state.expanded && item.ctaLink) {
      return (
        <a
          href={item.ctaLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-full bg-green-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-600"
        >
          {item.ctaText}
        </a>
      )
    }

    return (
      <span className="inline-flex items-center justify-center rounded-full bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-900 transition group-hover:bg-green-500 group-hover:text-white dark:bg-neutral-800 dark:text-neutral-100">
        {item.ctaText}
      </span>
    )
  }, [])

  const compactCardSize = {
    ...DEFAULT_COMPACT_SIZE,
    ...compactSize,
  }

  const modal =
    activeItem && mounted
      ? createPortal(
          <AnimatePresence>
            <>
              <motion.div
                key="expandable-card-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-[2px]"
              />

              <div
                className="fixed inset-0 z-[100] grid place-items-center p-4"
                onMouseDown={(event) => {
                  if (closeOnBackdropClick && event.target === event.currentTarget) {
                    closeItem()
                  }
                }}
              >
                <motion.section
                  layoutId={layoutId(scopeId, 'card', activeItem.id)}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby={`${scopeId}-${activeItem.id}-title`}
                  aria-describedby={
                    activeItem.description ? `${scopeId}-${activeItem.id}-description` : undefined
                  }
                  style={{
                    width: dialogSize.width,
                    height: dialogSize.height,
                  }}
                  className={cx(
                    'relative flex max-h-full max-w-full flex-col overflow-hidden rounded-3xl border border-black/5 bg-white shadow-2xl dark:border-white/10 dark:bg-neutral-950',
                    dialogClassName,
                  )}
                >
                  <button
                    ref={closeButtonRef}
                    type="button"
                    aria-label="Close expanded card"
                    onClick={closeItem}
                    className="absolute right-4 top-4 z-20 grid h-9 w-9 place-items-center rounded-full border border-black/10 bg-white/90 text-neutral-900 shadow-sm backdrop-blur transition hover:bg-white dark:border-white/10 dark:bg-neutral-900/90 dark:text-neutral-100"
                  >
                    <CloseIcon />
                  </button>

                  <motion.div
                    layoutId={layoutId(scopeId, 'media', activeItem.id)}
                    className="shrink-0"
                  >
                    {(renderMedia ?? renderDefaultMedia)(activeItem, {
                      expanded: true,
                      open: () => openItem(activeItem),
                      close: closeItem,
                    })}
                  </motion.div>

                  <div className="flex min-h-0 flex-1 flex-col">
                    <div className="flex shrink-0 items-start justify-between gap-4 border-b border-black/5 p-5 dark:border-white/10">
                      <div className="min-w-0">
                        <motion.h3
                          id={`${scopeId}-${activeItem.id}-title`}
                          layoutId={layoutId(scopeId, 'title', activeItem.id)}
                          className="text-lg font-semibold text-neutral-950 dark:text-neutral-100"
                        >
                          {(renderTitle ?? defaultTitleRenderer)(activeItem, {
                            expanded: true,
                            open: () => openItem(activeItem),
                            close: closeItem,
                          })}
                        </motion.h3>

                        {activeItem.description ? (
                          <motion.div
                            id={`${scopeId}-${activeItem.id}-description`}
                            layoutId={layoutId(scopeId, 'description', activeItem.id)}
                            className="mt-1 text-sm text-neutral-600 dark:text-neutral-400"
                          >
                            {(renderDescription ?? defaultDescriptionRenderer)(activeItem, {
                              expanded: true,
                              open: () => openItem(activeItem),
                              close: closeItem,
                            })}
                          </motion.div>
                        ) : null}
                      </div>

                      <motion.div
                        layoutId={layoutId(scopeId, 'action', activeItem.id)}
                        className="shrink-0 pr-12"
                      >
                        {(renderAction ?? renderDefaultAction)(activeItem, {
                          expanded: true,
                          open: () => openItem(activeItem),
                          close: closeItem,
                        })}
                      </motion.div>
                    </div>

                    <motion.div
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={cx(
                        'min-h-0 flex-1 overflow-auto p-5 text-sm leading-7 text-neutral-700 dark:text-neutral-300',
                        contentClassName,
                      )}
                    >
                      {renderResolvedContent(activeItem)}
                    </motion.div>
                  </div>

                  {resizable ? (
                    <button
                      type="button"
                      aria-label="Resize expanded card"
                      onPointerDown={handleResizeStart}
                      className="absolute bottom-2 right-2 z-20 grid h-8 w-8 cursor-nwse-resize place-items-center rounded-lg text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-900 dark:hover:text-neutral-100"
                    >
                      <ResizeHandleIcon />
                    </button>
                  ) : null}
                </motion.section>
              </div>
            </>
          </AnimatePresence>,
          document.body,
        )
      : null

  return (
    <LayoutGroup id={scopeId}>
      <div className={className}>
        <ul className={cx('mx-auto grid w-full max-w-3xl gap-3', listClassName)}>
          {items.map((item) => {
            const isActive = item.id === activeId

            return (
              <li key={item.id}>
                <motion.button
                  type="button"
                  layoutId={layoutId(scopeId, 'card', item.id)}
                  aria-haspopup="dialog"
                  aria-expanded={isActive}
                  onClick={() => openItem(item)}
                  style={{
                    width: compactCardSize.width,
                    minHeight: compactCardSize.minHeight,
                  }}
                  className={cx(
                    'group flex w-full items-center justify-between gap-4 rounded-3xl border border-black/5 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:bg-neutral-50 hover:shadow-md dark:border-white/10 dark:bg-neutral-950 dark:hover:bg-neutral-900',
                    cardClassName,
                  )}
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <motion.div layoutId={layoutId(scopeId, 'media', item.id)} className="shrink-0">
                      {(renderMedia ?? renderDefaultMedia)(item, {
                        expanded: false,
                        open: () => openItem(item),
                        close: closeItem,
                      })}
                    </motion.div>

                    <div className="min-w-0">
                      <motion.h3
                        layoutId={layoutId(scopeId, 'title', item.id)}
                        className="truncate font-semibold text-neutral-950 dark:text-neutral-100"
                      >
                        {(renderTitle ?? defaultTitleRenderer)(item, {
                          expanded: false,
                          open: () => openItem(item),
                          close: closeItem,
                        })}
                      </motion.h3>

                      {item.description ? (
                        <motion.div
                          layoutId={layoutId(scopeId, 'description', item.id)}
                          className="mt-1 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400"
                        >
                          {(renderDescription ?? defaultDescriptionRenderer)(item, {
                            expanded: false,
                            open: () => openItem(item),
                            close: closeItem,
                          })}
                        </motion.div>
                      ) : null}
                    </div>
                  </div>

                  <motion.div layoutId={layoutId(scopeId, 'action', item.id)} className="shrink-0">
                    {(renderAction ?? renderDefaultAction)(item, {
                      expanded: false,
                      open: () => openItem(item),
                      close: closeItem,
                    })}
                  </motion.div>
                </motion.button>
              </li>
            )
          })}
        </ul>
      </div>

      {modal}
    </LayoutGroup>
  )
}
