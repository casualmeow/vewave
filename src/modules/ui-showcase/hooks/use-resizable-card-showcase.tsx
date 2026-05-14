import { useMemo, useState } from 'react'

import {
  RESIZABLE_CARD_ANIMATION_PRESET_DEFINITIONS,
  RESIZABLE_CARD_DEFAULT_STATE,
} from '../constants'

import type {
  ResizableCardAnimationFamilyFilter,
  ResizableCardPresentation,
  ResizableCardShowcaseState,
} from '../types/types'

const presentationSizing: Record<
  ResizableCardPresentation,
  Pick<
    ResizableCardShowcaseState,
    'compactMinHeight' | 'initialWidth' | 'initialHeight' | 'animationPreset'
  >
> = {
  inline: {
    compactMinHeight: 112,
    initialWidth: 760,
    initialHeight: 640,
    animationPreset: 'fade-scale',
  },
  media: {
    compactMinHeight: 320,
    initialWidth: 540,
    initialHeight: 720,
    animationPreset: 'media-led-morph',
  },
}

export function useResizableCardShowcase() {
  const [state, setState] = useState<ResizableCardShowcaseState>(RESIZABLE_CARD_DEFAULT_STATE)

  const updateState = <TKey extends keyof ResizableCardShowcaseState>(
    key: TKey,
    value: ResizableCardShowcaseState[TKey],
  ) => {
    setState((current) => ({
      ...current,
      [key]: value,
    }))
  }

  const updatePresentation = (presentation: ResizableCardPresentation) => {
    setState((current) => ({
      ...current,
      presentation,
      ...presentationSizing[presentation],
    }))
  }

  const updateAnimationFamily = (animationFamily: ResizableCardAnimationFamilyFilter) => {
    setState((current) => {
      const nextPreset =
        animationFamily === 'all'
          ? current.animationPreset
          : (RESIZABLE_CARD_ANIMATION_PRESET_DEFINITIONS.find(
              (preset) => preset.family === animationFamily,
            )?.id ?? current.animationPreset)

      return {
        ...current,
        animationFamily,
        animationPreset: nextPreset,
      }
    })
  }

  const expandedSize = useMemo(
    () => ({
      initialWidth: state.initialWidth,
      initialHeight: state.initialHeight,
      minWidth: state.minWidth,
      minHeight: state.minHeight,
      maxWidth: state.maxWidth,
      maxHeight: state.maxHeight,
      viewportPadding: 18,
    }),
    [
      state.initialHeight,
      state.initialWidth,
      state.maxHeight,
      state.maxWidth,
      state.minHeight,
      state.minWidth,
    ],
  )

  return {
    state,
    expandedSize,
    updateAnimationFamily,
    updatePresentation,
    updateState,
  }
}
