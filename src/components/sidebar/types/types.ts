import type {
  ButtonHTMLAttributes,
  ComponentPropsWithoutRef,
  HTMLAttributeAnchorTarget,
  HTMLAttributes,
  ReactNode,
  Ref,
  Dispatch,
  SetStateAction,
} from 'react'

export type SidebarDesign = 'solid' | 'glass' | 'liquidGlass' | 'fluent'
export type SidebarSize = 'sm' | 'md' | 'lg'
export type SidebarDensity = 'compact' | 'comfortable'
export type SidebarMotion = 'none' | 'soft' | 'fluid'
export type SidebarFluidPreset = 'subtle' | 'balanced' | 'expressive' | 'extreme'
export type SidebarDragMode = 'none' | 'x' | 'y' | 'both'
export type SidebarMobileMode = 'auto' | 'off' | 'only'
export type SidebarMobileDockPlacement = 'container' | 'app' | 'viewport' | 'inline'

export type SidebarResolvedFluidConfig = {
  hoverScale: number
  activeHoverScale: number
  dragScale: number
  hoverSize: number
  magneticStrength: number
  magneticVerticalStrength: number
  tiltStrength: number
  focusBlur: boolean
  focusBlurAmount: number
  focusDimOpacity: number
  liquidIntensity: number
  dragMode: SidebarDragMode
}

export type SidebarFluidInteractionProps = {
  hoverScale?: number
  activeHoverScale?: number
  dragScale?: number
  hoverSize?: number
  magneticStrength?: number
  magneticVerticalStrength?: number
  tiltStrength?: number
  focusBlur?: boolean
  focusBlurAmount?: number
  focusDimOpacity?: number
  liquidIntensity?: number
  dragMode?: SidebarDragMode
}

export type SidebarFilterIds = {
  goo: string
  gooStrong: string
  refraction: string
}

export type SidebarContextValue = {
  scopeId: string
  filterIds: SidebarFilterIds
  design: SidebarDesign
  size: SidebarSize
  density: SidebarDensity
  collapsed: boolean
  motion: SidebarMotion
  interactiveGlass: boolean
  fluidPreset: SidebarFluidPreset
  fluidConfig: SidebarResolvedFluidConfig
  focusedItemKey: string | null
  setFocusedItemKey: Dispatch<SetStateAction<string | null>>
  activeItemKey: string | null
  setActiveItemKey: Dispatch<SetStateAction<string | null>>
}

export interface SidebarRootProps
  extends Omit<
    ComponentPropsWithoutRef<'aside'>,
    | 'children'
    | 'onDrag'
    | 'onDragStart'
    | 'onDragEnd'
    | 'onDragEnter'
    | 'onDragExit'
    | 'onDragLeave'
    | 'onDragOver'
    | 'onAnimationStart'
    | 'onAnimationEnd'
    | 'onAnimationIteration'
  > {
  ref?: Ref<HTMLElement>
  design?: SidebarDesign
  size?: SidebarSize
  density?: SidebarDensity
  collapsed?: boolean
  motion?: SidebarMotion
  fluidPreset?: SidebarFluidPreset
  hoverScale?: SidebarFluidInteractionProps['hoverScale']
  activeHoverScale?: SidebarFluidInteractionProps['activeHoverScale']
  dragScale?: SidebarFluidInteractionProps['dragScale']
  hoverSize?: SidebarFluidInteractionProps['hoverSize']
  magneticStrength?: SidebarFluidInteractionProps['magneticStrength']
  magneticVerticalStrength?: SidebarFluidInteractionProps['magneticVerticalStrength']
  tiltStrength?: SidebarFluidInteractionProps['tiltStrength']
  focusBlur?: SidebarFluidInteractionProps['focusBlur']
  focusBlurAmount?: SidebarFluidInteractionProps['focusBlurAmount']
  focusDimOpacity?: SidebarFluidInteractionProps['focusDimOpacity']
  liquidIntensity?: SidebarFluidInteractionProps['liquidIntensity']
  dragMode?: SidebarFluidInteractionProps['dragMode']
  children: ReactNode
}

export interface SidebarBrandProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'title'> {
  ref?: Ref<HTMLDivElement>
  visual?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  meta?: ReactNode
}

export interface SidebarSectionProps
  extends Omit<ComponentPropsWithoutRef<'section'>, 'children' | 'title'> {
  ref?: Ref<HTMLElement>
  title?: ReactNode
  children: ReactNode
}

export interface SidebarFooterProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  ref?: Ref<HTMLDivElement>
  children: ReactNode
}

export interface SidebarItemProps
  extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'aria-current'> {
  ref?: Ref<HTMLElement>
  asChild?: boolean
  icon?: ReactNode
  badge?: ReactNode
  href?: string
  target?: HTMLAttributeAnchorTarget
  rel?: string
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type']
  value?: string
  active?: boolean
  disabled?: boolean
  hoverScale?: SidebarFluidInteractionProps['hoverScale']
  activeHoverScale?: SidebarFluidInteractionProps['activeHoverScale']
  dragScale?: SidebarFluidInteractionProps['dragScale']
  hoverSize?: SidebarFluidInteractionProps['hoverSize']
  magneticStrength?: SidebarFluidInteractionProps['magneticStrength']
  magneticVerticalStrength?: SidebarFluidInteractionProps['magneticVerticalStrength']
  tiltStrength?: SidebarFluidInteractionProps['tiltStrength']
  focusBlur?: SidebarFluidInteractionProps['focusBlur']
  focusBlurAmount?: SidebarFluidInteractionProps['focusBlurAmount']
  focusDimOpacity?: SidebarFluidInteractionProps['focusDimOpacity']
  liquidIntensity?: SidebarFluidInteractionProps['liquidIntensity']
  dragMode?: SidebarFluidInteractionProps['dragMode']
  children: ReactNode
}

export interface SidebarItemPartProps extends HTMLAttributes<HTMLSpanElement> {
  ref?: Ref<HTMLSpanElement>
}
