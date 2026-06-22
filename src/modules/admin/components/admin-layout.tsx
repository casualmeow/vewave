import { Link, Outlet, useLocation } from '@tanstack/react-router'
import {
  Activity,
  ArrowLeft,
  BookOpen,
  Boxes,
  Database,
  LayoutDashboard,
  ServerCog,
  ShieldCheck,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'

import type { ReactNode } from 'react'
import type { AuthUser } from '@/modules/auth'
import { cn } from '@/shared/lib/utils'
import { Button, Separator } from '@/shared/ui'

type AdminRoutePath =
  | '/admin'
  | '/admin/healthcheck'
  | '/admin/docs'
  | '/admin/docs/ui/components'
  | '/admin/users'
  | '/admin/database'
  | '/admin/system'

type AdminNavItem = {
  description: string
  icon: LucideIcon
  label: string
  to: AdminRoutePath
}

const adminConsoleItems: Array<AdminNavItem> = [
  {
    label: 'Dashboard',
    description: 'Access summary and admin status.',
    to: '/admin',
    icon: LayoutDashboard,
  },
  {
    label: 'Healthcheck',
    description: 'API, database, auth, and runtime checks.',
    to: '/admin/healthcheck',
    icon: Activity,
  },
  {
    label: 'Docs',
    description: 'Project docs moved under admin access.',
    to: '/admin/docs',
    icon: BookOpen,
  },
  {
    label: 'UI kit docs',
    description: 'Component docs and reusable UI catalog.',
    to: '/admin/docs/ui/components',
    icon: Boxes,
  },
]

const adminPrivilegeItems: Array<AdminNavItem> = [
  {
    label: 'Users',
    description: 'Manage accounts, sessions, and roles.',
    to: '/admin/users',
    icon: UsersRound,
  },
  {
    label: 'Database',
    description: 'Inspect schema, migrations, and data tools.',
    to: '/admin/database',
    icon: Database,
  },
  {
    label: 'System',
    description: 'Operational controls and internal jobs.',
    to: '/admin/system',
    icon: ServerCog,
  },
]

type AdminLayoutProps = {
  adminUser: AuthUser
}

export function AdminLayout({ adminUser }: AdminLayoutProps) {
  const location = useLocation()
  const activePathname = stripTrailingSlash(location.pathname)

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-950">
      <div className="grid min-h-screen lg:grid-cols-[18.5rem_minmax(0,1fr)]">
        <aside className="border-b border-zinc-800 bg-zinc-950 text-zinc-100 lg:border-b-0 lg:border-r">
          <div className="flex min-h-full flex-col lg:sticky lg:top-0 lg:h-screen">
            <div className="flex items-center gap-3 px-5 py-5">
              <Link
                to="/admin"
                className="grid size-11 place-items-center rounded-lg border border-white/10 bg-white text-zinc-950 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
                aria-label="Admin dashboard"
              >
                <ShieldCheck className="size-5" />
              </Link>
              <div className="min-w-0">
                <div className="text-sm font-semibold">Admin console</div>
                <div className="truncate text-xs text-zinc-400">Vewave operations</div>
              </div>
            </div>

            <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-4" aria-label="Admin routes">
              <AdminNavSection title="Console">
                {adminConsoleItems.map((item) => (
                  <AdminNavLink
                    key={item.to}
                    item={item}
                    active={isAdminPathActive(activePathname, item)}
                  />
                ))}
              </AdminNavSection>

              <AdminNavSection title="Privileged operations">
                {adminPrivilegeItems.map((item) => (
                  <AdminNavLink
                    key={item.to}
                    item={item}
                    active={isAdminPathActive(activePathname, item)}
                  />
                ))}
              </AdminNavSection>
            </nav>

            <div className="border-t border-zinc-800 p-4">
              <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-300">
                  <ShieldCheck className="size-3.5" />
                  Admin verified
                </div>
                <div className="mt-2 truncate text-sm font-medium text-white">
                  {adminUser.email}
                </div>
                <p className="mt-1 text-xs leading-5 text-zinc-400">
                  This area is rendered only after the TanStack route guard confirms admin access.
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                className="mt-3 w-full border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800 hover:text-white"
              >
                <Link to="/projects">
                  <ArrowLeft className="size-4" />
                  Workspace
                </Link>
              </Button>
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/92 px-5 py-4 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                  Admin privileges
                </p>
                <h1 className="mt-1 text-xl font-semibold tracking-tight text-zinc-950">
                  Operations workspace
                </h1>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800">
                <ShieldCheck className="size-4" />
                {adminUser.username ? `@${adminUser.username}` : adminUser.email}
              </div>
            </div>
          </header>

          <main className="min-h-[calc(100vh-5.25rem)] p-4 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

function AdminNavSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section>
      <div className="mb-2 flex items-center gap-2 px-2">
        <h2 className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-zinc-500">
          {title}
        </h2>
        <Separator className="flex-1 bg-zinc-800" />
      </div>
      <div className="space-y-1">{children}</div>
    </section>
  )
}

function AdminNavLink({ active, item }: { active: boolean; item: AdminNavItem }) {
  const Icon = item.icon

  return (
    <Link
      to={item.to}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group flex gap-3 rounded-lg px-3 py-2.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-teal-300',
        active
          ? 'bg-white text-zinc-950 shadow-sm'
          : 'text-zinc-300 hover:bg-zinc-900 hover:text-white',
      )}
    >
      <Icon
        className={cn(
          'mt-0.5 size-4 shrink-0 transition-colors',
          active ? 'text-teal-700' : 'text-zinc-500 group-hover:text-teal-300',
        )}
      />
      <span className="min-w-0">
        <span className="block font-medium">{item.label}</span>
        <span
          className={cn(
            'mt-0.5 line-clamp-2 block text-xs leading-5',
            active ? 'text-zinc-600' : 'text-zinc-500 group-hover:text-zinc-400',
          )}
        >
          {item.description}
        </span>
      </span>
    </Link>
  )
}

function isAdminPathActive(pathname: string, item: AdminNavItem) {
  const { to } = item

  if (to === '/admin') {
    return pathname === '/admin'
  }

  if (to === '/admin/docs') {
    return (
      (pathname === '/admin/docs' ||
        pathname === '/admin/docs/ui' ||
        pathname.startsWith('/admin/docs/ui/')) &&
      !pathname.startsWith('/admin/docs/ui/components')
    )
  }

  return pathname === to || pathname.startsWith(`${to}/`)
}

function stripTrailingSlash(value: string) {
  return value === '/' ? value : value.replace(/\/$/, '')
}
