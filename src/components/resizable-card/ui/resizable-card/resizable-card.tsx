'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
  type RefObject,
  type SetStateAction,
} from 'react'
import { createPortal } from 'react-dom'
import { XIcon } from 'lucide-react'
import {
  AnimatePresence,
  MotionConfig,
  motion,
  type HTMLMotionProps,
  type Transition,
} from 'motion/react'
import { cn } from '@/shared/lib/utils'

type ResizableCardContextValue = {
  isOpen: boolean
  uniqueId: string
  triggerRef: RefObject<HTMLElement | null>
  closeOnOutsideClick: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
}

const ResizableCardContext = createContext<ResizableCardContextValue | null>(null)

export function useResizableCardContext() {
  const context = useContext(ResizableCardContext)

  if (!context) {
    throw new Error('useResizableCardContext must be used within a ResizableCard')
  }

  return context
}

export type ResizableCardProps = {
  children: ReactNode
  transition?: Transition
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  closeOnEscape?: boolean
  closeOnOutsideClick?: boolean
  lockBodyScroll?: boolean
}

export function ResizableCard({
  children,
  transition,
  open,
  defaultOpen = false,
  onOpenChange,
  closeOnEscape = true,
  closeOnOutsideClick = true,
  lockBodyScroll = true,
}: ResizableCardProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : uncontrolledOpen
  const uniqueId = useId()
  const triggerRef = useRef<HTMLElement | null>(null)

  const setIsOpen = useCallback<Dispatch<SetStateAction<boolean>>>(
    (nextOpen) => {
      const value = typeof nextOpen === 'function' ? nextOpen(isOpen) : nextOpen

      if (!isControlled) {
        setUncontrolledOpen(value)
      }

      onOpenChange?.(value)
    },
    [isControlled, isOpen, onOpenChange],
  )

  useEffect(() => {
    if (!isOpen || !closeOnEscape) return

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [closeOnEscape, isOpen, setIsOpen])

  useEffect(() => {
    if (!isOpen || !lockBodyScroll) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen, lockBodyScroll])

  const contextValue = useMemo(
    () => ({
      isOpen,
      uniqueId,
      triggerRef,
      closeOnOutsideClick,
      setIsOpen,
    }),
    [closeOnOutsideClick, isOpen, setIsOpen, uniqueId],
  )

  return (
    <ResizableCardContext.Provider value={contextValue}>
      <MotionConfig transition={transition}>{children}</MotionConfig>
    </ResizableCardContext.Provider>
  )
}

export type ResizableCardBodyProps = HTMLMotionProps<'div'> & {
  ref?: Ref<HTMLDivElement>
}

export function ResizableCardBody({
  children,
  className,
  onClick,
  onKeyDown,
  ref,
  style,
  tabIndex,
  role,
  ...props
}: ResizableCardBodyProps) {
  const { isOpen, setIsOpen, triggerRef, uniqueId } = useResizableCardContext()

  const openCard = useCallback(() => setIsOpen(true), [setIsOpen])

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event)

    if (event.defaultPrevented) return

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openCard()
    }
  }

  return (
    <motion.div
      ref={composeRefs(ref, triggerRef as Ref<HTMLDivElement>)}
      data-slot="resizable-card-body"
      layoutId={`card-${uniqueId}`}
      role={role ?? 'button'}
      tabIndex={tabIndex ?? 0}
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-controls={`resizable-card-${uniqueId}`}
      onClick={(event) => {
        onClick?.(event)

        if (!event.defaultPrevented) {
          openCard()
        }
      }}
      onKeyDown={handleKeyDown}
      style={{
        willChange: 'transform, opacity',
        transform: 'translateZ(0)',
        ...style,
      }}
      className={cn(
        'relative flex cursor-pointer select-none flex-col overflow-hidden rounded-xl bg-card pb-2 text-card-foreground shadow-sm outline-none ring-border transition-[background-color,box-shadow]',
        'hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export type ResizableCardExpandContainerProps = HTMLMotionProps<'div'> & {
  ref?: Ref<HTMLDivElement>
  overlayClassName?: string
  wrapperClassName?: string
  showCloseButton?: boolean
  closeButton?: ReactNode
}

export function ResizableCardExpandContainer({
  children,
  className,
  overlayClassName,
  wrapperClassName,
  showCloseButton = true,
  closeButton,
  ref,
  style,
  ...props
}: ResizableCardExpandContainerProps) {
  const { isOpen, setIsOpen, uniqueId, closeOnOutsideClick } = useResizableCardContext()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence initial={false} mode="sync">
      {isOpen ? (
        <>
          <motion.div
            data-slot="resizable-card-overlay"
            key={`resizable-card-overlay-${uniqueId}`}
            className={cn(
              'fixed inset-0 z-40 bg-background/40 dark:bg-foreground/40',
              overlayClassName,
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onPointerDown={() => {
              if (closeOnOutsideClick) {
                setIsOpen(false)
              }
            }}
          />

          <div
            className={cn(
              'fixed inset-0 z-50 mx-auto grid h-fit max-w-2xl place-items-center self-center p-4 pointer-events-none',
              'top-1/2 -translate-y-1/2',
              wrapperClassName,
            )}
          >
            <motion.div
              ref={ref}
              id={`resizable-card-${uniqueId}`}
              data-slot="resizable-card-expand-container"
              layoutId={`card-${uniqueId}`}
              role="dialog"
              aria-modal="true"
              aria-labelledby={`resizable-card-${uniqueId}-title`}
              aria-describedby={`resizable-card-${uniqueId}-description`}
              style={{
                willChange: 'transform, opacity',
                transform: 'translateZ(0)',
                ...style,
              }}
              className={cn(
                'pointer-events-auto relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-xl bg-card pb-2 text-card-foreground shadow-2xl ring-1 ring-border/70',
                className,
              )}
              {...props}
            >
              {children}
            </motion.div>

            {showCloseButton ? (closeButton ?? <ResizableCardCloseButton />) : null}
          </div>
        </>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}

export type ResizableCardContentProps = HTMLMotionProps<'div'>

export function ResizableCardContent({
  children,
  className,
  style,
  ...props
}: ResizableCardContentProps) {
  return (
    <motion.div
      data-slot="resizable-card-content"
      layout
      className={cn('overflow-auto p-4 text-sm leading-7 text-muted-foreground', className)}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{
        ease: 'easeIn',
        duration: 0.3,
        delay: 0.2,
      }}
      style={{
        willChange: 'transform, opacity',
        ...style,
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export type ResizableCardTitleProps = HTMLMotionProps<'h2'>

export function ResizableCardTitle({ children, className, ...props }: ResizableCardTitleProps) {
  const { uniqueId } = useResizableCardContext()

  return (
    <motion.h2
      id={`resizable-card-${uniqueId}-title`}
      data-slot="resizable-card-title"
      layout="position"
      layoutId={`card-title-${uniqueId}`}
      className={cn('!m-0 px-4 pt-3 text-lg font-semibold leading-6 tracking-tight', className)}
      {...props}
    >
      {children}
    </motion.h2>
  )
}

export type ResizableCardDescriptionProps = HTMLMotionProps<'h3'>

export function ResizableCardDescription({
  children,
  className,
  ...props
}: ResizableCardDescriptionProps) {
  const { uniqueId } = useResizableCardContext()

  return (
    <motion.h3
      id={`resizable-card-${uniqueId}-description`}
      data-slot="resizable-card-description"
      layout="position"
      layoutId={`card-description-${uniqueId}`}
      className={cn('px-4 text-sm text-muted-foreground', className)}
      {...props}
    >
      {children}
    </motion.h3>
  )
}

export type ResizableCardImageProps = HTMLMotionProps<'img'> & {
  shared?: boolean
}

export function ResizableCardImage({
  className,
  shared = true,
  style,
  ...props
}: ResizableCardImageProps) {
  const { uniqueId } = useResizableCardContext()

  return (
    <motion.img
      data-slot="resizable-card-image"
      layout={shared ? 'position' : undefined}
      layoutId={shared ? `card-image-${uniqueId}` : undefined}
      style={{
        willChange: 'transform, scale',
        ...style,
      }}
      className={cn('not-prose h-full w-full object-cover object-top', className)}
      {...props}
    />
  )
}

export type ResizableCardCloseButtonProps = HTMLMotionProps<'button'> & {
  ref?: Ref<HTMLButtonElement>
}

export function ResizableCardCloseButton({
  className,
  children,
  onClick,
  ref,
  ...props
}: ResizableCardCloseButtonProps) {
  const { setIsOpen, uniqueId } = useResizableCardContext()

  const closeCard = useCallback(() => setIsOpen(false), [setIsOpen])

  return (
    <motion.button
      ref={ref}
      type="button"
      data-slot="resizable-card-close-button"
      layout="position"
      layoutId={`card-close-button-${uniqueId}`}
      onClick={(event) => {
        onClick?.(event)

        if (!event.defaultPrevented) {
          closeCard()
        }
      }}
      aria-label="Close expanded card"
      className={cn(
        'pointer-events-auto absolute right-2 top-2 z-[60] inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border/70 bg-background/70 text-foreground/70 shadow-sm backdrop-blur transition-colors hover:bg-background hover:text-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className,
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { delay: -0.2 } }}
      transition={{ duration: 0.2, delay: 0.3 }}
      {...props}
    >
      {children ?? <XIcon className="size-4" />}
    </motion.button>
  )
}

function assignRef<TValue>(ref: Ref<TValue> | undefined, value: TValue | null) {
  if (!ref) return

  if (typeof ref === 'function') {
    ref(value)
    return
  }

  ref.current = value
}

function composeRefs<TValue>(...refs: Array<Ref<TValue> | undefined>) {
  return (value: TValue | null) => {
    refs.forEach((ref) => assignRef(ref, value))
  }
}
