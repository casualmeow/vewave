import { type motion } from 'motion/react'
import type { ComponentProps, ReactNode } from 'react'
import type { HeaderNavItemProps } from '@/components/header'
import type { GlassFluidInteractionProps, GlassFluidPreset } from '@/components/glass'

export type HeaderVariant =
  | 'glass'
  | 'glassDark'
  | 'glassLight'
  | 'liquidGlass'
  | 'telegramGlass'
  | 'solid'
  | 'gradient'
  | 'glow'

export type HeaderSize = 'sm' | 'md' | 'lg'

export type HeaderBlurIntensity = 'none' | 'sm' | 'md' | 'lg' | 'xl'

export type HeaderMotionPreset = 'gentle' | 'spring' | 'smooth' | 'snappy' | 'bouncy'

export type HeaderCollapseBehavior = 'scroll' | 'manual' | 'none'

export type HeaderPosition = 'fixed' | 'sticky' | 'absolute'

export type CSSLength = number | string

export type MotionHeaderStyle = NonNullable<ComponentProps<typeof motion.header>['style']>

export type CSSVariableStyle = MotionHeaderStyle & {
  '--header-blur'?: string
  '--header-glow'?: string
  '--header-pointer-x'?: string
  '--header-pointer-y'?: string
  '--header-sheen-x'?: string
  '--header-sheen-y'?: string
  '--header-glass-spot-opacity'?: string | number
  '--header-liquid-intensity'?: string | number
  backdropFilter?: string
  WebkitBackdropFilter?: string
}

export type HeaderFluidPreset = GlassFluidPreset

export type HeaderFluidInteractionProps = Pick<
  GlassFluidInteractionProps,
  | 'magneticStrength'
  | 'magneticVerticalStrength'
  | 'tiltStrength'
  | 'liquidIntensity'
  | 'hoverScale'
>

export interface HeaderSlotClassNames {
  inner?: string
  logo?: string
  navigation?: string
  actions?: string
  children?: string
}

export type PremiumHeaderSlotClassNames = HeaderSlotClassNames

export type HeaderItem = Omit<HeaderNavItemProps, 'children' | 'ref' | 'href'> & {
  label: ReactNode
  href: string
}
