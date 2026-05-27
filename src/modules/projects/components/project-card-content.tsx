import { Clock3, Radio, UsersRound, Video } from 'lucide-react'
import type { ProjectItem } from '../types'

export function ProjectMedia({ item }: { item: ProjectItem }) {
  return (
    <div className={`h-full w-full bg-gradient-to-br ${item.accent}`}>
      <div className="flex h-full flex-col justify-between p-5">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-white/62 px-3 py-1 text-xs font-semibold capitalize text-zinc-800 shadow-sm backdrop-blur">
            {item.status}
          </span>
          <span className="rounded-full bg-zinc-950/82 px-3 py-1 text-xs font-semibold text-white shadow-sm">
            {item.roomCode}
          </span>
        </div>
        <div>
          <div className="grid size-12 place-items-center rounded-2xl bg-white/62 text-zinc-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur">
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
              className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
            >
              <Icon className="size-4 text-teal-700" />
              <div className="mt-3 text-lg font-semibold text-zinc-950">{stat.value}</div>
              <div className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
                {stat.label}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
