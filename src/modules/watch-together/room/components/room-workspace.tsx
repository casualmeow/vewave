import { useRef, useState } from 'react'
import { workspacePresetFractions, workspaceVideoFractionBounds } from '../model'
import type { KeyboardEvent, PointerEvent, ReactNode } from 'react'
import type { RoomPreferences, RoomPreferencesUpdate } from '../model'
import { cn } from '@/shared/lib/utils'

type RoomWorkspaceProps = {
  stage: ReactNode
  panel: ReactNode
  preferences: RoomPreferences
  updatePreferences: (update: RoomPreferencesUpdate) => void
}

const keyboardStepFraction = 0.02

function clampFraction(fraction: number) {
  return Math.min(
    workspaceVideoFractionBounds.max,
    Math.max(workspaceVideoFractionBounds.min, fraction),
  )
}

/**
 * Workspace view: video and room tools side by side across the full room
 * width, split by a draggable divider. Manual drags switch the preset to
 * Custom; double-click (or Home on the keyboard) restores the active preset.
 * Narrow screens stack the stage above the panel instead of squeezing both.
 */
export function RoomWorkspace({
  stage,
  panel,
  preferences,
  updatePreferences,
}: RoomWorkspaceProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [dragFraction, setDragFraction] = useState<number | null>(null)
  const fraction = dragFraction ?? preferences.workspaceVideoFraction

  function commitFraction(nextFraction: number) {
    updatePreferences({
      workspacePreset: 'custom',
      workspaceVideoFraction: clampFraction(nextFraction),
    })
  }

  function resetToPreset() {
    const preset =
      preferences.workspacePreset === 'custom' ? 'balanced' : preferences.workspacePreset

    updatePreferences({
      workspacePreset: preset,
      workspaceVideoFraction: workspacePresetFractions[preset],
    })
  }

  function handleDividerPointerDown(event: PointerEvent<HTMLDivElement>) {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handleDividerPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      return
    }

    const container = containerRef.current

    if (!container) {
      return
    }

    const rect = container.getBoundingClientRect()
    setDragFraction(clampFraction((event.clientX - rect.left) / rect.width))
  }

  function handleDividerPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      return
    }

    event.currentTarget.releasePointerCapture(event.pointerId)

    if (dragFraction !== null) {
      commitFraction(dragFraction)
      setDragFraction(null)
    }
  }

  function handleDividerKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      commitFraction(fraction - keyboardStepFraction)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      commitFraction(fraction + keyboardStepFraction)
    } else if (event.key === 'Home') {
      event.preventDefault()
      resetToPreset()
    }
  }

  return (
    <div
      ref={containerRef}
      className="flex h-full min-h-0 w-full flex-col gap-3 lg:grid lg:gap-0"
      style={{
        gridTemplateColumns: `minmax(0, ${(fraction * 100).toFixed(2)}fr) auto minmax(280px, ${((1 - fraction) * 100).toFixed(2)}fr)`,
      }}
    >
      <div className="aspect-video w-full min-h-0 lg:aspect-auto lg:h-full">{stage}</div>
      <div
        role="separator"
        tabIndex={0}
        aria-orientation="vertical"
        aria-label="Resize video and panel. Arrow keys adjust, Home restores the preset."
        aria-valuenow={Math.round(fraction * 100)}
        aria-valuemin={Math.round(workspaceVideoFractionBounds.min * 100)}
        aria-valuemax={Math.round(workspaceVideoFractionBounds.max * 100)}
        title={
          preferences.workspacePreset === 'custom'
            ? 'Custom layout — double-click to reset'
            : `${preferences.workspacePreset} layout`
        }
        className={cn(
          'group hidden w-3 shrink-0 cursor-col-resize items-center justify-center outline-none lg:flex',
          'focus-visible:ring-2 focus-visible:ring-ring/60 rounded-full',
        )}
        onPointerDown={handleDividerPointerDown}
        onPointerMove={handleDividerPointerMove}
        onPointerUp={handleDividerPointerUp}
        onKeyDown={handleDividerKeyDown}
        onDoubleClick={resetToPreset}
      >
        <span
          className={cn(
            'h-12 w-1 rounded-full bg-border transition-colors motion-reduce:transition-none',
            'group-hover:bg-muted-foreground/50 group-focus-visible:bg-muted-foreground/50',
            dragFraction !== null && 'bg-muted-foreground/60',
          )}
        />
      </div>
      <div className="min-h-[320px] flex-1 rounded-lg border border-border p-3 lg:min-h-0 lg:flex-none lg:h-full">
        {panel}
      </div>
    </div>
  )
}
