import { Link } from '@tanstack/react-router'
import { Clapperboard, Settings, UserRound } from 'lucide-react'
import { useState } from 'react'

import { SettingsDialogContent, type SettingsDialogSection } from '@/components/settings-dialog'
import {
  AccountSettingsSection,
  appearanceSettingsSections,
  AppearanceSettingsFooter,
  SettingRow,
  SettingsGroup,
} from '@/modules/settings'
import { Button, DialogClose } from '@/shared/ui'

const sections: ReadonlyArray<SettingsDialogSection> = [
  ...appearanceSettingsSections,
  {
    id: 'account',
    label: 'Account',
    description: 'Your profile and session controls.',
    searchItems: [{ label: 'Account', keywords: 'profile session login logout sign out' }],
    icon: <UserRound />,
    content: <AccountSettingsSection />,
  },
  {
    id: 'studio',
    label: 'Studio',
    description: 'Manage your channel and creator workspace.',
    icon: <Clapperboard />,
    content: (
      <SettingsGroup title="Channel">
        <SettingRow
          title="Channel settings"
          description="Manage your channel details in the creator workspace."
          control={
            <DialogClose asChild>
              <Button asChild variant="outline" size="sm">
                <Link to="/studio/channel-settings">
                  <Settings className="size-4" />
                  Open channel settings
                </Link>
              </Button>
            </DialogClose>
          }
        />
      </SettingsGroup>
    ),
  },
]

export function StudioSettingsDialog() {
  const [section, setSection] = useState('appearance')
  return (
    <SettingsDialogContent
      sections={sections}
      value={section}
      onValueChange={setSection}
      footer={<AppearanceSettingsFooter />}
    />
  )
}
