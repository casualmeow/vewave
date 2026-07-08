import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { ArrowRight, Radio, Server, UsersRound } from 'lucide-react'
import { toast } from 'sonner'
import type { ReactNode } from 'react'

import type { GetApiServersCommunity200ServersItem } from '@/core/api/generated/model'
import {
  getGetApiServersQueryKey,
  useGetApiServersCommunity,
  usePostApiServersByServerIdJoin,
} from '@/core/api/generated/servers/servers'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui'

const numberFormatter = new Intl.NumberFormat(undefined, { notation: 'compact' })

export function ServersDiscoverPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const communityQuery = useGetApiServersCommunity()
  const joinMutation = usePostApiServersByServerIdJoin()
  const servers = communityQuery.data?.servers ?? []

  async function joinServer(server: GetApiServersCommunity200ServersItem) {
    try {
      const response = await joinMutation.mutateAsync({ serverId: server.id })

      await queryClient.invalidateQueries({ queryKey: getGetApiServersQueryKey() })
      toast.success(`Joined ${response.server.name}`)
      await navigate({
        to: '/servers/$serverId',
        params: { serverId: response.server.id },
      })
    } catch {
      toast.error('Unable to join server')
    }
  }

  return (
    <div className="px-6 py-8 md:px-10">
      <div className="grid w-full max-w-6xl gap-6">
        <section className="flex flex-col gap-4 border-b border-border/70 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary">
              Community
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Discover watch servers
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Browse public Vewave servers from the backend, join one, then pin it from the sidebar
              for faster access.
            </p>
          </div>
          <Button asChild variant="outline" className="w-fit rounded-md">
            <a href="#community-servers">
              Browse servers
              <ArrowRight className="size-4" />
            </a>
          </Button>
        </section>

        <section id="community-servers" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {communityQuery.isPending ? (
            <CommunityStateCard title="Loading servers" description="Fetching community servers." />
          ) : servers.length > 0 ? (
            servers.map((server) => (
              <CommunityServerCard
                key={server.id}
                server={server}
                joining={joinMutation.isPending}
                onJoin={() => joinServer(server)}
              />
            ))
          ) : (
            <CommunityStateCard
              title="No community servers yet"
              description="Create a server with Community visibility and it will appear here."
            />
          )}
        </section>
      </div>
    </div>
  )
}

function CommunityServerCard({
  joining,
  onJoin,
  server,
}: {
  joining: boolean
  onJoin: () => void
  server: GetApiServersCommunity200ServersItem
}) {
  const alreadyJoined = Boolean(server.role)

  return (
    <Card className="group overflow-hidden rounded-lg border-border bg-card">
      <div className={`h-2 bg-gradient-to-r ${getServerAccent(server.visibility)}`} aria-hidden />
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="grid size-11 place-items-center rounded-lg border border-border bg-muted text-sm font-semibold text-foreground">
            {getServerInitials(server.name)}
          </div>
          <span className="rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-muted-foreground">
            {formatVisibility(server.visibility)}
          </span>
        </div>
        <CardTitle>{server.name}</CardTitle>
        <CardDescription className="leading-6">
          {server.description ?? 'A public Vewave watch server.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2 text-sm text-muted-foreground">
          <CommunityStat
            icon={<UsersRound className="size-4" />}
            value={`${numberFormatter.format(server.memberCount)} members`}
          />
          <CommunityStat
            icon={<Radio className="size-4" />}
            value={`${server.roomCount} room${server.roomCount === 1 ? '' : 's'}`}
          />
          <CommunityStat
            icon={<Server className="size-4" />}
            value={alreadyJoined ? `Joined as ${server.role}` : 'Open for members'}
          />
        </div>
        <Button type="button" className="w-full rounded-md" disabled={joining} onClick={onJoin}>
          {alreadyJoined ? 'Open server' : joining ? 'Joining...' : 'Join server'}
        </Button>
      </CardContent>
    </Card>
  )
}

function CommunityStateCard({ description, title }: { description: string; title: string }) {
  return (
    <Card className="rounded-lg border-border bg-card md:col-span-2 xl:col-span-4">
      <CardHeader>
        <div className="grid size-11 place-items-center rounded-lg bg-muted text-foreground">
          <Server className="size-5" />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  )
}

function CommunityStat({ icon, value }: { icon: ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid size-7 place-items-center rounded-md bg-muted text-foreground">
        {icon}
      </span>
      <span>{value}</span>
    </div>
  )
}

function getServerInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function formatVisibility(value: string) {
  if (value === 'community') return 'Community'
  if (value === 'invite') return 'Invite'

  return 'Private'
}

function getServerAccent(visibility: string) {
  if (visibility === 'community') return 'from-primary/45 via-accent/25 to-secondary'
  if (visibility === 'invite') return 'from-accent/35 via-secondary to-muted'

  return 'from-muted via-secondary to-primary/20'
}
