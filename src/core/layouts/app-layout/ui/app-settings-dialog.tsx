import { History, PanelLeft, UserRound } from 'lucide-react'
import { useState } from 'react'

import { AccountSettingsSection, HistorySettingsSection, PinnedSettingsSection } from './settings'
import { SettingsDialogContent } from '@/components/settings-dialog'
import { appearanceSettingsSections, AppearanceSettingsFooter } from '@/modules/settings'

const settingsSections = [
  {
    id: 'pinned',
    label: 'Pinned items',
    icon: PanelLeft,
    description: 'Rooms and servers pinned to the top of the app sidebar.',
    searchItems: [{ label: 'Pinned items', keywords: 'rooms servers favorites saved unpin' }],
    Section: PinnedSettingsSection,
  },
  {
    id: 'history',
    label: 'Watch history',
    icon: History,
    description: 'Rooms remembered on this device from recent sessions.',
    searchItems: [{ label: 'Watch history', keywords: 'rooms recent watched clear history' }],
    Section: HistorySettingsSection,
  },
  {
    id: 'account',
    label: 'Account',
    icon: UserRound,
    description: 'Your profile, session, and sign-out controls.',
    searchItems: [{ label: 'Account', keywords: 'profile session login logout sign out' }],
    Section: AccountSettingsSection,
  },
] as const

const sections = [
  ...appearanceSettingsSections,
  ...settingsSections.map(({ Section, icon: Icon, ...section }) => ({
    ...section,
    icon: <Icon />,
    content: <Section />,
  })),
]

export function AppSettingsDialog() {
  const [activeSectionId, setActiveSectionId] = useState('appearance')
  return (
    <SettingsDialogContent
      sections={sections}
      value={activeSectionId}
      onValueChange={setActiveSectionId}
      footer={<AppearanceSettingsFooter />}
    />
  )
}
