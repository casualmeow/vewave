import { History, Palette, PanelLeft, UserRound } from 'lucide-react'
import { useState } from 'react'

import {
  AccountSettingsSection,
  AppearanceSettingsSection,
  HistorySettingsSection,
  PinnedSettingsSection,
} from './settings'
import { cn } from '@/shared/lib/utils'
import { FluidGlassGroup, FluidGlassTarget } from '@/components/fluid-glass'
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/ui'

const settingsSections = [
  {
    id: 'appearance',
    label: 'Appearance',
    icon: Palette,
    description: 'Mode, theme presets, surface details, and the theme studio tools.',
    Section: AppearanceSettingsSection,
  },
  {
    id: 'pinned',
    label: 'Pinned items',
    icon: PanelLeft,
    description: 'Rooms and servers pinned to the top of the app sidebar.',
    Section: PinnedSettingsSection,
  },
  {
    id: 'history',
    label: 'Watch history',
    icon: History,
    description: 'Rooms remembered on this device from recent sessions.',
    Section: HistorySettingsSection,
  },
  {
    id: 'account',
    label: 'Account',
    icon: UserRound,
    description: 'Your profile, session, and sign-out controls.',
    Section: AccountSettingsSection,
  },
] as const

type SettingsSectionId = (typeof settingsSections)[number]['id']

export function AppSettingsDialog() {
  const [activeSectionId, setActiveSectionId] = useState<SettingsSectionId>('appearance')
  const activeSection =
    settingsSections.find((section) => section.id === activeSectionId) ?? settingsSections[0]

  return (
    <DialogContent className="h-[min(78svh,40rem)] gap-0 rounded-xl p-0 sm:max-w-[min(58rem,calc(100vw-2rem))]">
      {/* Inner clipper: rounding + overflow live here so the material shell's
          rim, edge ring, and shadow are never clipped. */}
      <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[inherit] md:flex-row">
        {/* Rail tint is a translucent wash over the shared material, not a
            separate solid panel — the parent glass stays visible through it. */}
        <div className="flex shrink-0 flex-col border-b border-border/60 bg-foreground/[0.025] md:w-56 md:border-b-0 md:border-r">
          <DialogHeader className="px-5 pb-2 pr-14 pt-5 text-left md:pb-3 md:pr-5">
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription className="sr-only">
              Configure appearance, pinned sidebar items, watch history, and your account.
            </DialogDescription>
          </DialogHeader>
          <nav aria-label="Settings sections" className="px-3 pb-3 md:pb-4">
            <FluidGlassGroup
              environment={{ type: 'theme', pattern: 'calm' }}
              quality="auto"
              activation="appearance"
              className="fluid-glass-settings-nav rounded-lg"
              contentClassName="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible"
            >
              {settingsSections.map((section) => {
                const active = section.id === activeSectionId

                return (
                  <FluidGlassTarget
                    key={section.id}
                    id={`settings-${section.id}`}
                    scopeId="settings-tabs"
                    active={active}
                    shape="rounded-rect"
                    radius="inherit"
                    asChild
                  >
                    <button
                      type="button"
                      aria-current={active ? 'page' : undefined}
                      data-active={active || undefined}
                      onClick={() => setActiveSectionId(section.id)}
                      className={cn(
                        'glass-control flex shrink-0 items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                        active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      <section.icon aria-hidden className="size-4" />
                      {section.label}
                    </button>
                  </FluidGlassTarget>
                )
              })}
            </FluidGlassGroup>
          </nav>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="border-b border-border/70 bg-foreground/[0.015] px-6 py-4 pr-14">
            <h2 className="text-base font-semibold text-foreground">{activeSection.label}</h2>
            <p className="text-sm text-muted-foreground">{activeSection.description}</p>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5">
            <activeSection.Section />
          </div>
        </div>
      </div>
    </DialogContent>
  )
}
