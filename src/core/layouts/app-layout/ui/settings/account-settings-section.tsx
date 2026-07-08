import { Link } from '@tanstack/react-router'
import { LogIn, LogOut, UserRound } from 'lucide-react'

import { getInitials } from '../sidebar/utils'
import { SettingRow, SettingsEmptyHint, SettingsGroup } from './settings-primitives'
import { useAuthStore, useLogout } from '@/modules/auth'
import { Avatar, AvatarFallback, AvatarImage, Button, DialogClose } from '@/shared/ui'

export function AccountSettingsSection() {
  const status = useAuthStore((state) => state.status)
  const user = useAuthStore((state) => state.user)
  const logout = useLogout()

  if (status === 'idle' || status === 'bootstrapping') {
    return <SettingsEmptyHint>Checking your session…</SettingsEmptyHint>
  }

  if (!user) {
    return (
      <div className="grid gap-4">
        <SettingsEmptyHint>
          You are browsing as a guest. Sign in to sync rooms, servers, and appearance across
          devices.
        </SettingsEmptyHint>
        <DialogClose asChild>
          <Button asChild className="w-fit">
            <Link to="/sign-in" search={{ redirectTo: undefined }}>
              <LogIn className="size-4" />
              Sign in
            </Link>
          </Button>
        </DialogClose>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <SettingsGroup title="Signed in as">
        <div className="flex items-center gap-3 rounded-lg border border-border/70 bg-card p-4">
          <Avatar className="size-12">
            {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt="" /> : null}
            <AvatarFallback>{getInitials(user.name, user.email)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-semibold text-foreground">{user.name}</span>
              {user.isAdmin ? (
                <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                  Admin
                </span>
              ) : null}
            </div>
            <div className="truncate text-xs text-muted-foreground">{user.email}</div>
            {user.username ? (
              <div className="truncate text-xs text-muted-foreground">@{user.username}</div>
            ) : null}
          </div>
        </div>
        <SettingRow
          title="Profile"
          description="Name, username, bio, and avatar live on your profile page."
          control={
            <DialogClose asChild>
              <Button asChild variant="outline" size="sm">
                <Link to="/profile">
                  <UserRound className="size-4" />
                  Edit profile
                </Link>
              </Button>
            </DialogClose>
          }
        />
      </SettingsGroup>

      <SettingsGroup title="Session">
        <SettingRow
          title="Sign out"
          description="Ends this session on this device and returns you to the landing page."
          control={
            <Button variant="outline" size="sm" onClick={() => void logout()}>
              <LogOut className="size-4" />
              Sign out
            </Button>
          }
        />
      </SettingsGroup>
    </div>
  )
}
