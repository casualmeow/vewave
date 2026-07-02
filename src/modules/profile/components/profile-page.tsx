import { Link } from '@tanstack/react-router'
import { ExternalLink, ImageIcon } from 'lucide-react'
import { useMemo, type ReactNode } from 'react'

import type { UserAppConfig } from '@/shared/theme'
import {
  useGetApiProfileByUsername,
  useGetApiProfileMe,
} from '@/core/api/generated/profile/profile'
import { getApiErrorMessage } from '@/core/api/http/errors'
import { useAuthStore } from '@/modules/auth'
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
  SpinIcon,
} from '@/shared/ui'

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
  appConfig?: UserAppConfig
  createdAt: string
  canEdit: boolean
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

function getPublicUsername(profile: Pick<ProfileView, 'handle' | 'username'>) {
  return profile.username ?? profile.handle?.replace(/^@+/, '') ?? null
}

export function ProfilePage({ username }: ProfilePageProps) {
  const status = useAuthStore((state) => state.status)
  const user = useAuthStore((state) => state.user)
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
            <CardDescription>Sign in to view your profile and account details.</CardDescription>
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
  const publicUsername = getPublicUsername(profile)
  const userHandle = publicUsername
    ? `@${publicUsername}`
    : profile.email
      ? `@${profile.email.split('@')[0]}`
      : 'No @username'
  const canEdit = profile.canEdit

  return (
    <ProfileShell>
      <div className="grid w-full max-w-5xl gap-6">
        <div className="grid gap-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
              <Avatar className="size-24 border border-border/70 shadow-sm">
                <AvatarImage src={profile.avatarUrl ?? undefined} alt={`${profile.name} avatar`} />
                <AvatarFallback className="text-xl">{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h1 className="truncate text-3xl font-semibold tracking-tight text-foreground">
                  {profile.name}
                </h1>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  <span>{userHandle}</span>
                </div>
              </div>
            </div>

            {canEdit && publicUsername ? (
              <Button asChild variant="outline" className="rounded-full bg-card/70">
                <Link to="/profile/$username" params={{ username: publicUsername }}>
                  <ExternalLink className="size-4" />
                  Public view
                </Link>
              </Button>
            ) : null}
          </div>

          {profile.bio ? (
            <p className="max-w-3xl text-sm leading-6 text-foreground">{profile.bio}</p>
          ) : (
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">No bio.</p>
          )}
        </div>
      </div>
    </ProfileShell>
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

function ProfileShell({ children }: { children: ReactNode }) {
  return (
    <div className="p-6">
      <div className="flex w-full max-w-6xl flex-col gap-6">{children}</div>
    </div>
  )
}
