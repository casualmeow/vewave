'use client'

import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
  useRef,
  useState,
} from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/shared/lib/utils'

const SPIN_ICON_SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const
const SPIN_ICON_SPEEDS = ['slow', 'normal', 'fast'] as const
const SPIN_ICON_SPEED_DURATIONS = {
  slow: '1400ms',
  normal: '900ms',
  fast: '550ms',
} as const

type SpinIconPresetSize = (typeof SPIN_ICON_SIZES)[number]
type SpinIconPresetSpeed = (typeof SPIN_ICON_SPEEDS)[number]

type SpinIconSize = SpinIconPresetSize | number | string
type SpinIconSpeed = SpinIconPresetSpeed | number | string
type SpinIconDuration = SpinIconPresetSpeed | number | string

type SpinIconBehavior = 'always' | 'hover' | 'drag' | 'dynamic' | 'none'
type SpinIconDirection = 'normal' | 'reverse'

type SpinIconVars = CSSProperties & {
  '--spin-icon-size'?: string
  '--spin-icon-duration'?: string
  '--spin-icon-hover-duration'?: string
  '--spin-icon-x'?: string
  '--spin-icon-y'?: string
  '--spin-icon-drag-rotate'?: string
}

const spinIconRootVariants = cva(
  [
    'group/spin-icon inline-flex items-center justify-center gap-2',
    'text-current align-[-0.125em]',
    '[--spin-icon-hover-duration:var(--spin-icon-duration)]',
  ],
  {
    variants: {
      size: {
        xs: '[--spin-icon-size:0.875rem]',
        sm: '[--spin-icon-size:1rem]',
        md: '[--spin-icon-size:1.25rem]',
        lg: '[--spin-icon-size:1.5rem]',
        xl: '[--spin-icon-size:2rem]',
      },
      speed: {
        slow: '[--spin-icon-duration:1400ms]',
        normal: '[--spin-icon-duration:900ms]',
        fast: '[--spin-icon-duration:550ms]',
      },
    },
    defaultVariants: {
      size: 'md',
      speed: 'normal',
    },
  },
)

const spinIconFrameVariants = cva([
  'group/spin-frame relative grid shrink-0 place-items-center',
  'size-[var(--spin-icon-size)]',
  'translate-x-[var(--spin-icon-x)] translate-y-[var(--spin-icon-y)]',
  'rotate-[var(--spin-icon-drag-rotate)]',
  'select-none touch-none',
  'data-[dragging=false]:transition-transform',
  'data-[draggable=true]:cursor-grab',
  'data-[dragging=true]:cursor-grabbing',
])

const spinIconMotionVariants = cva(
  [
    'grid size-full place-items-center',
    '[transform-origin:center]',
    'motion-reduce:animate-none',
    'group-data-[motion=off]/spin-icon:animate-none',
  ],
  {
    variants: {
      behavior: {
        always: [
          'animate-spin',
          '[animation-duration:var(--spin-icon-duration)]',
          '[animation-timing-function:linear]',
        ],
        hover: [
          '[animation:none]',
          'group-hover/spin-icon:[animation:spin_var(--spin-icon-hover-duration)_linear_1]',
          'group-data-[motion=off]/spin-icon:group-hover/spin-icon:[animation:none]',
        ],
        drag: [
          'animate-spin',
          '[animation-duration:var(--spin-icon-duration)]',
          '[animation-timing-function:linear]',
          '[animation-play-state:paused]',
          'group-data-[dragging=true]/spin-frame:[animation-play-state:running]',
        ],
        dynamic: [
          'animate-spin',
          '[animation-duration:var(--spin-icon-duration)]',
          '[animation-timing-function:linear]',
          'group-hover/spin-icon:[animation-duration:calc(var(--spin-icon-duration)*0.65)]',
          'group-data-[dragging=true]/spin-frame:[animation-duration:calc(var(--spin-icon-duration)*0.35)]',
        ],
        none: '',
      },
      direction: {
        normal: '',
        reverse: '[animation-direction:reverse]',
      },
    },
    defaultVariants: {
      behavior: 'always',
      direction: 'normal',
    },
  },
)

const spinIconGlyphVariants = cva('size-full shrink-0 text-current', {
  variants: {
    mutedTrack: {
      true: '[&_.spin-icon-track]:opacity-20',
      false: '[&_.spin-icon-track]:opacity-0',
    },
  },
  defaultVariants: {
    mutedTrack: true,
  },
})

function isPresetSize(size: SpinIconSize): size is SpinIconPresetSize {
  return SPIN_ICON_SIZES.includes(size as SpinIconPresetSize)
}

function isPresetSpeed(speed: SpinIconSpeed): speed is SpinIconPresetSpeed {
  return SPIN_ICON_SPEEDS.includes(speed as SpinIconPresetSpeed)
}

function resolveSize(size?: SpinIconSize): SpinIconVars | undefined {
  if (!size || isPresetSize(size)) return undefined
  if (typeof size === 'number') return { '--spin-icon-size': `${size}px` }

  return { '--spin-icon-size': size }
}

function resolveDurationValue(duration?: SpinIconDuration) {
  if (!duration) return undefined
  if (isPresetSpeed(duration)) return SPIN_ICON_SPEED_DURATIONS[duration]
  if (typeof duration === 'number') return `${duration}ms`

  return duration
}

function resolveDurationVar(
  variableName: '--spin-icon-duration' | '--spin-icon-hover-duration',
  duration?: SpinIconDuration,
): SpinIconVars | undefined {
  const value = resolveDurationValue(duration)

  return value ? { [variableName]: value } : undefined
}

function useSpinDrag(options: { enabled: boolean; factor?: number; resetOnDoubleClick?: boolean }) {
  const { enabled, factor = 0.7, resetOnDoubleClick = true } = options

  const [dragging, setDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0, rotation: 0 })

  const startRef = useRef({
    pointerX: 0,
    pointerY: 0,
    x: 0,
    y: 0,
    rotation: 0,
  })

  function onPointerDown(event: PointerEvent<HTMLElement>) {
    if (!enabled) return

    event.currentTarget.setPointerCapture(event.pointerId)

    startRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      x: position.x,
      y: position.y,
      rotation: position.rotation,
    }

    setDragging(true)
  }

  function onPointerMove(event: PointerEvent<HTMLElement>) {
    if (!enabled || !dragging) return

    const dx = event.clientX - startRef.current.pointerX
    const dy = event.clientY - startRef.current.pointerY

    setPosition({
      x: startRef.current.x + dx,
      y: startRef.current.y + dy,
      rotation: startRef.current.rotation + dx * factor,
    })
  }

  function onPointerUp(event: PointerEvent<HTMLElement>) {
    if (!enabled) return

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    setDragging(false)
  }

  function onDoubleClick() {
    if (!enabled || !resetOnDoubleClick) return

    setPosition({
      x: 0,
      y: 0,
      rotation: 0,
    })
  }

  return {
    dragging,
    position,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
      onDoubleClick,
    },
  }
}

export interface SpinIconRootProps
  extends Omit<ComponentPropsWithoutRef<'span'>, 'color'>,
    Omit<VariantProps<typeof spinIconRootVariants>, 'size' | 'speed'> {
  size?: SpinIconSize
  duration?: SpinIconDuration
  speed?: SpinIconSpeed
  hoverDuration?: SpinIconDuration
  hoverSpeed?: SpinIconSpeed
  color?: CSSProperties['color']
  disableMotion?: boolean
}

export function SpinIconRoot({
  size = 'md',
  duration,
  speed = 'normal',
  hoverDuration,
  hoverSpeed,
  color,
  disableMotion = false,
  className,
  style,
  ...props
}: SpinIconRootProps) {
  const inlineVars: SpinIconVars = {
    ...resolveSize(size),
    ...resolveDurationVar('--spin-icon-duration', duration ?? speed),
    ...resolveDurationVar('--spin-icon-hover-duration', hoverDuration ?? hoverSpeed),
    color,
    ...style,
  }

  return (
    <span
      className={cn(
        spinIconRootVariants({
          size: isPresetSize(size) ? size : undefined,
          speed: isPresetSpeed(speed) ? speed : undefined,
        }),
        className,
      )}
      data-motion={disableMotion ? 'off' : 'on'}
      style={inlineVars}
      {...props}
    />
  )
}

export interface SpinIconFrameProps
  extends Omit<ComponentPropsWithoutRef<'span'>, 'draggable'>,
    VariantProps<typeof spinIconMotionVariants> {
  children: ReactNode
  draggable?: boolean
  dragFactor?: number
  resetOnDoubleClick?: boolean
}

export function SpinIconFrame({
  behavior = 'always',
  direction = 'normal',
  draggable,
  dragFactor = 0.7,
  resetOnDoubleClick = true,
  className,
  style,
  children,
  ...props
}: SpinIconFrameProps) {
  const dragEnabled = draggable ?? behavior === 'drag'

  const drag = useSpinDrag({
    enabled: dragEnabled,
    factor: dragFactor,
    resetOnDoubleClick,
  })

  const inlineVars: SpinIconVars = {
    '--spin-icon-x': `${drag.position.x}px`,
    '--spin-icon-y': `${drag.position.y}px`,
    '--spin-icon-drag-rotate': `${drag.position.rotation}deg`,
    ...style,
  }

  return (
    <span
      className={cn(spinIconFrameVariants(), className)}
      data-draggable={dragEnabled}
      data-dragging={drag.dragging}
      style={inlineVars}
      {...drag.handlers}
      {...props}
    >
      <span className={cn(spinIconMotionVariants({ behavior, direction }))}>{children}</span>
    </span>
  )
}

export interface SpinIconGlyphProps
  extends Omit<ComponentPropsWithoutRef<'svg'>, 'children'>,
    VariantProps<typeof spinIconGlyphVariants> {
  variant?: 'arc' | 'ring' | 'dots'
  strokeWidth?: number
}

export function SpinIconGlyph({
  variant = 'arc',
  strokeWidth = 2.25,
  mutedTrack = true,
  className,
  ...props
}: SpinIconGlyphProps) {
  if (variant === 'dots') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        className={cn(spinIconGlyphVariants({ mutedTrack }), className)}
        {...props}
      >
        <circle cx="12" cy="3.5" r="2.2" opacity="1" />
        <circle cx="18.4" cy="5.6" r="1.9" opacity="0.8" />
        <circle cx="20.5" cy="12" r="1.6" opacity="0.6" />
        <circle cx="18.4" cy="18.4" r="1.35" opacity="0.45" />
        <circle cx="12" cy="20.5" r="1.15" opacity="0.3" />
      </svg>
    )
  }

  if (variant === 'ring') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className={cn(spinIconGlyphVariants({ mutedTrack }), className)}
        {...props}
      >
        <circle
          className="spin-icon-track"
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth={strokeWidth}
        />

        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray="42 18"
        />
      </svg>
    )
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn(spinIconGlyphVariants({ mutedTrack }), className)}
      {...props}
    >
      <circle
        className="spin-icon-track"
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />

      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  )
}

export interface SpinIconLabelProps extends ComponentPropsWithoutRef<'span'> {}

export function SpinIconLabel({ className, ...props }: SpinIconLabelProps) {
  return <span className={cn('whitespace-nowrap text-sm leading-none', className)} {...props} />
}

export interface SpinIconProps extends SpinIconRootProps {
  children?: ReactNode
  label?: string
  showLabel?: boolean
  glyph?: SpinIconGlyphProps['variant']
  behavior?: SpinIconBehavior
  direction?: SpinIconDirection
  draggable?: boolean
  dragFactor?: number
  resetOnDoubleClick?: boolean
}

function SpinIconBase({
  children,
  label,
  showLabel = false,
  glyph = 'arc',
  behavior = 'always',
  direction = 'normal',
  draggable,
  dragFactor,
  resetOnDoubleClick,
  ...props
}: SpinIconProps) {
  const accessibilityProps = label
    ? {
        role: 'status',
        'aria-live': 'polite' as const,
        'aria-label': showLabel ? undefined : label,
      }
    : {
        'aria-hidden': true,
      }

  return (
    <SpinIconRoot {...accessibilityProps} {...props}>
      <SpinIconFrame
        behavior={behavior}
        direction={direction}
        draggable={draggable}
        dragFactor={dragFactor}
        resetOnDoubleClick={resetOnDoubleClick}
      >
        {children ?? <SpinIconGlyph variant={glyph} />}
      </SpinIconFrame>

      {showLabel && label ? <SpinIconLabel>{label}</SpinIconLabel> : null}
    </SpinIconRoot>
  )
}

export const SpinIcon = Object.assign(SpinIconBase, {
  Root: SpinIconRoot,
  Frame: SpinIconFrame,
  Glyph: SpinIconGlyph,
  Label: SpinIconLabel,
})
