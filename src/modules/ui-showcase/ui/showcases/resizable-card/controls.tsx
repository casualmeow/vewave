import {
  RESIZABLE_CARD_ANIMATION_FAMILIES,
  RESIZABLE_CARD_ANIMATION_PRESET_DEFINITIONS,
  RESIZABLE_CARD_ANIMATION_PRESETS,
  RESIZABLE_CARD_DENSITIES,
  RESIZABLE_CARD_PRESENTATIONS,
  RESIZABLE_CARD_SIZES,
  RESIZABLE_CARD_VARIANTS,
} from '../../../constants'
import { CheckboxField, ControlCard, SelectField, SliderField } from '../../controls'
import type {
  ResizableCardAnimationFamilyFilter,
  ResizableCardPresentation,
  ResizableCardShowcaseState,
} from '../../../types'

interface ResizableCardShowcaseControlsProps {
  state: ResizableCardShowcaseState
  onPresentationChange: (presentation: ResizableCardPresentation) => void
  onAnimationFamilyChange: (family: ResizableCardAnimationFamilyFilter) => void
  onStateChange: <TKey extends keyof ResizableCardShowcaseState>(
    key: TKey,
    value: ResizableCardShowcaseState[TKey],
  ) => void
}

export function ResizableCardShowcaseControls({
  state,
  onPresentationChange,
  onAnimationFamilyChange,
  onStateChange,
}: ResizableCardShowcaseControlsProps) {
  const isMediaGrid = state.presentation === 'media'
  const presetOptions =
    state.animationFamily === 'all'
      ? RESIZABLE_CARD_ANIMATION_PRESETS
      : RESIZABLE_CARD_ANIMATION_PRESET_DEFINITIONS.filter(
          (preset) => preset.family === state.animationFamily,
        ).map((preset) => preset.id)
  const selectedPreset = RESIZABLE_CARD_ANIMATION_PRESET_DEFINITIONS.find(
    (preset) => preset.id === state.animationPreset,
  )

  return (
    <aside className="space-y-4">
      <ControlCard title="Presentation">
        <SelectField
          label="Structure"
          value={state.presentation}
          options={RESIZABLE_CARD_PRESENTATIONS}
          onChange={onPresentationChange}
        />
        <p className="text-sm leading-6 text-muted-foreground">
          Inline keeps the utility layout. Media uses the polished resizable-card structure with a
          media surface, stable text motion, and independently revealed details.
        </p>
      </ControlCard>

      <ControlCard title="Animation">
        <SelectField
          label="Family"
          value={state.animationFamily}
          options={RESIZABLE_CARD_ANIMATION_FAMILIES}
          onChange={onAnimationFamilyChange}
        />
        <SelectField
          label="Transition preset"
          value={state.animationPreset}
          options={presetOptions}
          onChange={(value) => onStateChange('animationPreset', value)}
        />
        <p className="text-sm leading-6 text-muted-foreground">
          {selectedPreset?.description ??
            'Shared-layout morphs are richest when compact and expanded geometry match.'}
        </p>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Family: {selectedPreset?.family ?? 'n/a'} · Recommended:{' '}
          {selectedPreset?.recommendedPresentation ?? 'both'}
        </p>
      </ControlCard>

      <ControlCard title="Visual style">
        <SelectField
          label="Variant"
          value={state.variant}
          options={RESIZABLE_CARD_VARIANTS}
          onChange={(value) => onStateChange('variant', value)}
        />
        <SelectField
          label="Size"
          value={state.size}
          options={RESIZABLE_CARD_SIZES}
          onChange={(value) => onStateChange('size', value)}
        />
        <SelectField
          label="Content density"
          value={state.density}
          options={RESIZABLE_CARD_DENSITIES}
          onChange={(value) => onStateChange('density', value)}
        />
      </ControlCard>

      <ControlCard title="Behavior">
        <CheckboxField
          label="Resizable"
          checked={state.resizable}
          onChange={(checked) => onStateChange('resizable', checked)}
        />
        <CheckboxField
          label="Backdrop close"
          checked={state.closeOnBackdropClick}
          onChange={(checked) => onStateChange('closeOnBackdropClick', checked)}
        />
        <CheckboxField
          label="Escape close"
          checked={state.closeOnEscape}
          onChange={(checked) => onStateChange('closeOnEscape', checked)}
        />
        <CheckboxField
          label="Lock body scroll"
          checked={state.lockBodyScroll}
          onChange={(checked) => onStateChange('lockBodyScroll', checked)}
        />
        <CheckboxField
          label="Media slot"
          checked={state.showMedia}
          onChange={(checked) => onStateChange('showMedia', checked)}
        />
        <CheckboxField
          label="Action slot"
          checked={state.showAction}
          onChange={(checked) => onStateChange('showAction', checked)}
        />
      </ControlCard>

      <ControlCard title="Sizing">
        <SliderField
          label="Compact min height"
          value={state.compactMinHeight}
          min={isMediaGrid ? 240 : 72}
          max={isMediaGrid ? 420 : 220}
          step={4}
          unit="px"
          onChange={(value) => onStateChange('compactMinHeight', value)}
        />
        <SliderField
          label="Initial width"
          value={state.initialWidth}
          min={420}
          max={1180}
          step={20}
          unit="px"
          onChange={(value) => onStateChange('initialWidth', value)}
        />
        <SliderField
          label="Initial height"
          value={state.initialHeight}
          min={420}
          max={860}
          step={20}
          unit="px"
          onChange={(value) => onStateChange('initialHeight', value)}
        />
        <SliderField
          label="Min width"
          value={state.minWidth}
          min={300}
          max={640}
          step={20}
          unit="px"
          onChange={(value) => onStateChange('minWidth', value)}
        />
        <SliderField
          label="Min height"
          value={state.minHeight}
          min={300}
          max={560}
          step={20}
          unit="px"
          onChange={(value) => onStateChange('minHeight', value)}
        />
        <SliderField
          label="Max width"
          value={state.maxWidth}
          min={720}
          max={1320}
          step={20}
          unit="px"
          onChange={(value) => onStateChange('maxWidth', value)}
        />
        <SliderField
          label="Max height"
          value={state.maxHeight}
          min={620}
          max={980}
          step={20}
          unit="px"
          onChange={(value) => onStateChange('maxHeight', value)}
        />
      </ControlCard>
    </aside>
  )
}
