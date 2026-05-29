import type * as TabsPrimitive from '@radix-ui/react-tabs'
import type { ComponentPropsWithoutRef, Dispatch, ReactNode, Ref, SetStateAction } from 'react'
import type {
  GlassFilterIds,
  GlassFluidInteractionProps,
  GlassFluidPreset,
  GlassResolvedFluidConfig,
} from '@/components/glass'

export type TabsDesign = 'solid' | 'glass' | 'liquidGlass' | 'telegramGlass'
export type TabsSize = 'sm' | 'md' | 'lg'
export type TabsMotion = 'none' | 'soft' | 'fluid'
export type TabsOrientation = 'horizontal' | 'vertical'

export type TabsContextValue = {
  scopeId: string
  filterIds: GlassFilterIds
  design: TabsDesign
  size: TabsSize
  orientation: TabsOrientation
  fullWidth: boolean
  motion: TabsMotion
  interactiveGlass: boolean
  fluidPreset: GlassFluidPreset
  fluidConfig: GlassResolvedFluidConfig
  activeValue: string | undefined
  focusedValue: string | null
  setFocusedValue: Dispatch<SetStateAction<string | null>>
}

export interface TabsProps
  extends Omit<
      ComponentPropsWithoutRef<typeof TabsPrimitive.Root>,
      'children' | 'defaultValue' | 'onValueChange' | 'orientation' | 'value'
    >,
    GlassFluidInteractionProps {
  ref?: Ref<HTMLDivElement>
  design?: TabsDesign
  size?: TabsSize
  orientation?: TabsOrientation
  fullWidth?: boolean
  motion?: TabsMotion
  fluidPreset?: GlassFluidPreset
  interactiveGlass?: boolean
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  children: ReactNode
}

export interface TabsListProps
  extends Omit<ComponentPropsWithoutRef<typeof TabsPrimitive.List>, 'children'> {
  ref?: Ref<HTMLDivElement>
  children: ReactNode
}

export interface TabsTriggerProps
  extends Omit<ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>, 'children'>,
    GlassFluidInteractionProps {
  ref?: Ref<HTMLButtonElement>
  icon?: ReactNode
  badge?: ReactNode
  children: ReactNode
}

export interface TabsContentProps
  extends Omit<ComponentPropsWithoutRef<typeof TabsPrimitive.Content>, 'children'> {
  ref?: Ref<HTMLDivElement>
  inset?: boolean
  children: ReactNode
}
