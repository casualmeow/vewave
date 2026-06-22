import { Clock3, Radio, UsersRound, Video } from 'lucide-react'
import type { ProjectItem } from '../types'

export function ProjectMedia({ item }: { item: ProjectItem }) {
  return (
    <div className={`h-full w-full bg-gradient-to-br ${item.accent}`}>
      <div className="flex h-full flex-col justify-between p-5">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-card/62 px-3 py-1 text-xs font-semibold capitalize text-foreground shadow-sm backdrop-blur">
            {item.status}
          </span>
          <span className="rounded-full bg-foreground/82 px-3 py-1 text-xs font-semibold text-background shadow-sm">
            {item.roomCode}
          </span>
        </div>
        <div>
          <div className="grid size-12 place-items-center rounded-2xl bg-card/62 text-foreground shadow-[inset_0_1px_0_color-mix(in_srgb,var(--background)_70%,transparent)] backdrop-blur">
            <Radio className="size-5" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProjectExpandedContent({ item }: { item: ProjectItem }) {
  return (
    <div className="grid gap-5">
      <p>{item.summary}</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Members', value: item.members, icon: UsersRound },
          { label: 'Videos', value: item.videos, icon: Video },
          { label: 'Opened', value: item.lastOpened, icon: Clock3 },
        ].map((stat) => {
          const Icon = stat.icon

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-border bg-card p-4 shadow-sm"
            >
              <Icon className="size-4 text-primary" />
              <div className="mt-3 text-lg font-semibold text-foreground">{stat.value}</div>
              <div className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {stat.label}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
