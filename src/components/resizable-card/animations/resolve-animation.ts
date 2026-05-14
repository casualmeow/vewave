import { RESIZABLE_CARD_ANIMATION_PRESET_MAP, RESIZABLE_CARD_ANIMATION_PRESETS } from './presets'
import type {
  ExpandableCardPresentation,
  ResizableCardAnimationPreset,
  ResizableCardResolvedTransition,
  ResizableCardTransitionPreset,
} from '../types'

const legacyPresetMap: Partial<
  Record<ResizableCardTransitionPreset, ResizableCardAnimationPreset>
> = {
  morph: 'container-morph',
  'soft-morph': 'soft-container-morph',
  fade: 'container-fade',
}

export function getDefaultResizableCardAnimationPreset(
  presentation: ExpandableCardPresentation,
): ResizableCardAnimationPreset {
  if (presentation === 'inline') return 'fade-scale'
  if (presentation === 'standard') return 'soft-container-morph'

  return 'media-led-morph'
}

export function normalizeResizableCardAnimationPreset(
  preset: ResizableCardTransitionPreset | undefined,
): ResizableCardAnimationPreset | undefined {
  if (!preset) return undefined

  if (preset in legacyPresetMap) {
    return legacyPresetMap[preset]
  }

  if ((RESIZABLE_CARD_ANIMATION_PRESETS as Array<string>).includes(preset)) {
    return preset as ResizableCardAnimationPreset
  }

  return undefined
}

export function getResizableCardAnimationPresetDefinition(preset: ResizableCardTransitionPreset) {
  const normalized = normalizeResizableCardAnimationPreset(preset)

  return normalized ? RESIZABLE_CARD_ANIMATION_PRESET_MAP.get(normalized) : undefined
}

export function resolveResizableCardAnimation({
  presentation,
  animationPreset,
  transitionPreset,
  reducedMotion,
}: {
  presentation: ExpandableCardPresentation
  animationPreset?: ResizableCardAnimationPreset
  transitionPreset?: ResizableCardTransitionPreset
  reducedMotion: boolean
}): ResizableCardResolvedTransition {
  const resolvedPreset = reducedMotion
    ? 'instant'
    : (normalizeResizableCardAnimationPreset(animationPreset) ??
      normalizeResizableCardAnimationPreset(transitionPreset) ??
      getDefaultResizableCardAnimationPreset(presentation))

  const definition = RESIZABLE_CARD_ANIMATION_PRESET_MAP.get(resolvedPreset)

  if (definition) return definition

  return RESIZABLE_CARD_ANIMATION_PRESET_MAP.get(
    getDefaultResizableCardAnimationPreset(presentation),
  ) as ResizableCardResolvedTransition
}

export const resolveResizableCardTransition = resolveResizableCardAnimation

export const getDefaultResizableCardTransitionPreset = getDefaultResizableCardAnimationPreset
