import { type motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { HeaderNavItemProps } from '@/components/header'

export type HeaderVariant = 'glass' | 'glassDark' | 'glassLight' | 'solid' | 'gradient' | 'glow'

export type HeaderSize = 'sm' | 'md' | 'lg'

export type HeaderBlurIntensity = 'none' | 'sm' | 'md' | 'lg' | 'xl'

export type HeaderMotionPreset = 'gentle' | 'spring' | 'smooth' | 'snappy' | 'bouncy'

export type HeaderCollapseBehavior = 'scroll' | 'manual' | 'none'

export type HeaderPosition = 'fixed' | 'sticky' | 'absolute'

export type CSSLength = number | string

export type MotionHeaderStyle = NonNullable<React.ComponentProps<typeof motion.header>['style']>

export type CSSVariableStyle = MotionHeaderStyle & {
  '--header-blur'?: string
  '--header-glow'?: string
}

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
