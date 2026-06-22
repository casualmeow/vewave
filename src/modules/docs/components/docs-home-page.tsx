import { Link } from '@tanstack/react-router'
import { Callout } from 'fumadocs-ui/components/callout'
import { Card, Cards } from 'fumadocs-ui/components/card'
import { ArrowRight, CheckCircle2, Copy, TerminalSquare } from 'lucide-react'
import { motion } from 'motion/react'

import { architectureRows, overviewCards, quickStartCommands } from '../content/docs-content'
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from './docs-page-layout'
import { Button } from '@/shared/ui'

export function DocsHomePage() {
  return (
    <DocsPage>
      <DocsTitle>Vewave Project Docs</DocsTitle>
      <DocsDescription>
        README content is now represented as an in-app Fumadocs-style documentation surface with
        architecture notes, setup commands, and UI guidance.
      </DocsDescription>

      <DocsBody className="max-w-none">
        <div className="not-prose space-y-10">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]"
          >
            <div className="rounded-lg border border-border bg-muted/35 p-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                <TerminalSquare className="size-4" />
                Local workflow
              </div>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
                Run the app with generated backend clients.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                The frontend reads API URLs from Vite env, generates REST clients with Orval, and
                keeps route files thin by importing module-level page compositions.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild>
                  <Link to="/admin/docs/ui">
                    Read UI docs
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/admin/docs/ui/components">Open showcase</Link>
                </Button>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.08, duration: 0.45 }}
              className="overflow-hidden rounded-lg border border-border bg-foreground text-background shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-background/10 px-4 py-3">
                <span className="text-sm text-background/75">README quick start</span>
                <Copy className="size-4 text-background/40" />
              </div>
              <div className="space-y-1 p-4 font-mono text-sm">
                {quickStartCommands.map((item, index) => (
                  <div key={item.command} className="grid grid-cols-[1.5rem_1fr] gap-2">
                    <span className="text-background/40">{index + 1}</span>
                    <span>
                      <span className="text-primary">$</span>{' '}
                      <span className="text-background">{item.command}</span>
                      <span className="ml-3 hidden text-xs text-background/45 sm:inline">
                        {item.label}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.section>

          <Callout type="info" title="Documentation integration note">
            Vewave remains a Vite + TanStack Router app. The admin docs route uses the local docs
            shell, content primitives, and module-owned content without adding the old public docs
            layout back.
          </Callout>

          <section className="grid gap-4 md:grid-cols-3">
            {overviewCards.map((card, index) => {
              const Icon = card.icon

              return (
                <motion.article
                  key={card.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ delay: index * 0.04, duration: 0.45 }}
                  className="rounded-lg border border-border bg-card p-5 shadow-sm"
                >
                  <Icon className="size-5 text-primary" />
                  <h3 className="mt-4 text-lg font-semibold text-foreground">{card.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{card.description}</p>
                </motion.article>
              )
            })}
          </section>

          <section className="rounded-lg border border-border bg-muted/30 p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  Architecture Boundaries
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  These are the working boundaries from AGENTS.md, surfaced here for day-to-day
                  project work.
                </p>
              </div>
              <span className="rounded-full bg-card px-3 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border">
                module architecture
              </span>
            </div>

            <div className="mt-5 divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
              {architectureRows.map((row) => (
                <div key={row.path} className="grid gap-3 p-4 sm:grid-cols-[13rem_1fr]">
                  <code className="text-sm font-semibold text-foreground">{row.path}</code>
                  <p className="text-sm leading-6 text-muted-foreground">{row.purpose}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Backend Integration Checklist
            </h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {[
                'Use VITE_API_URL and VITE_WS_URL through src/shared/config/env.ts.',
                'Generated REST code lives under src/core/api/generated and is not edited manually.',
                'Axios transport attaches in-memory access tokens and refreshes through HTTP-only cookies.',
                'Watch-together routes use room codes for public navigation.',
              ].map((item) => (
                <div
                  key={item}
                  className="flex gap-3 rounded-lg border border-border bg-card p-4 text-sm leading-6 text-muted-foreground"
                >
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Documentation Surfaces
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Cards are used for quick navigation while the module owns Vewave-specific layout and
              animation behavior.
            </p>
            <Cards className="mt-5">
              <Card
                title="Project Overview"
                description="Setup, architecture, and backend notes."
              />
              <Card title="UI Docs" description="Component ownership and showcase conventions." />
              <Card title="Live Showcase" description="Interactive component playgrounds." />
            </Cards>
          </section>
        </div>
      </DocsBody>
    </DocsPage>
  )
}
