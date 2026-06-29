import { Link } from '@tanstack/react-router'
import { ArrowRight, CheckCircle2, Clapperboard, Radio, RefreshCcw, UsersRound } from 'lucide-react'

import { VewaveLogoMark } from '@/shared/theme'
import { Button } from '@/shared/ui'

const heroCapture = {
  src: '/marketing/studio-dashboard-settings.png',
  alt: 'Vewave dashboard settings screen with Theme Studio controls and live preview',
}

const intentionModel = [
  {
    label: 'Primary intention',
    value: 'Open a watch room and bring people into the same playback state quickly.',
  },
  {
    label: 'Secondary intention',
    value: 'Prepare thumbnails, details, and publishing settings when a video needs polish.',
  },
  {
    label: 'Success condition',
    value: 'A shareable room is ready, viewers know what is playing, and the host can recover.',
  },
]

const productSignals = [
  { label: 'Room setup', value: 'One dominant action for starting a shared session' },
  { label: 'Studio flow', value: 'Draft details, media settings, and preview stay together' },
  { label: 'State clarity', value: 'Active, empty, pending, and recovery states are visible' },
]

const features = [
  {
    icon: Radio,
    eyebrow: 'Live rooms',
    title: 'Make the shared action obvious',
    description:
      'Room creation, invite context, and playback state stay close together so hosts can move from intent to watch-ready space without hunting through navigation.',
  },
  {
    icon: Clapperboard,
    eyebrow: 'Creator studio',
    title: 'Keep publishing decisions in one workspace',
    description:
      'Draft metadata, thumbnails, previews, and theme controls support the secondary intention without competing with the quick room path.',
  },
  {
    icon: UsersRound,
    eyebrow: 'Group experience',
    title: 'Design for viewers after the invite',
    description:
      'Presence cues, clear labels, and predictable controls help invited viewers understand where they are and what can happen next.',
  },
]

const workflow = [
  {
    step: 'Entry',
    title: 'Choose the starting intent',
    description:
      'Start a quick room when the goal is watching now, or open Studio for a prepared upload.',
    state: 'Quick room or Studio draft',
  },
  {
    step: 'Orientation',
    title: 'Show what is ready and what needs attention',
    description:
      'Surface the selected video, publish details, room status, and missing requirements before asking the user to continue.',
    state: 'Draft, empty, or ready',
  },
  {
    step: 'Action',
    title: 'Confirm the room and invite path',
    description:
      'Create the room, preserve the share link, and make the next action visible instead of closing the flow without feedback.',
    state: 'Pending, success, or recoverable error',
  },
]

const stateCoverage = [
  {
    icon: CheckCircle2,
    title: 'Success explains what happened',
    description:
      'Room and publish actions should confirm the affected object and the next useful destination.',
  },
  {
    icon: RefreshCcw,
    title: 'Recovery stays in the flow',
    description:
      'Errors should keep the draft, invite, or room context intact so users can retry without starting over.',
  },
]

export function LandingIndexPage() {
  return (
    <>
      <section
        id="overview"
        className="relative isolate overflow-hidden px-4 pb-20 pt-10 text-background sm:px-6 lg:px-8"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_12%_4%,color-mix(in_srgb,var(--primary)_30%,transparent),transparent_24rem),linear-gradient(135deg,color-mix(in_srgb,var(--foreground)_98%,black)_0%,var(--foreground)_58%,color-mix(in_srgb,var(--primary)_24%,var(--foreground))_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 -z-10 h-36 bg-[linear-gradient(0deg,var(--background),transparent)]"
        />

        <div className="mx-auto grid min-h-[74svh] w-full max-w-7xl items-center gap-12 py-10 lg:grid-cols-[0.92fr_1.08fr] lg:py-16">
          <div className="max-w-3xl space-y-8">
            <p className="inline-flex items-center gap-2 rounded-md border border-background/10 bg-background/[0.06] px-3 py-1 text-sm text-background/85">
              <VewaveLogoMark
                decorative
                className="size-4 shrink-0 border-0"
                surfaceColor="#0A0F17"
              />
              Watch rooms and creator tools in one flow
            </p>

            <div className="space-y-6">
              <h1 className="text-5xl font-semibold tracking-tight text-background sm:text-6xl lg:text-7xl">
                Create a shared video room before attention drops.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-background/76">
                Vewave keeps the primary path obvious: start a room, prepare the video when needed,
                and give viewers a space that explains what is live, pending, or ready next.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
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
                className="rounded-full border-background/20 bg-background/5 px-6 text-background hover:bg-background/10 hover:text-background"
              >
                <Link to="/studio">Visit studio</Link>
              </Button>
            </div>

            <div className="grid max-w-3xl gap-3 pt-2 sm:grid-cols-3">
              {productSignals.map((signal) => (
                <div key={signal.label} className="border-l border-background/15 pl-4">
                  <div className="text-sm font-semibold uppercase tracking-[0.14em] text-background">
                    {signal.label}
                  </div>
                  <div className="mt-2 text-sm leading-6 text-background/68">{signal.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute -inset-6 -z-10 rounded-[2rem] bg-[color-mix(in_srgb,var(--background)_8%,transparent)] blur-3xl"
            />
            <figure className="overflow-hidden rounded-xl border border-background/12 bg-background/[0.06] p-2 shadow-[0_28px_90px_color-mix(in_srgb,var(--foreground)_42%,transparent)] backdrop-blur-xl">
              <img
                src={heroCapture.src}
                alt={heroCapture.alt}
                className="aspect-[16/11] w-full rounded-lg object-cover object-left-top"
              />
              <figcaption className="grid gap-3 px-3 py-4 text-sm text-background/72 sm:grid-cols-3">
                {intentionModel.map((item) => (
                  <span key={item.label} className="space-y-1">
                    <span className="block font-semibold text-background">{item.label}</span>
                    <span className="block leading-6">{item.value}</span>
                  </span>
                ))}
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="scroll-mt-28 bg-background px-4 py-24 text-foreground sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div className="max-w-3xl space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                Product decisions
              </p>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
                Interface pieces appear only when they support a real viewing or publishing need.
              </h2>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground lg:ml-auto">
              Vewave keeps each moment connected: start, orient, prepare, invite, and recover when
              the state changes.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon

              return (
                <article
                  key={feature.title}
                  className="rounded-lg border border-border bg-card p-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid size-11 place-items-center rounded-md bg-primary text-primary-foreground">
                      <Icon className="size-5" />
                    </div>
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                      {feature.eyebrow}
                    </p>
                  </div>
                  <h3 className="mt-6 text-xl font-semibold">{feature.title}</h3>
                  <p className="mt-3 leading-7 text-muted-foreground">{feature.description}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section
        id="workflow"
        className="scroll-mt-28 bg-card px-4 py-24 text-foreground sm:px-6 lg:px-8"
      >
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.72fr_1fr] lg:items-start">
          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              Workflow
            </p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
              A product flow that covers the task graph, not just the happy path.
            </h2>
            <p className="text-lg leading-8 text-muted-foreground">
              Each step names the user decision, the information needed at that moment, and the
              state the product should make understandable.
            </p>
          </div>

          <div className="grid gap-4">
            {workflow.map((item, index) => (
              <article
                key={item.title}
                className="grid gap-4 rounded-lg border border-border bg-background p-5 sm:grid-cols-[auto_1fr] sm:items-start"
              >
                <div className="grid size-11 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {index + 1}
                </div>
                <div className="space-y-2">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                      {item.step}
                    </p>
                    <p className="w-fit rounded-md border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      {item.state}
                    </p>
                  </div>
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="leading-7 text-muted-foreground">{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background px-4 py-24 text-foreground sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2">
          {stateCoverage.map((item) => {
            const Icon = item.icon

            return (
              <article key={item.title} className="rounded-lg border border-border bg-card p-6">
                <div className="grid size-11 place-items-center rounded-md bg-secondary text-secondary-foreground">
                  <Icon className="size-5" />
                </div>
                <h2 className="mt-6 text-2xl font-semibold tracking-tight">{item.title}</h2>
                <p className="mt-3 leading-7 text-muted-foreground">{item.description}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section
        id="launch"
        className="scroll-mt-28 border-y border-background/10 bg-background/[0.06] px-4 py-24 text-background sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-background/70">
            Ready state
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
            Open a room, tune the studio, and give viewers a clear next step.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-background/70">
            Start with the fastest route to shared playback, or use Studio when the content needs a
            deliberate publishing pass before people arrive.
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
              className="rounded-full border-background/20 bg-background/5 px-6 text-background hover:bg-background/10 hover:text-background"
            >
              <Link to="/studio">Visit studio</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
