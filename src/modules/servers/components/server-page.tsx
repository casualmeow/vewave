import { Link } from '@tanstack/react-router'
import { ArrowLeft, Radio, Server, UsersRound } from 'lucide-react'
import { type ReactNode } from 'react'

import { useGetApiServersByServerId } from '@/core/api/generated/servers/servers'
import { Button, CardDescription, CardHeader, CardTitle, GlassSurface } from '@/shared/ui'

type ServerPageProps = {
  serverId: string
}

export function ServerPage({ serverId }: ServerPageProps) {
  const query = useGetApiServersByServerId(serverId)
  const server = query.data?.server ?? null

  if (query.isPending) {
    return (
      <div className="px-6 py-8 md:px-10">
        <div className="grid w-full max-w-3xl gap-5">
          <ServerPanel>
            <CardHeader>
              <CardTitle>Loading server</CardTitle>
              <CardDescription>Getting your server ready.</CardDescription>
            </CardHeader>
          </ServerPanel>
        </div>
      </div>
    )
  }

  if (!server) {
    return (
      <div className="px-6 py-8 md:px-10">
        <div className="grid w-full max-w-3xl gap-5">
          <Button asChild variant="outline" className="w-fit rounded-md">
            <Link to="/projects">
              <ArrowLeft className="size-4" />
              Back to rooms
            </Link>
          </Button>
          <ServerPanel>
            <CardHeader>
              <div className="grid size-11 place-items-center rounded-lg bg-muted text-foreground">
                <Server className="size-5" />
              </div>
              <CardTitle>Server not found</CardTitle>
              <CardDescription>
                Create a server from the sidebar or join one from Community to open it here.
              </CardDescription>
            </CardHeader>
          </ServerPanel>
        </div>
      </div>
    )
  }

  return (
    <div className="px-6 py-8 md:px-10">
      <div className="grid w-full max-w-5xl gap-6">
        <section className="flex flex-col gap-4 border-b border-border/70 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary">Server</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">
              {server.name}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              {server.description ?? 'No server description yet.'}
            </p>
          </div>
          <Button asChild className="w-fit rounded-md">
            <Link to="/projects">
              <Radio className="size-4" />
              Start room
            </Link>
          </Button>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <ServerMetricCard
            label="Members"
            value={server.memberCount}
            icon={<UsersRound className="size-5" />}
          />
          <ServerMetricCard
            label="Rooms"
            value={server.roomCount}
            icon={<Radio className="size-5" />}
          />
          <ServerMetricCard
            label="Access"
            value={formatVisibility(server.visibility)}
            icon={<Server className="size-5" />}
          />
        </section>

        <ServerPanel>
          <CardHeader>
            <CardTitle>Watch with your server</CardTitle>
            <CardDescription>
              Start a room from Rooms, then share its invite link with the people in your server.
            </CardDescription>
          </CardHeader>
        </ServerPanel>
      </div>
    </div>
  )
}

function ServerMetricCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: ReactNode
}) {
  return (
    <ServerPanel>
      <CardHeader>
        <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
    </ServerPanel>
  )
}

function formatVisibility(value: string) {
  if (value === 'community') return 'Community'
  if (value === 'invite') return 'Invite link'

  return 'Private'
}

function ServerPanel({ children }: { children: ReactNode }) {
  return (
    <GlassSurface role="form" elevation="embedded" className="rounded-xl border py-6">
      {children}
    </GlassSurface>
  )
}
