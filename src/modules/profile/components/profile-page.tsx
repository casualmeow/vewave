import { Link, useNavigate } from '@tanstack/react-router'
import {
  AtSign,
  CalendarDays,
  ExternalLink,
  ImageIcon,
  KeyRound,
  Mail,
  Save,
  UserRound,
} from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

import { AppearancePanel } from './appearance-panel'
import {
  getGetApiProfileByUsernameQueryKey,
  getGetApiProfileMeQueryKey,
  useGetApiProfileByUsername,
  useGetApiProfileMe,
  usePatchApiProfileMe,
  usePatchApiProfileMePassword,
  type PatchApiProfileMeMutationBody,
  type PatchApiProfileMePasswordMutationBody,
} from '@/core/api/generated/profile/profile'
import { getApiErrorMessage } from '@/core/api/http/errors'
import { useAuthStore, type AuthUser } from '@/modules/auth'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  SecureInput,
  Separator,
  SpinIcon,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/ui'
import { cn } from '@/shared/lib/utils'

type ProfilePageProps = {
  username?: string
}

type ProfileView = {
  id: string
  name: string
  username: string | null
  handle: string | null
  avatarUrl: string | null
  bio: string | null
  email?: string
  isAdmin?: boolean
  createdAt: string
  canEdit: boolean
}

type ProfileFormState = {
  name: string
  username: string
  avatarUrl: string
  bio: string
}

type PasswordFormState = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const emptyProfileForm: ProfileFormState = {
  name: '',
  username: '',
  avatarUrl: '',
  bio: '',
}

const emptyPasswordForm: PasswordFormState = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

function getInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || 'Vewave User'
  const parts = source.split(/\s+/).filter(Boolean)

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }

  return source.slice(0, 2).toUpperCase()
}

function getRouteUsername(value?: string) {
  if (!value) return null

  try {
    return decodeURIComponent(value).trim()
  } catch {
    return value.trim()
  }
}

function nullableField(value: string) {
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function formatProfileDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function toAuthUser(profile: ProfileView, fallback: AuthUser): AuthUser {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email ?? fallback.email,
    username: profile.username,
    avatarUrl: profile.avatarUrl,
    bio: profile.bio,
    isAdmin: profile.isAdmin ?? fallback.isAdmin,
  }
}

export function ProfilePage({ username }: ProfilePageProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const status = useAuthStore((state) => state.status)
  const user = useAuthStore((state) => state.user)
  const accessToken = useAuthStore((state) => state.accessToken)
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated)
  const routeUsername = useMemo(() => getRouteUsername(username), [username])
  const checkingSession = status === 'idle' || status === 'bootstrapping'
  const isPublicRoute = Boolean(routeUsername)

  const ownProfileQuery = useGetApiProfileMe({
    query: {
      enabled: !isPublicRoute && status === 'authenticated',
    },
  })
  const publicProfileQuery = useGetApiProfileByUsername(routeUsername ?? '', {
    query: {
      enabled: isPublicRoute && !checkingSession,
    },
  })

  const activeQuery = isPublicRoute ? publicProfileQuery : ownProfileQuery
  const profile = activeQuery.data?.profile
  const [profileForm, setProfileForm] = useState<ProfileFormState>(emptyProfileForm)
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>(emptyPasswordForm)

  const updateProfileMutation = usePatchApiProfileMe()
  const changePasswordMutation = usePatchApiProfileMePassword()

  useEffect(() => {
    if (!profile?.canEdit) return

    setProfileForm({
      name: profile.name,
      username: profile.handle ?? '',
      avatarUrl: profile.avatarUrl ?? '',
      bio: profile.bio ?? '',
    })
  }, [profile?.avatarUrl, profile?.bio, profile?.canEdit, profile?.handle, profile?.name])

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!profile?.canEdit || !user) return

    const name = profileForm.name.trim()

    if (!name) {
      toast.error('Name is required.')
      return
    }

    const payload: PatchApiProfileMeMutationBody = {
      name,
      username: nullableField(profileForm.username),
      avatarUrl: nullableField(profileForm.avatarUrl),
      bio: nullableField(profileForm.bio),
    }

    try {
      const response = await updateProfileMutation.mutateAsync({ data: payload })
      const nextProfile = response.profile

      if (accessToken) {
        setAuthenticated(toAuthUser(nextProfile, user), accessToken)
      }

      await queryClient.invalidateQueries({ queryKey: getGetApiProfileMeQueryKey() })

      if (routeUsername) {
        await queryClient.invalidateQueries({
          queryKey: getGetApiProfileByUsernameQueryKey(routeUsername),
        })

        if (nextProfile.handle && nextProfile.handle !== routeUsername) {
          await navigate({
            to: '/profile/$username',
            params: { username: nextProfile.handle },
          })
        }

        if (!nextProfile.handle) {
          await navigate({ to: '/profile' })
        }
      }

      toast.success('Profile updated')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to update profile.'))
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!profile?.canEdit) return

    if (passwordForm.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters.')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Password confirmation does not match.')
      return
    }

    const payload: PatchApiProfileMePasswordMutationBody = {
      currentPassword: nullableField(passwordForm.currentPassword) ?? undefined,
      newPassword: passwordForm.newPassword,
    }

    try {
      await changePasswordMutation.mutateAsync({ data: payload })
      setPasswordForm(emptyPasswordForm)
      toast.success('Password updated')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to update password.'))
    }
  }

  if (checkingSession) {
    return (
      <ProfileShell>
        <ProfileStatusCard
          title="Checking session"
          description="Restoring access before loading profile details."
          loading
        />
      </ProfileShell>
    )
  }

  if (!isPublicRoute && !user) {
    return (
      <ProfileShell>
        <Card className="max-w-xl rounded-[2rem] border-border/70 bg-card/80 shadow-sm backdrop-blur">
          <CardHeader>
            <CardTitle>Profile is available after sign in</CardTitle>
            <CardDescription>
              Sign in to edit your name, public @username, avatar, and password.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="rounded-full">
              <Link to="/sign-in" search={{ redirectTo: undefined }}>
                Sign in
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full bg-card/70">
              <Link to="/sign-up">Create account</Link>
            </Button>
          </CardContent>
        </Card>
      </ProfileShell>
    )
  }

  if (activeQuery.isPending || (activeQuery.isFetching && !profile)) {
    return (
      <ProfileShell>
        <ProfileStatusCard title="Loading profile" description="Fetching profile data." loading />
      </ProfileShell>
    )
  }

  if (activeQuery.isError || !profile) {
    return (
      <ProfileShell>
        <ProfileStatusCard
          title={isPublicRoute ? 'Profile not found' : 'Profile unavailable'}
          description={getApiErrorMessage(activeQuery.error, 'The profile could not be loaded.')}
        />
      </ProfileShell>
    )
  }

  const initials = getInitials(profile.name, profile.email)
  const publicHandle = profile.handle ?? (profile.username ? `@${profile.username}` : null)
  const canEdit = profile.canEdit

  return (
    <ProfileShell>
      <div className="grid w-full max-w-5xl gap-6">
        <Card className="overflow-hidden rounded-[2rem] border-border/70 bg-card/85 shadow-sm backdrop-blur">
          <CardHeader className="gap-5 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
              <Avatar className="size-24 border border-border/70 shadow-sm">
                <AvatarImage src={profile.avatarUrl ?? undefined} alt={`${profile.name} avatar`} />
                <AvatarFallback className="text-xl">{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary">
                  {canEdit ? 'Your profile' : 'Public profile'}
                </p>
                <CardTitle className="mt-2 truncate text-3xl">{profile.name}</CardTitle>
                <CardDescription className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                  <span>{publicHandle ?? 'No @username'}</span>
                  {profile.email ? <span>{profile.email}</span> : null}
                </CardDescription>
              </div>
            </div>

            {canEdit && publicHandle ? (
              <Button asChild variant="outline" className="rounded-full bg-card/70">
                <Link to="/profile/$username" params={{ username: publicHandle }}>
                  <ExternalLink className="size-4" />
                  Public view
                </Link>
              </Button>
            ) : null}
          </CardHeader>
          <CardContent className="grid gap-5">
            {profile.bio ? (
              <p className="max-w-3xl text-sm leading-6 text-foreground">{profile.bio}</p>
            ) : (
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                {canEdit ? 'Add a short bio to your profile.' : 'This user has not added a bio.'}
              </p>
            )}

            <div className="grid gap-3 md:grid-cols-4">
              <ProfileFact icon={<AtSign />} label="@username" value={publicHandle ?? 'Not set'} />
              <ProfileFact icon={<UserRound />} label="User ID" value={profile.id} />
              {profile.email ? (
                <ProfileFact icon={<Mail />} label="Email" value={profile.email} />
              ) : null}
              <ProfileFact
                icon={<CalendarDays />}
                label="Joined"
                value={formatProfileDate(profile.createdAt)}
              />
            </div>
          </CardContent>
        </Card>

        {canEdit ? (
          <Card className="rounded-[2rem] border-border/70 bg-card/85 shadow-sm backdrop-blur">
            <CardHeader>
              <CardTitle>Profile settings</CardTitle>
              <CardDescription>Update public details and account security.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="profile" className="gap-5">
                <TabsList className="grid w-full grid-cols-3 sm:w-fit">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                  <TabsTrigger value="appearance">Appearance</TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                  <form className="grid gap-5" onSubmit={handleProfileSubmit}>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field id="profile-name" label="Display name">
                        <Input
                          id="profile-name"
                          value={profileForm.name}
                          maxLength={120}
                          onChange={(event) =>
                            setProfileForm((current) => ({
                              ...current,
                              name: event.target.value,
                            }))
                          }
                        />
                      </Field>

                      <Field id="profile-username" label="@username">
                        <Input
                          id="profile-username"
                          value={profileForm.username}
                          maxLength={33}
                          placeholder="@jane"
                          onChange={(event) =>
                            setProfileForm((current) => ({
                              ...current,
                              username: event.target.value,
                            }))
                          }
                        />
                      </Field>
                    </div>

                    <Field id="profile-avatar" label="Avatar URL">
                      <div className="grid gap-3 sm:grid-cols-[auto_1fr] sm:items-center">
                        <Avatar className="size-16 border border-border/70 shadow-sm">
                          <AvatarImage
                            src={nullableField(profileForm.avatarUrl) ?? undefined}
                            alt={`${profileForm.name || profile.name} avatar preview`}
                          />
                          <AvatarFallback>
                            {getInitials(profileForm.name, profile.email)}
                          </AvatarFallback>
                        </Avatar>
                        <Input
                          id="profile-avatar"
                          value={profileForm.avatarUrl}
                          maxLength={2048}
                          placeholder="https://example.com/avatar.png"
                          onChange={(event) =>
                            setProfileForm((current) => ({
                              ...current,
                              avatarUrl: event.target.value,
                            }))
                          }
                        />
                      </div>
                    </Field>

                    <Field id="profile-bio" label="Bio">
                      <textarea
                        id="profile-bio"
                        value={profileForm.bio}
                        maxLength={280}
                        rows={4}
                        className={cn(
                          'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full resize-none rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px] md:text-sm',
                        )}
                        onChange={(event) =>
                          setProfileForm((current) => ({
                            ...current,
                            bio: event.target.value,
                          }))
                        }
                      />
                      <div className="text-xs text-muted-foreground">
                        {profileForm.bio.length}/280
                      </div>
                    </Field>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        className="rounded-full"
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? (
                          <SpinIcon size="sm" label="Saving profile" />
                        ) : (
                          <Save className="size-4" />
                        )}
                        Save profile
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="security">
                  <form className="grid gap-5" onSubmit={handlePasswordSubmit}>
                    <div className="grid gap-4 md:grid-cols-3">
                      <Field id="current-password" label="Current password">
                        <SecureInput
                          id="current-password"
                          value={passwordForm.currentPassword}
                          autoComplete="current-password"
                          onChange={(event) =>
                            setPasswordForm((current) => ({
                              ...current,
                              currentPassword: event.target.value,
                            }))
                          }
                        />
                      </Field>

                      <Field id="new-password" label="New password">
                        <SecureInput
                          id="new-password"
                          value={passwordForm.newPassword}
                          minLength={8}
                          maxLength={256}
                          autoComplete="new-password"
                          onChange={(event) =>
                            setPasswordForm((current) => ({
                              ...current,
                              newPassword: event.target.value,
                            }))
                          }
                        />
                      </Field>

                      <Field id="confirm-password" label="Confirm password">
                        <SecureInput
                          id="confirm-password"
                          value={passwordForm.confirmPassword}
                          minLength={8}
                          maxLength={256}
                          autoComplete="new-password"
                          onChange={(event) =>
                            setPasswordForm((current) => ({
                              ...current,
                              confirmPassword: event.target.value,
                            }))
                          }
                        />
                      </Field>
                    </div>

                    <Separator className="bg-border/70" />

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        className="rounded-full"
                        disabled={changePasswordMutation.isPending}
                      >
                        {changePasswordMutation.isPending ? (
                          <SpinIcon size="sm" label="Updating password" />
                        ) : (
                          <KeyRound className="size-4" />
                        )}
                        Update password
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="appearance">
                  <AppearancePanel />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </ProfileShell>
  )
}

function ProfileFact({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-border bg-card/70 p-4">
      <div className="text-primary [&_svg]:size-4">{icon}</div>
      <div className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 truncate text-sm font-medium text-foreground">{value}</div>
    </div>
  )
}

function ProfileStatusCard({
  description,
  loading = false,
  title,
}: {
  description: string
  loading?: boolean
  title: string
}) {
  return (
    <Card className="max-w-xl rounded-[2rem] border-border/70 bg-card/80 shadow-sm backdrop-blur">
      <CardHeader className="items-center text-center">
        <div className="grid size-16 place-items-center rounded-full border border-border bg-card shadow-sm">
          {loading ? <SpinIcon label={title} /> : <ImageIcon className="size-6 text-primary" />}
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  )
}

function Field({ children, id, label }: { children: ReactNode; id: string; label: string }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  )
}

function ProfileShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-2rem)] overflow-auto p-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">{children}</div>
    </div>
  )
}
