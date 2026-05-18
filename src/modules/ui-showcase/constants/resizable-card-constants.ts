import type {
  ContentDensity,
  ResizableCardAnimationFamilyFilter,
  ResizableCardPresentation,
  ResizableCardShowcaseState,
} from '../types'
import {
  RESIZABLE_CARD_ANIMATION_PRESET_DEFINITIONS as COMPONENT_ANIMATION_PRESET_DEFINITIONS,
  RESIZABLE_CARD_ANIMATION_PRESETS as COMPONENT_ANIMATION_PRESETS,
  type ResizableCardAnimationPreset,
  type ResizableCardSizeVariant,
  type ResizableCardVariant,
} from '@/components/resizable-card'

export const RESIZABLE_CARD_DEFAULT_STATE: ResizableCardShowcaseState = {
  presentation: 'inline',
  animationPreset: 'fade-scale',
  animationFamily: 'all',
  variant: 'outline',
  size: 'default',
  resizable: true,
  closeOnBackdropClick: true,
  closeOnEscape: true,
  lockBodyScroll: true,
  showMedia: true,
  showAction: true,
  density: 'comfortable',
  compactMinHeight: 112,
  initialWidth: 760,
  initialHeight: 640,
  minWidth: 360,
  minHeight: 420,
  maxWidth: 1120,
  maxHeight: 860,
}

export const RESIZABLE_CARD_PRESENTATIONS: Array<ResizableCardPresentation> = ['inline', 'media']

export const RESIZABLE_CARD_ANIMATION_PRESETS: Array<ResizableCardAnimationPreset> =
  COMPONENT_ANIMATION_PRESETS

export const RESIZABLE_CARD_ANIMATION_PRESET_DEFINITIONS = COMPONENT_ANIMATION_PRESET_DEFINITIONS

export const RESIZABLE_CARD_ANIMATION_FAMILIES: Array<ResizableCardAnimationFamilyFilter> = [
  'all',
  'morph',
  'axis',
  'fade',
  'expressive',
  'content',
]

export const RESIZABLE_CARD_VARIANTS: Array<ResizableCardVariant> = [
  'default',
  'secondary',
  'outline',
  'ghost',
  'destructive',
]

export const RESIZABLE_CARD_SIZES: Array<ResizableCardSizeVariant> = ['sm', 'default', 'lg']

export const RESIZABLE_CARD_DENSITIES: Array<ContentDensity> = ['compact', 'comfortable', 'dense']
