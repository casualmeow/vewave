import { RESIZABLE_CARD_ANIMATION_PRESET_MAP, RESIZABLE_CARD_ANIMATION_PRESETS } from './presets'
import type {
  ResizableCardPresentation,
  ResizableCardAnimationPreset,
  ResizableCardResolvedTransition,
} from '../types'

export function getDefaultResizableCardAnimationPreset(
  presentation: ResizableCardPresentation,
): ResizableCardAnimationPreset {
  if (presentation === 'inline') return 'fade-scale'

  return 'surface-grow'
}

export function normalizeResizableCardAnimationPreset(
  preset: ResizableCardAnimationPreset | undefined,
): ResizableCardAnimationPreset | undefined {
  if (!preset) return undefined

  if ((RESIZABLE_CARD_ANIMATION_PRESETS as Array<string>).includes(preset)) {
    return preset
  }

  return undefined
}

export function getResizableCardAnimationPresetDefinition(preset: ResizableCardAnimationPreset) {
  const normalized = normalizeResizableCardAnimationPreset(preset)

  return normalized ? RESIZABLE_CARD_ANIMATION_PRESET_MAP.get(normalized) : undefined
}

export function resolveResizableCardAnimation({
  presentation,
  animationPreset,
  reducedMotion,
}: {
  presentation: ResizableCardPresentation
  animationPreset?: ResizableCardAnimationPreset
  reducedMotion: boolean
}): ResizableCardResolvedTransition {
  const resolvedPreset = reducedMotion
    ? 'instant'
    : (normalizeResizableCardAnimationPreset(animationPreset) ??
      getDefaultResizableCardAnimationPreset(presentation))

  const definition = RESIZABLE_CARD_ANIMATION_PRESET_MAP.get(resolvedPreset)

  if (definition) return definition

  return RESIZABLE_CARD_ANIMATION_PRESET_MAP.get(
    getDefaultResizableCardAnimationPreset(presentation),
  ) as ResizableCardResolvedTransition
}
