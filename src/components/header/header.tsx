'use client'

import {
  type ComponentPropsWithoutRef,
  type FocusEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type Ref,
  type RefObject,
  useId,
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
  type HeaderFluidPreset,
  type HeaderMotionPreset,
  type HeaderPosition,
  type HeaderSize,
  type HeaderVariant,
  type HeaderSlotClassNames,
} from './types'
import { toLength } from './helpers'
import {
  useHeaderCollapsedState,
  useHeaderInteractiveGlass,
  useHeaderMotion,
  useHeaderVisibility,
} from './hooks'
import { HeaderContent, HeaderGlow, HeaderRefractionFilter, HeaderSurfaceEffects } from './ui'
import { cn } from '@/shared/lib/utils'

type MotionHeaderNativeProps = Omit<
  ComponentPropsWithoutRef<typeof motion.header>,
  'animate' | 'children' | 'initial' | 'transition'
>

function isInteractiveHeaderVariant(variant: HeaderVariant) {
  return variant === 'glass' || variant === 'liquidGlass' || variant === 'telegramGlass'
}

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

  /** Enables pointer-reactive shine, small magnetic tilt, and SVG refraction for glass variants. */
  interactiveGlass?: boolean
  /** Reuses the same fluid presets as the sidebar/tabs glass system. */
  fluidPreset?: HeaderFluidPreset
  magneticStrength?: number
  magneticVerticalStrength?: number
  tiltStrength?: number
  liquidIntensity?: number

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
  glowColor = 'color-mix(in srgb, var(--primary) 34%, transparent)',

  motionPreset = 'spring',
  smoothScrollMotion = true,
  hideOnScrollDown = false,
  revealAtTop = 20,
  interactiveGlass = true,
  fluidPreset = 'subtle',
  magneticStrength,
  magneticVerticalStrength,
  tiltStrength,
  liquidIntensity,
  scrollContainerRef,

  onFocusCapture,
  onPointerMove,
  onPointerLeave,
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

  const scopeId = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const refractionId = `${scopeId}-header-refraction`

  const {
    canInteractiveGlass,
    fluidConfig,
    fluidTransformStyle,
    handleFocusCapture: glassHandleFocusCapture,
    handlePointerMove: glassHandlePointerMove,
    handlePointerLeave: glassHandlePointerLeave,
  } = useHeaderInteractiveGlass({
    interactiveGlass,
    variant,
    fluidPreset,
    magneticStrength,
    magneticVerticalStrength,
    tiltStrength,
    liquidIntensity,
    prefersReducedMotion,
    onRevealHeader: revealHeader,
  })

  const handleFocusCapture = (event: FocusEvent<HTMLElement>) => {
    glassHandleFocusCapture(event)
    onFocusCapture?.(event)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    onPointerMove?.(event)
    glassHandlePointerMove(event)
  }

  const handlePointerLeave = (event: ReactPointerEvent<HTMLElement>) => {
    onPointerLeave?.(event)
    glassHandlePointerLeave(event)
  }

  const blurValue = BLUR_VALUE[blurIntensity]
  const backdropFilter = `blur(${blurValue}) saturate(${variant === 'telegramGlass' ? 180 : 210}%)`

  const mergedStyle: CSSVariableStyle = {
    ...style,
    top: topOffset,
    width,
    minWidth: toLength(minWidth),
    maxWidth: toLength(maxWidth),
    borderRadius,
    '--header-blur': blurValue,
    '--header-glow': glowColor,
    '--header-pointer-x': '50%',
    '--header-pointer-y': '10%',
    '--header-sheen-x': '18%',
    '--header-sheen-y': '10%',
    '--header-glass-spot-opacity': variant === 'telegramGlass' ? 0.18 : 0.24,
    '--header-liquid-intensity': fluidConfig.liquidIntensity,
    backdropFilter,
    WebkitBackdropFilter: backdropFilter,
  }

  return (
    <motion.header
      ref={ref}
      data-slot="premium-header"
      data-state={isCollapsed ? 'collapsed' : 'expanded'}
      data-hidden={isHidden ? 'true' : 'false'}
      data-variant={variant}
      data-interactive-glass={canInteractiveGlass ? 'true' : 'false'}
      className={cn(
        headerVariants({ position, size, variant }),
        isHidden && 'pointer-events-none',
        className,
      )}
      style={{
        ...mergedStyle,
        ...fluidTransformStyle,
      }}
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
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      {...props}
    >
      {isInteractiveHeaderVariant(variant) ? (
        <HeaderRefractionFilter id={refractionId} variant={variant} />
      ) : null}

      <HeaderGlow showGlow={showGlow} prefersReducedMotion={Boolean(prefersReducedMotion)} />
      <HeaderSurfaceEffects variant={variant} refractionId={refractionId} />

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
