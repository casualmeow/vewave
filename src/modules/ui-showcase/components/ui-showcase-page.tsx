import { Link } from '@tanstack/react-router'
import { ArrowRight, Code2, Layers3, PanelLeft, PanelTop, StretchHorizontal } from 'lucide-react'
import { motion } from 'motion/react'

import { Button } from '@/shared/ui'

const componentPlaygrounds = [
  {
    label: 'Sidebar',
    description: 'Liquid-glass navigation shell with every interaction prop wired into controls.',
    to: '/docs/ui/components/sidebar',
    icon: PanelLeft,
  },
  {
    label: 'Header',
    description: 'Scroll-aware header playground with slots, collapse, and motion controls.',
    to: '/docs/ui/components/header',
    icon: PanelTop,
  },
  {
    label: 'ResizableCard',
    description: 'Expandable card presentations, resize settings, and animation presets.',
    to: '/docs/ui/components/resizable-card',
    icon: StretchHorizontal,
  },
  {
    label: 'Shared UI',
    description: 'Button, form, surface, dialog, tabs, and other shared primitive examples.',
    to: '/docs/ui/components/shared',
    icon: Layers3,
  },
] as const

export function UiShowcasePage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_18%_8%,rgba(20,184,166,0.16),transparent_26rem),radial-gradient(circle_at_82%_0%,rgba(14,165,233,0.14),transparent_24rem),linear-gradient(135deg,#f8fafc,#f1f5f9)] text-zinc-950">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.44 }}
          className="rounded-[2rem] border border-white/70 bg-white/82 p-6 shadow-[0_28px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-900/10 bg-teal-50 px-3 py-1 text-sm font-medium text-teal-800">
            <Code2 className="size-4" />
            Showcase moved
          </div>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-zinc-950 sm:text-6xl">
            Component playgrounds now live inside the docs.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-600">
            The standalone `/ui/showcase` route is kept as a navigation bridge. Open a component
            docs page to see its API, examples, and live controls in one place.
          </p>
        </motion.section>

        <section className="grid gap-4 md:grid-cols-2">
          {componentPlaygrounds.map((item, index) => {
            const Icon = item.icon

            return (
              <motion.article
                key={item.label}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.42 }}
                className="rounded-[1.5rem] border border-zinc-200 bg-white p-5 shadow-sm"
              >
                <div className="grid size-11 place-items-center rounded-2xl bg-zinc-950 text-white shadow-sm">
                  <Icon className="size-5" />
                </div>
                <h2 className="mt-4 text-2xl font-semibold tracking-tight">{item.label}</h2>
                <p className="mt-2 min-h-12 text-sm leading-6 text-zinc-600">{item.description}</p>
                <Button asChild className="mt-5 rounded-full">
                  <Link to={item.to}>
                    Open docs playground
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </motion.article>
            )
          })}
        </section>
      </main>
    </div>
  )
}
