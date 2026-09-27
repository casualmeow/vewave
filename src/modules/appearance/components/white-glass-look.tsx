import { useId } from 'react'
import type { AppearanceSettings } from '@/shared/theme'
import { getWhiteGlassAppearance, isWhiteGlassAppearance } from '@/shared/theme'
import { Button } from '@/shared/ui'

export function WhiteGlassLook({
  settings,
  onApply,
}: {
  settings: AppearanceSettings
  onApply: (settings: AppearanceSettings) => void
}) {
  const descriptionId = useId()
  const active = isWhiteGlassAppearance(settings)

  return (
    <div data-settings-anchor="white-glass" className="flex flex-wrap items-center gap-x-4 gap-y-3">
      <span
        aria-hidden="true"
        className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-[#E2E8ED]"
      >
        <span className="absolute -left-1 top-4 h-5 w-12 -rotate-12 rounded-full bg-[#A6B6C3]/60" />
        <span className="absolute inset-x-2 inset-y-1.5 rounded-md border border-white/90 bg-white/55 shadow-[0_2px_8px_#52627120] backdrop-blur-[3px]" />
        <span className="absolute left-5 right-5 top-5 h-0.5 rounded-full bg-[#526271]/50" />
        <span className="absolute left-5 right-7 top-7 h-0.5 rounded-full bg-[#526271]/30" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">White Glass</p>
        <p id={descriptionId} className="mt-1 text-xs leading-5 text-muted-foreground">
          Pearl colors in light mode, with glass surfaces.
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-label="Apply White Glass"
        aria-describedby={descriptionId}
        disabled={active}
        onClick={() => onApply(getWhiteGlassAppearance(settings))}
        className="min-h-9 rounded-lg shadow-none"
      >
        {active ? 'Applied' : 'Apply'}
      </Button>
    </div>
  )
}
