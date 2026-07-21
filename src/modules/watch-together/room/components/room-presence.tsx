import type { PresenceMember, RoomPresenceStatus } from '../realtime'
import { cn } from '@/shared/lib/utils'

type RoomPresenceProps = {
  members: Array<PresenceMember>
}

const statusStyles: Record<RoomPresenceStatus, string> = {
  watching: 'bg-emerald-500',
  idle: 'bg-amber-500',
  away: 'bg-muted-foreground/50',
}

const statusLabels: Record<RoomPresenceStatus, string> = {
  watching: 'Watching',
  idle: 'Idle',
  away: 'Away',
}

export function RoomPresence({ members }: RoomPresenceProps) {
  return (
    <section aria-label="People" className="flex flex-col gap-1">
      {members.length ? (
        members.map((member) => {
          const status = member.status ?? 'watching'

          return (
            <div
              key={member.connectionId}
              className="flex items-center justify-between rounded-lg px-2 py-2 text-sm hover:bg-muted/50"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className={cn('size-2 shrink-0 rounded-full', statusStyles[status])}
                  title={statusLabels[status]}
                />
                <span className="truncate">{member.name}</span>
              </span>
              <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                <span>{statusLabels[status]}</span>
                {member.role ? <span className="capitalize">{member.role}</span> : null}
              </span>
            </div>
          )
        })
      ) : (
        <p className="pt-6 text-center text-sm text-muted-foreground">
          Presence updates appear here when other viewers join.
        </p>
      )}
    </section>
  )
}
