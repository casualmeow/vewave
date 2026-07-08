import { History, Palette, PanelLeft, UserRound } from 'lucide-react'
import { useState } from 'react'

import {
  AccountSettingsSection,
  AppearanceSettingsSection,
  HistorySettingsSection,
  PinnedSettingsSection,
} from './settings'
import { cn } from '@/shared/lib/utils'
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
    <DialogContent className="flex h-[min(85svh,42rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[min(58rem,calc(100vw-2rem))] md:flex-row">
      <div className="flex shrink-0 flex-col border-b border-border bg-muted/30 md:w-56 md:border-b-0 md:border-r">
        <DialogHeader className="px-5 pb-2 pt-5 text-left md:pb-3">
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription className="sr-only">
            Configure appearance, pinned sidebar items, watch history, and your account.
          </DialogDescription>
        </DialogHeader>
        <nav
          aria-label="Settings sections"
          className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible md:pb-4"
        >
          {settingsSections.map((section) => {
            const active = section.id === activeSectionId

            return (
              <button
                key={section.id}
                type="button"
                aria-current={active ? 'true' : undefined}
                onClick={() => setActiveSectionId(section.id)}
                className={cn(
                  'flex shrink-0 items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50',
                  active
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-background/60 hover:text-foreground',
                )}
              >
                <section.icon className="size-4" />
                {section.label}
              </button>
            )
          })}
        </nav>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b border-border/70 px-6 py-4 pr-14">
          <h2 className="text-base font-semibold text-foreground">{activeSection.label}</h2>
          <p className="text-sm text-muted-foreground">{activeSection.description}</p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <activeSection.Section />
        </div>
      </div>
    </DialogContent>
  )
}
