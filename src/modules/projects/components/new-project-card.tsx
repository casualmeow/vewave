import { Plus, Sparkles } from 'lucide-react'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'
import { useState } from 'react'
import type { FormEvent, PointerEvent as ReactPointerEvent } from 'react'

import type { ProjectItem, ProjectType } from '../types'
import { SIDEBAR_FLUID_TRANSITION, SIDEBAR_MAGNETIC_TRANSITION } from '@/components/sidebar'
import { Button, Input } from '@/shared/ui'
import { cn } from '@/shared/lib/utils'

const projectTypes = [
  { value: 'watch-room', label: 'Watch room' },
  { value: 'collection', label: 'Collection' },
  { value: 'event', label: 'Event' },
] as const satisfies ReadonlyArray<{ value: ProjectType; label: string }>

function createRoomCode(title: string) {
  const normalized = title
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 5)
    .toUpperCase()
  const suffix = Math.floor(10 + Math.random() * 89)

  return `${normalized || 'ROOM'}${suffix}`
}

export function NewProjectCard({ onCreate }: { onCreate: (project: ProjectItem) => void }) {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [type, setType] = useState<ProjectType>('watch-room')
  const prefersReducedMotion = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const tiltX = useMotionValue(0)
  const tiltY = useMotionValue(0)
  const springX = useSpring(x, SIDEBAR_MAGNETIC_TRANSITION)
  const springY = useSpring(y, SIDEBAR_MAGNETIC_TRANSITION)
  const rotateX = useTransform(
    useSpring(tiltY, SIDEBAR_MAGNETIC_TRANSITION),
    [-1, 1],
    ['1.2deg', '-1.2deg'],
  )
  const rotateY = useTransform(
    useSpring(tiltX, SIDEBAR_MAGNETIC_TRANSITION),
    [-1, 1],
    ['-1.4deg', '1.4deg'],
  )

  const resetMotion = () => {
    x.set(0)
    y.set(0)
    tiltX.set(0)
    tiltY.set(0)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (prefersReducedMotion) return

    const rect = event.currentTarget.getBoundingClientRect()
    const localX = event.clientX - rect.left
    const localY = event.clientY - rect.top
    const percentX = Math.max(0, Math.min(100, (localX / rect.width) * 100))
    const percentY = Math.max(0, Math.min(100, (localY / rect.height) * 100))
    const normalizedX = (percentX / 100 - 0.5) * 2
    const normalizedY = (percentY / 100 - 0.5) * 2

    event.currentTarget.style.setProperty('--project-pointer-x', `${percentX}%`)
    event.currentTarget.style.setProperty('--project-pointer-y', `${percentY}%`)
    event.currentTarget.style.setProperty('--project-pointer-glow', '1')

    x.set(normalizedX * 5)
    y.set(normalizedY * 3)
    tiltX.set(normalizedX)
    tiltY.set(normalizedY)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const normalizedTitle = title.trim() || 'Untitled watch project'
    const roomCode = createRoomCode(normalizedTitle)

    onCreate({
      id: `${roomCode.toLowerCase()}-${Date.now()}`,
      title: normalizedTitle,
      description: url.trim() || 'New project ready for a synchronized room link.',
      type,
      status: 'draft',
      roomCode,
      members: 1,
      videos: url.trim() ? 1 : 0,
      lastOpened: 'Just now',
      ctaText: 'Open draft',
      ctaLink: `/room/${roomCode}`,
      accent:
        type === 'event'
          ? 'from-sky-200 via-indigo-100 to-teal-200'
          : type === 'collection'
            ? 'from-emerald-200 via-lime-100 to-cyan-200'
            : 'from-teal-300 via-cyan-200 to-sky-300',
      summary:
        'Fresh project shell with draft defaults. Add media, invite collaborators, then open a watch room when ready.',
    })

    setTitle('')
    setUrl('')
    setType('watch-room')
  }

  return (
    <motion.section
      onPointerMove={handlePointerMove}
      onPointerLeave={(event) => {
        event.currentTarget.style.setProperty('--project-pointer-glow', '0')
        resetMotion()
      }}
      style={
        prefersReducedMotion
          ? undefined
          : {
              x: springX,
              y: springY,
              rotateX,
              rotateY,
              transformPerspective: 1000,
            }
      }
      className="relative isolate overflow-hidden rounded-[2rem] border border-white/60 bg-white/32 p-5 shadow-[0_28px_80px_rgba(15,23,42,0.14),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-2xl [--project-pointer-glow:0] [--project-pointer-x:50%] [--project-pointer-y:10%]"
    >
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_var(--project-pointer-x)_var(--project-pointer-y),rgba(255,255,255,0.72),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.38),rgba(204,251,241,0.24),rgba(186,230,253,0.18))] opacity-[calc(0.46+var(--project-pointer-glow)*0.34)] transition-opacity" />
      <span className="pointer-events-none absolute -left-16 top-8 size-40 rounded-full bg-teal-200/28 blur-3xl" />
      <span className="pointer-events-none absolute -right-16 bottom-4 size-44 rounded-full bg-sky-200/28 blur-3xl" />

      <div className="relative z-10 grid gap-5 lg:grid-cols-[minmax(0,0.82fr)_minmax(20rem,1fr)] lg:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/55 px-3 py-1 text-sm font-medium text-teal-900 shadow-sm">
            <Sparkles className="size-4" />
            New project
          </div>
          <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight text-zinc-950">
            Start a room-ready project.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
            Create a project shell, attach a source link, and keep it ready for synchronized watch
            sessions.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-3 rounded-[1.6rem] bg-white/58 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.86)]"
        >
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Project title"
            className="h-11 rounded-2xl bg-white/88"
          />
          <Input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="Optional video or playlist URL"
            className="h-11 rounded-2xl bg-white/88"
          />
          <div className="grid grid-cols-3 gap-2">
            {projectTypes.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setType(item.value)}
                className={cn(
                  'relative min-h-10 overflow-hidden rounded-2xl px-2 text-xs font-semibold transition-colors',
                  type === item.value ? 'text-zinc-950' : 'text-zinc-500 hover:text-zinc-950',
                )}
              >
                {type === item.value ? (
                  <motion.span
                    layoutId="new-project-type-selector"
                    className="absolute inset-0 rounded-2xl border border-white/70 bg-white/72 shadow-[0_10px_24px_rgba(15,23,42,0.10)]"
                    transition={SIDEBAR_FLUID_TRANSITION}
                  />
                ) : null}
                <span className="relative z-10">{item.label}</span>
              </button>
            ))}
          </div>
          <Button
            type="submit"
            className="h-11 rounded-2xl bg-zinc-950 text-white hover:bg-zinc-800"
          >
            <Plus className="size-4" />
            Add project
          </Button>
        </form>
      </div>
    </motion.section>
  )
}
