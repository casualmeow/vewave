'use client'

import {
  type ComponentPropsWithoutRef,
  type FocusEvent,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react'
import { motion } from 'motion/react'

import {
  BLUR_VALUE,
  HEADER_HEIGHT,
  HIDE_TRANSITIONS,
  headerButtonVariants,
  headerNavItemVariants,
  headerVariants,
} from './constants'
import {
  type CSSLength,
  type CSSVariableStyle,
  type HeaderBlurIntensity,
  type HeaderCollapseBehavior,
  type HeaderMotionPreset,
  type HeaderPosition,
  type HeaderSize,
  type HeaderVariant,
  type HeaderSlotClassNames,
} from './types'
import { toLength } from './helpers'
import { useHeaderCollapsedState, useHeaderMotion, useHeaderVisibility } from './hooks'
import { HeaderContent, HeaderGlow } from './ui'

import { cn } from '@/shared/lib/utils'

type MotionHeaderNativeProps = Omit<
  ComponentPropsWithoutRef<typeof motion.header>,
  'animate' | 'children' | 'initial' | 'transition'
>

export interface HeaderProps extends MotionHeaderNativeProps {
  ref?: Ref<HTMLElement>

  variant?: HeaderVariant
  size?: HeaderSize
  position?: HeaderPosition

  logo?: ReactNode
  navigation?: ReactNode
  actions?: ReactNode
  children?: ReactNode

  slotClassNames?: HeaderSlotClassNames

  initialWidth?: CSSLength
  collapsedWidth?: CSSLength
  minWidth?: CSSLength
  maxWidth?: CSSLength

  scrollDistance?: number
  collapseThreshold?: number
  collapseBehavior?: HeaderCollapseBehavior
  collapsed?: boolean
  defaultCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void

  hideNavOnCollapse?: boolean
  navigationLabel?: string

  blurIntensity?: HeaderBlurIntensity
  borderRadiusExpanded?: number
  borderRadiusCollapsed?: number
  topOffset?: number
  showGlow?: boolean
  glowColor?: string

  motionPreset?: HeaderMotionPreset
  smoothScrollMotion?: boolean
  hideOnScrollDown?: boolean
  revealAtTop?: number

  /**
   * Optional scroll container used for scroll-linked collapse and hide-on-scroll.
   * Defaults to document scroll when omitted.
   */
  scrollContainerRef?: RefObject<HTMLElement | null>
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
  scrollContainerRef,

  onFocusCapture,
  ...props
}: HeaderProps) {
  const {
    scrollY,
    progress,
    width,
    borderRadius,
    navOpacity,
    navScale,
    prefersReducedMotion,
    manualCollapsed,
    safeCollapseThreshold,
  } = useHeaderMotion({
    initialWidth,
    collapsedWidth,
    scrollDistance,
    collapseThreshold,
    collapseBehavior,
    collapsed,
    defaultCollapsed,
    borderRadiusExpanded,
    borderRadiusCollapsed,
    motionPreset,
    smoothScrollMotion,
    scrollContainerRef,
  })

  const isCollapsed = useHeaderCollapsedState({
    progress,
    collapseBehavior,
    manualCollapsed,
    collapseThreshold: safeCollapseThreshold,
    onCollapsedChange,
  })

  const { isHidden, revealHeader } = useHeaderVisibility({
    scrollY,
    hideOnScrollDown,
    revealAtTop,
  })

  const handleFocusCapture = (event: FocusEvent<HTMLElement>) => {
    revealHeader()
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
      <HeaderGlow showGlow={showGlow} prefersReducedMotion={Boolean(prefersReducedMotion)} />

      <HeaderContent
        logo={logo}
        navigation={navigation}
        actions={actions}
        slotClassNames={slotClassNames}
        navigationLabel={navigationLabel}
        hideNavOnCollapse={hideNavOnCollapse}
        isCollapsed={isCollapsed}
        navOpacity={navOpacity}
        navScale={navScale}
      >
        {children}
      </HeaderContent>
    </motion.header>
  )
}

export { headerVariants, headerButtonVariants, headerNavItemVariants }
