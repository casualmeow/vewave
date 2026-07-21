import { Link } from '@tanstack/react-router'
import { ArrowRight, Code2, Layers3, PanelLeft, PanelTop, StretchHorizontal } from 'lucide-react'
import { motion } from 'motion/react'

import { FluidGlassShowcase } from './fluid-glass-showcase'
import { Button } from '@/shared/ui'

const componentPlaygrounds = [
  {
    label: 'Sidebar',
    description: 'Liquid-glass navigation shell with every interaction prop wired into controls.',
    to: '/admin/docs/ui/components/sidebar',
    icon: PanelLeft,
  },
  {
    label: 'Header',
    description: 'Scroll-aware header playground with slots, collapse, and motion controls.',
    to: '/admin/docs/ui/components/header',
    icon: PanelTop,
  },
  {
    label: 'ResizableCard',
    description: 'Expandable card presentations, resize settings, and animation presets.',
    to: '/admin/docs/ui/components/resizable-card',
    icon: StretchHorizontal,
  },
  {
    label: 'Shared UI',
    description: 'Button, form, surface, dialog, tabs, and other shared primitive examples.',
    to: '/admin/docs/ui/components/shared',
    icon: Layers3,
  },
] as const

export function UiShowcasePage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_18%_8%,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_26rem),radial-gradient(circle_at_82%_0%,color-mix(in_oklab,var(--accent)_16%,transparent),transparent_24rem),linear-gradient(135deg,var(--background),var(--secondary))] text-foreground">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <FluidGlassShowcase />
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.44 }}
          className="rounded-[2rem] border border-border/70 bg-card/82 p-6 shadow-[0_28px_90px_color-mix(in_oklab,var(--foreground)_12%,transparent)] backdrop-blur-xl sm:p-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            <Code2 className="size-4" />
            Showcase moved
          </div>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
            Component playgrounds now live inside the docs.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
            The standalone showcase route now points into the admin docs catalog. Open a component
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
                className="rounded-[1.5rem] border border-border bg-card p-5 shadow-sm"
              >
                <div className="grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                  <Icon className="size-5" />
                </div>
                <h2 className="mt-4 text-2xl font-semibold tracking-tight">{item.label}</h2>
                <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
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
