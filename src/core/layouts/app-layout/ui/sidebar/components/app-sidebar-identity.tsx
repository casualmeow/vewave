import { Link } from '@tanstack/react-router'
import { LogIn } from 'lucide-react'
import type { AuthStatus, AuthUser } from '@/modules/auth/model/types'
import { SidebarBrand, useSidebarContext } from '@/components/sidebar'
import { Avatar, AvatarFallback, AvatarImage, SpinIcon } from '@/shared/ui'
import { VewaveLogoMark } from '@/shared/theme'
import { cn } from '@/shared/lib/utils'

export function AppSidebarIdentity({
  initials,
  status,
  user,
  subtitle,
}: {
  initials: string
  status: AuthStatus
  subtitle?: string
  user: AuthUser | null
}) {
  const { collapsed } = useSidebarContext()
  const checkingSession = status === 'idle' || status === 'bootstrapping'
  // Icon mode shrinks the identity visual toward the nav-icon rhythm so the
  // rail reads as one column instead of a large avatar over small glyphs.
  const visualSize = collapsed ? 'size-10' : 'size-14'

  if (checkingSession) {
    return (
      <SidebarBrand
        visual={
          <div
            className={cn(
              'grid place-items-center rounded-full border border-[color:var(--glass-border)] bg-[var(--glass-background)] shadow-sm backdrop-blur-xl',
              visualSize,
            )}
          >
            <SpinIcon size={collapsed ? 'sm' : 'md'} speed="normal" label="Checking session" />
          </div>
        }
        title="Checking session"
        subtitle="Restoring rooms"
        meta={
          <span
            className="h-8 w-16 animate-pulse rounded-full bg-muted-foreground/20"
            aria-hidden
          />
        }
      />
    )
  }

  if (!user) {
    return (
      <SidebarBrand
        visual={
          <VewaveLogoMark
            className={cn(visualSize, collapsed ? 'text-sm' : 'text-lg')}
            surfaceToken="sidebar"
          />
        }
        title="Guest mode"
        subtitle="Local rooms only"
        meta={
          <Link
            to="/sign-in"
            search={{ redirectTo: undefined }}
            className="inline-flex size-8 items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground/75 shadow-sm transition hover:text-sidebar-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45"
            aria-label="Sign in"
            title="Sign in"
          >
            <LogIn className="size-4" />
          </Link>
        }
      />
    )
  }

  return (
    <SidebarBrand
      visual={
        <Link
          to="/profile"
          aria-label="Open profile"
          className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/45"
        >
          <Avatar
            className={cn('border border-[color:var(--glass-border)] shadow-sm', visualSize)}
          >
            <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name ?? 'User avatar'} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Link>
      }
      title={
        <Link to="/profile" className="outline-none hover:text-primary focus-visible:underline">
          {user.name ?? 'Profile'}
        </Link>
      }
      subtitle={subtitle ?? user.email}
    />
  )
}
