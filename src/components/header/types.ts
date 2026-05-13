import { type motion } from 'framer-motion'

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

export interface PremiumHeaderSlotClassNames {
  inner?: string
  logo?: string
  navigation?: string
  actions?: string
  children?: string
}
