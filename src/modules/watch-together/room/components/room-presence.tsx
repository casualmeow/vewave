import { Users } from 'lucide-react'
import type { PresenceMember } from '../realtime'

type RoomPresenceProps = {
  members: Array<PresenceMember>
}

export function RoomPresence({ members }: RoomPresenceProps) {
  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Users className="size-4" />
        <h2 className="font-medium">Presence</h2>
      </div>
      {members.length ? (
        <ul className="mt-4 space-y-2 text-sm">
          {members.map((member) => (
            <li
              key={member.connectionId}
              className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2"
            >
              <span>{member.name}</span>
              {member.role ? <span className="text-muted-foreground">{member.role}</span> : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          Presence updates appear here when other viewers join.
        </p>
      )}
    </section>
  )
}
