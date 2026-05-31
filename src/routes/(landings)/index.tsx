import { Link, createFileRoute } from '@tanstack/react-router'
import {
  ArrowRight,
  BadgeCheck,
  Clapperboard,
  Layers3,
  Radio,
  Sparkles,
  UsersRound,
  Zap,
} from 'lucide-react'

import { Button } from '@/shared/ui'

export const Route = createFileRoute('/(landings)/')({
  component: LandingIndexPage,
})

const stats = [
  { label: 'Shared rooms', value: '4.8k' },
  { label: 'Creator drafts', value: '12k' },
  { label: 'Avg. setup', value: '90s' },
]

const features = [
  {
    icon: Radio,
    title: 'Rooms that feel live',
    description:
      'Synchronized playback, room presence, and lightweight controls keep watch sessions moving without heavy setup.',
  },
  {
    icon: Clapperboard,
    title: 'Studio-ready publishing',
    description:
      'Creators can prepare thumbnails, edit details, and move from draft to shared video in one focused workspace.',
  },
  {
    icon: UsersRound,
    title: 'Built for groups',
    description:
      'The interface favors quick entry, clear state, and actions that make sense for both hosts and invited viewers.',
  },
]

const workflow = [
  'Create a room or open a studio draft.',
  'Tune the details, thumbnail, and playback experience.',
  'Invite viewers into a shared space that is ready to watch.',
]

function LandingIndexPage() {
  return (
    <>
      <section className="px-4 pb-24 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-sm text-teal-100">
              <Sparkles className="size-4" />
              Watch rooms and creator tools in one flow
            </div>

            <div className="space-y-6">
              <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
                Launch shared video spaces that feel ready from the first click.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-zinc-300">
                Vewave brings room creation, studio publishing, and public landing pages into a
                single frontend surface built for fast scanning and confident action.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="rounded-full px-6">
                <Link to="/sign-up" className="inline-flex items-center gap-2">
                  Start free
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-white/20 bg-white/5 px-6 text-white hover:bg-white/10 hover:text-white"
              >
                <a href="#features">Explore features</a>
              </Button>
            </div>

            <div className="grid max-w-xl grid-cols-3 gap-3 pt-4">
              {stats.map((stat) => (
                <div key={stat.label} className="border-l border-white/15 pl-4">
                  <div className="text-2xl font-semibold text-white">{stat.value}</div>
                  <div className="mt-1 text-sm text-zinc-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.06] shadow-2xl shadow-black/30">
              <div className="flex items-center justify-between border-b border-white/10 bg-black/20 px-5 py-4">
                <div className="flex items-center gap-3">
                  <img src="/logo192.png" alt="" className="size-8 rounded-md" />
                  <div>
                    <div className="text-sm font-medium text-white">Vewave launch room</div>
                    <div className="text-xs text-zinc-400">Public preview</div>
                  </div>
                </div>
                <div className="rounded-full bg-emerald-300 px-3 py-1 text-xs font-medium text-zinc-950">
                  Live
                </div>
              </div>

              <div className="grid gap-0 lg:grid-cols-[1.28fr_0.72fr]">
                <div className="min-h-[24rem] bg-[linear-gradient(135deg,#f8fafc_0%,#a7f3d0_34%,#38bdf8_68%,#4338ca_100%)] p-5">
                  <div className="flex h-full flex-col justify-between rounded-lg border border-white/40 bg-white/25 p-5 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div className="h-3 w-28 rounded-full bg-zinc-950/40" />
                      <div className="h-8 w-8 rounded-full bg-white/80" />
                    </div>
                    <div className="space-y-3">
                      <div className="h-4 w-48 rounded-full bg-zinc-950/55" />
                      <div className="h-3 w-64 max-w-full rounded-full bg-zinc-950/35" />
                      <div className="h-3 w-40 rounded-full bg-zinc-950/30" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 bg-zinc-950/70 p-5">
                  <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-white">
                      <Zap className="size-4 text-teal-300" />
                      Quick setup
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="h-2 rounded-full bg-white/20" />
                      <div className="h-2 w-4/5 rounded-full bg-white/15" />
                    </div>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-white">
                      <Layers3 className="size-4 text-sky-300" />
                      Studio queue
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <div className="h-16 rounded-md bg-teal-300/70" />
                      <div className="h-16 rounded-md bg-sky-300/70" />
                      <div className="h-16 rounded-md bg-violet-300/70" />
                    </div>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-white">
                      <BadgeCheck className="size-4 text-emerald-300" />
                      Ready to share
                    </div>
                    <div className="mt-4 h-10 rounded-full bg-white text-center text-sm font-medium leading-10 text-zinc-950">
                      Publish
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="bg-[#f7faf9] px-4 py-24 text-zinc-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
              Product benefits
            </p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
              Everything needed to move from draft to shared viewing.
            </h2>
            <p className="text-lg leading-8 text-zinc-600">
              Vewave keeps room setup, studio publishing, and invite-ready previews close together
              so creators and viewers can move quickly.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon

              return (
                <article
                  key={feature.title}
                  className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm"
                >
                  <div className="grid size-11 place-items-center rounded-md bg-zinc-950 text-white">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold">{feature.title}</h3>
                  <p className="mt-3 leading-7 text-zinc-600">{feature.description}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section id="workflow" className="bg-white px-4 py-24 text-zinc-950 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.72fr_1fr] lg:items-start">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
              Workflow
            </p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
              A direct path from idea to watch room.
            </h2>
          </div>

          <div className="grid gap-4">
            {workflow.map((item, index) => (
              <div
                key={item}
                className="grid gap-4 rounded-lg border border-zinc-200 bg-zinc-50 p-5 sm:grid-cols-[auto_1fr] sm:items-center"
              >
                <div className="grid size-10 place-items-center rounded-full bg-zinc-950 text-sm font-semibold text-white">
                  {index + 1}
                </div>
                <p className="text-lg text-zinc-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="launch" className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-lg border border-white/10 bg-white/[0.06] px-6 py-12 text-center shadow-2xl shadow-black/20 sm:px-10">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
            Open a room, tune the studio, and bring viewers in.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-zinc-300">
            Start with a quick room, or use the studio flow when a video needs thumbnails, details,
            and a more deliberate publishing pass.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="rounded-full px-6">
              <Link to="/create" className="inline-flex items-center gap-2">
                Create room
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-white/20 bg-white/5 px-6 text-white hover:bg-white/10 hover:text-white"
            >
              <Link to="/studio">Visit studio</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
