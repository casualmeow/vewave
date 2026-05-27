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
export type SidebarMobileDockPlacement = 'app' | 'viewport'

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

export type SidebarContextValue = {
  scopeId: string
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
  mobileMode?: SidebarMobileMode
  mobileFluidPreset?: SidebarFluidPreset
  mobileHoverScale?: number
  mobileActiveHoverScale?: number
  mobileDragScale?: number
  mobileHoverSize?: number
  mobileMagneticStrength?: number
  mobileMagneticVerticalStrength?: number
  mobileTiltStrength?: number
  mobileFocusBlur?: boolean
  mobileFocusBlurAmount?: number
  mobileFocusDimOpacity?: number
  mobileLiquidIntensity?: number
  mobileDragMode?: SidebarDragMode
  mobileDockDragMode?: SidebarDragMode
  mobileMaxItems?: number
  mobileDockPlacement?: SidebarMobileDockPlacement
  mobileDockClassName?: string
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
  mobileMode?: SidebarMobileMode
  mobileFluidPreset?: SidebarFluidPreset
  mobileHoverScale?: number
  mobileActiveHoverScale?: number
  mobileDragScale?: number
  mobileHoverSize?: number
  mobileMagneticStrength?: number
  mobileMagneticVerticalStrength?: number
  mobileTiltStrength?: number
  mobileFocusBlur?: boolean
  mobileFocusBlurAmount?: number
  mobileFocusDimOpacity?: number
  mobileLiquidIntensity?: number
  mobileDragMode?: SidebarDragMode
  mobileDockDragMode?: SidebarDragMode
  mobileMaxItems?: number
  mobileDockPlacement?: SidebarMobileDockPlacement
  mobileDockClassName?: string
  children: ReactNode
}

export interface SidebarItemPartProps extends HTMLAttributes<HTMLSpanElement> {
  ref?: Ref<HTMLSpanElement>
}
