import { Link } from '@tanstack/react-router'
import { Callout } from 'fumadocs-ui/components/callout'
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page'
import { ArrowRight, Check, Code2 } from 'lucide-react'
import { motion } from 'motion/react'

import { uiComponentDocs, uiPrinciples } from '../content/docs-content'
import { Button } from '@/shared/ui'

export function DocsUiPage() {
  return (
    <DocsPage
      full
      breadcrumb={{ enabled: false }}
      footer={{ enabled: false }}
      tableOfContent={{ enabled: false }}
      tableOfContentPopover={{ enabled: false }}
      className="rounded-lg border border-zinc-200 bg-white px-5 py-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:px-8"
    >
      <DocsTitle className="text-4xl font-semibold tracking-tight text-zinc-950 sm:text-6xl">
        UI Documentation
      </DocsTitle>
      <DocsDescription className="max-w-3xl text-lg leading-8 text-zinc-600">
        Component ownership, styling rules, and live playground conventions for Vewave UI work.
      </DocsDescription>

      <DocsBody className="max-w-none">
        <div className="not-prose space-y-10">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="rounded-lg border border-zinc-200 bg-[#f8fbfb] p-6"
          >
            <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-teal-900/10 bg-white px-3 py-1 text-sm font-medium text-teal-800">
                  <Code2 className="size-4" />
                  UI system
                </div>
                <h2 className="mt-5 text-2xl font-semibold tracking-tight text-zinc-950">
                  Docs explain the rules. Showcase proves the behavior.
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600">
                  Keep component API documentation close to each component package, and use the
                  component docs pages for live controls, animation presets, and responsive preview
                  states.
                </p>
              </div>
              <Button asChild>
                <Link to="/docs/ui/components">
                  Open component docs
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </motion.section>

          <section className="grid gap-4 md:grid-cols-2">
            {uiPrinciples.map((item, index) => {
              const Icon = item.icon

              return (
                <motion.article
                  key={item.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ delay: index * 0.04, duration: 0.45 }}
                  className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
                >
                  <Icon className="size-5 text-teal-700" />
                  <h3 className="mt-4 text-lg font-semibold text-zinc-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">{item.description}</p>
                </motion.article>
              )
            })}
          </section>

          <Callout type="idea" title="UI docs workflow">
            Use this page for standing conventions and /docs/ui/components for exact public APIs
            plus live component playgrounds.
          </Callout>

          <section>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">
                  Component Notes
                </h2>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  Current reusable UI areas that should remain separated from route-specific page
                  composition.
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/docs/ui/components">
                  Component docs
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>

            <div className="mt-5 grid gap-4">
              {uiComponentDocs.map((component, index) => {
                const Icon = component.icon

                return (
                  <motion.article
                    key={component.title}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ delay: index * 0.04, duration: 0.45 }}
                    className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm"
                  >
                    <div className="grid gap-4 p-5 lg:grid-cols-[12rem_1fr]">
                      <div>
                        <Icon className="size-5 text-teal-700" />
                        <h3 className="mt-3 text-lg font-semibold text-zinc-950">
                          {component.title}
                        </h3>
                        <p className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">
                          {component.status}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm leading-6 text-zinc-600">{component.description}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {component.notes.map((note) => (
                            <span
                              key={note}
                              className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700"
                            >
                              <Check className="size-3 text-emerald-600" />
                              {note}
                            </span>
                          ))}
                        </div>
                        {'to' in component ? (
                          <Button asChild className="mt-5" variant="outline" size="sm">
                            <Link to={component.to}>
                              Read docs
                              <ArrowRight className="size-4" />
                            </Link>
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </motion.article>
                )
              })}
            </div>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-zinc-950 p-5 text-white">
            <h2 className="text-2xl font-semibold tracking-tight">Styling and Motion Rules</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {[
                'Prefer CVA and existing Tailwind tokens for reusable component variants.',
                'Use Motion for React state/viewport animation and GSAP for broader page choreography.',
                'Avoid iframe-style demos unless isolation is truly required and lifecycle-safe.',
              ].map((rule) => (
                <div
                  key={rule}
                  className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm leading-6 text-zinc-300"
                >
                  {rule}
                </div>
              ))}
            </div>
          </section>
        </div>
      </DocsBody>
    </DocsPage>
  )
}
