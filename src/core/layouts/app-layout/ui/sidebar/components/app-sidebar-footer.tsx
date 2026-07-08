import { LifeBuoy, LogOut, Settings } from 'lucide-react'
import { AppSettingsDialog } from '../../app-settings-dialog'
import type { AuthStatus } from '@/modules/auth/model/types'
import { SidebarFooter, SidebarItem } from '@/components/sidebar'
import { Dialog, DialogTrigger, Separator, SpinIcon } from '@/shared/ui'

export function AppSidebarFooter({
  onLogout,
  status,
}: {
  onLogout: () => Promise<void>
  status: AuthStatus
}) {
  const checkingSession = status === 'idle' || status === 'bootstrapping'
  const authenticated = status === 'authenticated'

  return (
    <SidebarFooter>
      <Dialog>
        <DialogTrigger asChild>
          <SidebarItem type="button" icon={<Settings />} value="settings">
            Settings
          </SidebarItem>
        </DialogTrigger>
        <AppSettingsDialog />
      </Dialog>

      <SidebarItem type="button" icon={<LifeBuoy />} value="support">
        Support
      </SidebarItem>

      {checkingSession || authenticated ? <Separator className="my-1 bg-sidebar-border" /> : null}

      {checkingSession ? (
        <SidebarItem type="button" icon={<SpinIcon size="sm" />} value="session-check" disabled>
          Checking session
        </SidebarItem>
      ) : authenticated ? (
        <SidebarItem
          type="button"
          icon={<LogOut />}
          value="sign-out"
          onClick={() => void onLogout()}
        >
          Sign out
        </SidebarItem>
      ) : null}
    </SidebarFooter>
  )
}
