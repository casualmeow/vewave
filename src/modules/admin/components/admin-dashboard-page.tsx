import { Link } from '@tanstack/react-router'
import {
  Activity,
  ArrowRight,
  BookOpen,
  Boxes,
  Database,
  ServerCog,
  ShieldCheck,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'

import { useGetApiAdminSummary } from '@/core/api/generated/admin/admin'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui'

const consoleLinks = [
  {
    title: 'Healthcheck',
    description: 'Run API, database, refresh-cookie, and current-user diagnostics.',
    to: '/admin/healthcheck',
    icon: Activity,
  },
  {
    title: 'Docs',
    description: 'Open the full project documentation surface inside the admin console.',
    to: '/admin/docs',
    icon: BookOpen,
  },
  {
    title: 'UI kit docs',
    description: 'Open the internal component catalog from the admin console.',
    to: '/admin/docs/ui/components',
    icon: Boxes,
  },
] as const

const privilegedAreas = [
  {
    title: 'User management',
    description: 'Prepare account lookup, session revocation, and admin-right changes.',
    to: '/admin/users',
    icon: UsersRound,
  },
  {
    title: 'Database tools',
    description: 'Reserve space for migration status, table inspection, and backups.',
    to: '/admin/database',
    icon: Database,
  },
  {
    title: 'System controls',
    description: 'Track maintenance mode, job queues, integrations, and internal switches.',
    to: '/admin/system',
    icon: ServerCog,
  },
] as const

export function AdminDashboardPage() {
  const summaryQuery = useGetApiAdminSummary()

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-teal-900/10 bg-teal-50 px-3 py-1 text-sm font-medium text-teal-800">
            <ShieldCheck className="size-4" />
            Admin dashboard
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950">
            Operational overview
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
            The admin layout owns its own navigation and stays behind the admin route guard.
            Privileged areas are scaffolded so backend controls can be attached deliberately.
          </p>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-lg border-zinc-200 bg-white">
          <CardHeader>
            <CardTitle>Route guard</CardTitle>
            <CardDescription>
              TanStack `beforeLoad` protects every admin child route.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800">
              <ShieldCheck className="size-4" />
              Client verified
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-zinc-200 bg-white lg:col-span-2">
          <CardHeader>
            <CardTitle>Backend authorization</CardTitle>
            <CardDescription>
              GET /api/admin/summary confirms server-side admin rights.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-zinc-600">
              {summaryQuery.isLoading
                ? 'Checking backend admin permissions...'
                : (summaryQuery.data?.summary.message ?? 'Admin summary is unavailable.')}
            </p>
          </CardContent>
        </Card>
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        {consoleLinks.map((item) => (
          <AdminRouteCard key={item.to} item={item} />
        ))}
      </section>

      <section>
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-zinc-950">Privileged operation areas</h3>
          <p className="mt-1 text-sm leading-6 text-zinc-600">
            These pages are admin-only placeholders for user, database, and system manipulation
            flows.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {privilegedAreas.map((item) => (
            <AdminRouteCard key={item.to} item={item} />
          ))}
        </div>
      </section>
    </div>
  )
}

function AdminRouteCard({
  item,
}: {
  item: {
    description: string
    icon: LucideIcon
    title: string
    to:
      | '/admin/healthcheck'
      | '/admin/docs'
      | '/admin/docs/ui/components'
      | '/admin/users'
      | '/admin/database'
      | '/admin/system'
  }
}) {
  const Icon = item.icon

  return (
    <Card className="rounded-lg border-zinc-200 bg-white">
      <CardHeader>
        <div className="grid size-10 place-items-center rounded-lg bg-zinc-100 text-zinc-800">
          <Icon className="size-5" />
        </div>
        <CardTitle>{item.title}</CardTitle>
        <CardDescription>{item.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild variant="outline">
          <Link to={item.to}>
            Open
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
