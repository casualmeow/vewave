import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type FocusEvent,
  type ReactNode,
  type Ref,
} from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react'

import { BLUR_VALUE, HEADER_HEIGHT, HIDE_TRANSITIONS, SPRING_PRESETS } from './config'
import { headerButtonVariants, headerNavItemVariants, headerVariants } from './header.variants'
import {
  type CSSLength,
  type CSSVariableStyle,
  type HeaderBlurIntensity,
  type HeaderCollapseBehavior,
  type HeaderMotionPreset,
  type HeaderPosition,
  type HeaderSize,
  type HeaderVariant,
  type PremiumHeaderSlotClassNames,
} from './types'
import { toLength, toWidth } from './utils'

import { clamp, cn } from '@/shared/lib/utils'

type MotionHeaderNativeProps = Omit<
  ComponentPropsWithoutRef<typeof motion.header>,
  'animate' | 'children' | 'initial' | 'transition'
>

export interface PremiumHeaderProps extends MotionHeaderNativeProps {
  /**
   * React 19 ref-as-prop.
   * Use this when a parent needs direct access to the underlying <header>.
   */
  ref?: Ref<HTMLElement>

  /** Visual style preset. */
  variant?: HeaderVariant
  /** Header height preset. */
  size?: HeaderSize
  /** Positioning strategy. */
  position?: HeaderPosition

  /** Slot content. */
  logo?: ReactNode
  navigation?: ReactNode
  actions?: ReactNode
  children?: ReactNode

  /** Per-slot className overrides. */
  slotClassNames?: PremiumHeaderSlotClassNames

  /**
   * Expanded width. number => %, string => CSS width.
   * Prefer using the same CSS unit as collapsedWidth when strings are used.
   */
  initialWidth?: CSSLength
  /**
   * Collapsed width. number => %, string => CSS width.
   * Prefer using the same CSS unit as initialWidth when strings are used.
   */
  collapsedWidth?: CSSLength
  /** Optional bounds for the computed width. number => px. */
  minWidth?: CSSLength
  maxWidth?: CSSLength

  /** Distance in pixels needed to reach the fully collapsed state. */
  scrollDistance?: number
  /** When progress reaches this value, data-state becomes "collapsed". */
  collapseThreshold?: number
  /** Scroll-linked collapse, externally controlled collapse, or no collapse. */
  collapseBehavior?: HeaderCollapseBehavior
  /** Used when collapseBehavior="manual". */
  collapsed?: boolean
  /**
   * Fallback manual state when collapsed is omitted.
   * This is a static fallback, not an internally toggled uncontrolled state.
   */
  defaultCollapsed?: boolean
  /** Fires only when the boolean collapsed state changes. */
  onCollapsedChange?: (collapsed: boolean) => void

  /** Hide navigation content after collapse. */
  hideNavOnCollapse?: boolean
  /** Accessible label for the internal nav element. */
  navigationLabel?: string

  /** Visual details. */
  blurIntensity?: HeaderBlurIntensity
  borderRadiusExpanded?: number
  borderRadiusCollapsed?: number
  topOffset?: number
  showGlow?: boolean
  glowColor?: string

  /** Motion settings. */
  motionPreset?: HeaderMotionPreset
  smoothScrollMotion?: boolean
  hideOnScrollDown?: boolean
  revealAtTop?: number
}

export function Header({
  ref,
  className,
  style,
  variant = 'glass',
  size = 'md',
  position = 'fixed',

  logo,
  navigation,
  actions,
  children,
  slotClassNames,

  initialWidth = 90,
  collapsedWidth = 40,
  minWidth,
  maxWidth,

  scrollDistance = 160,
  collapseThreshold = 0.55,
  collapseBehavior = 'scroll',
  collapsed,
  defaultCollapsed = false,
  onCollapsedChange,

  hideNavOnCollapse = true,
  navigationLabel = 'Primary',

  blurIntensity = 'lg',
  borderRadiusExpanded = 20,
  borderRadiusCollapsed = 999,
  topOffset = 12,
  showGlow = false,
  glowColor = 'rgba(255, 255, 255, 0.28)',

  motionPreset = 'spring',
  smoothScrollMotion = true,
  hideOnScrollDown = false,
  revealAtTop = 20,

  onFocusCapture,
  ...props
}: PremiumHeaderProps) {
  const prefersReducedMotion = useReducedMotion()
  const { scrollY } = useScroll()

  const safeScrollDistance = Math.max(scrollDistance, 1)
  const safeCollapseThreshold = clamp(collapseThreshold, 0, 1)
  const safeVisualThreshold = Math.max(safeCollapseThreshold, 0.001)
  const safeRevealAtTop = Math.max(revealAtTop, 0)

  const manualCollapsed = collapsed ?? defaultCollapsed

  const scrollProgress = useTransform(scrollY, [0, safeScrollDistance], [0, 1], {
    clamp: true,
  })
  const manualProgress = useMotionValue(manualCollapsed ? 1 : 0)
  const expandedProgress = useMotionValue(0)

  useEffect(() => {
    if (collapseBehavior !== 'manual') return
    manualProgress.set(manualCollapsed ? 1 : 0)
  }, [collapseBehavior, manualCollapsed, manualProgress])

  const sourceProgress =
    collapseBehavior === 'scroll'
      ? scrollProgress
      : collapseBehavior === 'manual'
        ? manualProgress
        : expandedProgress

  const smoothedProgress = useSpring(sourceProgress, SPRING_PRESETS[motionPreset])
  const progress = smoothScrollMotion && !prefersReducedMotion ? smoothedProgress : sourceProgress

  const width = useTransform(progress, [0, 1], [toWidth(initialWidth), toWidth(collapsedWidth)])

  const borderRadius = useTransform(
    progress,
    [0, 1],
    [`${borderRadiusExpanded}px`, `${borderRadiusCollapsed}px`],
  )

  const navOpacity = useTransform(progress, [0, safeVisualThreshold, 1], [1, 1, 0])
  const navScale = useTransform(progress, [0, 1], [1, 0.96])

  const initialDerivedCollapsed = collapseBehavior === 'manual' ? Boolean(manualCollapsed) : false

  const [isCollapsed, setIsCollapsed] = useState(initialDerivedCollapsed)
  const collapsedRef = useRef(initialDerivedCollapsed)

  const notifyCollapsedChange = useCallback(
    (nextCollapsed: boolean) => {
      if (collapsedRef.current === nextCollapsed) return

      collapsedRef.current = nextCollapsed
      setIsCollapsed(nextCollapsed)
      onCollapsedChange?.(nextCollapsed)
    },
    [onCollapsedChange],
  )

  useMotionValueEvent(progress, 'change', (latest) => {
    notifyCollapsedChange(latest >= safeCollapseThreshold)
  })

  useEffect(() => {
    if (collapseBehavior === 'none') {
      notifyCollapsedChange(false)
      return
    }

    if (collapseBehavior === 'manual') {
      notifyCollapsedChange(Boolean(manualCollapsed))
      return
    }

    notifyCollapsedChange(progress.get() >= safeCollapseThreshold)
  }, [collapseBehavior, manualCollapsed, notifyCollapsedChange, progress, safeCollapseThreshold])

  const [isHidden, setIsHidden] = useState(false)

  useMotionValueEvent(scrollY, 'change', (current) => {
    if (!hideOnScrollDown) return

    const previous = scrollY.getPrevious() ?? 0
    const delta = current - previous

    if (current <= safeRevealAtTop) {
      setIsHidden(false)
      return
    }

    if (delta > 2) {
      setIsHidden(true)
      return
    }

    if (delta < -2) {
      setIsHidden(false)
    }
  })

  useEffect(() => {
    if (!hideOnScrollDown) {
      setIsHidden(false)
    }
  }, [hideOnScrollDown])

  const handleFocusCapture = (event: FocusEvent<HTMLElement>) => {
    setIsHidden(false)
    onFocusCapture?.(event)
  }

  const mergedStyle: CSSVariableStyle = {
    ...style,
    top: topOffset,
    width,
    minWidth: toLength(minWidth),
    maxWidth: toLength(maxWidth),
    borderRadius,
    '--header-blur': BLUR_VALUE[blurIntensity],
    '--header-glow': glowColor,
  }

  return (
    <motion.header
      ref={ref}
      data-slot="premium-header"
      data-state={isCollapsed ? 'collapsed' : 'expanded'}
      data-hidden={isHidden ? 'true' : 'false'}
      data-variant={variant}
      className={cn(
        headerVariants({ position, size, variant }),
        isHidden && 'pointer-events-none',
        className,
      )}
      style={mergedStyle}
      initial={false}
      animate={{
        y: isHidden ? -(HEADER_HEIGHT[size] + topOffset + 24) : 0,
        opacity: isHidden ? 0 : 1,
      }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : {
              ...HIDE_TRANSITIONS[motionPreset],
            }
      }
      onFocusCapture={handleFocusCapture}
      {...props}
    >
      <AnimatePresence initial={false}>
        {showGlow ? (
          <motion.span
            key="premium-header-glow"
            aria-hidden="true"
            className="pointer-events-none absolute -inset-0.5 -z-10"
            style={{
              borderRadius: 'inherit',
              background:
                'linear-gradient(135deg, var(--header-glow), transparent 48%, var(--header-glow))',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.68 }}
            exit={{ opacity: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2 }}
          />
        ) : null}
      </AnimatePresence>

      <div
        data-slot="premium-header-inner"
        className={cn(
          'relative z-10 flex min-w-0 flex-1 items-center justify-between gap-3',
          slotClassNames?.inner,
        )}
      >
        {logo ? (
          <div data-slot="premium-header-logo" className={cn('shrink-0', slotClassNames?.logo)}>
            {logo}
          </div>
        ) : null}

        {navigation ? (
          <motion.nav
            data-slot="premium-header-navigation"
            aria-label={navigationLabel}
            aria-hidden={hideNavOnCollapse && isCollapsed ? true : undefined}
            className={cn(
              'hidden min-w-0 flex-1 items-center justify-center overflow-hidden md:flex',
              slotClassNames?.navigation,
            )}
            style={
              hideNavOnCollapse
                ? {
                    opacity: navOpacity,
                    scale: navScale,
                    pointerEvents: isCollapsed ? 'none' : 'auto',
                  }
                : undefined
            }
          >
            {navigation}
          </motion.nav>
        ) : null}

        {actions ? (
          <div
            data-slot="premium-header-actions"
            className={cn('flex shrink-0 items-center gap-2', slotClassNames?.actions)}
          >
            {actions}
          </div>
        ) : null}

        {children ? (
          <div
            data-slot="premium-header-children"
            className={cn('min-w-0', slotClassNames?.children)}
          >
            {children}
          </div>
        ) : null}
      </div>
    </motion.header>
  )
}

export { headerVariants, headerButtonVariants, headerNavItemVariants }
