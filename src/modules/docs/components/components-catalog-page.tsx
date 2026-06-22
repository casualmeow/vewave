import { Link } from '@tanstack/react-router'
import { ArrowRight, BookOpen } from 'lucide-react'
import { motion } from 'motion/react'

import { componentDocLinks, componentDocsHighlights } from '../content/component-docs-content'
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from './docs-page-layout'
import { Button } from '@/shared/ui'

export function ComponentsCatalogPage() {
  return (
    <DocsPage className="rounded-lg border border-zinc-200 bg-white px-5 py-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:px-8">
      <div className="inline-flex items-center gap-2 rounded-full border border-teal-900/10 bg-teal-50 px-3 py-1 text-sm font-medium text-teal-800">
        <BookOpen className="size-4" />
        UI kit documentation
      </div>
      <DocsTitle className="mt-5 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-6xl">
        Components
      </DocsTitle>
      <DocsDescription className="max-w-3xl text-lg leading-8 text-zinc-600">
        Public component documentation has moved out of component folders and into docs routes, like
        a UI kit reference.
      </DocsDescription>

      <DocsBody className="max-w-none">
        <div className="not-prose space-y-10">
          <section className="grid gap-4 md:grid-cols-2">
            {componentDocLinks.map((component, index) => {
              const Icon = component.icon

              return (
                <motion.article
                  key={component.slug}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.45 }}
                  className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
                >
                  <Icon className="size-5 text-teal-700" />
                  <h2 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-950">
                    {component.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">{component.description}</p>
                  <Button asChild className="mt-5" variant="outline">
                    <Link to={component.to}>
                      Read docs
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </motion.article>
              )
            })}
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            {componentDocsHighlights.map((item) => {
              const Icon = item.icon

              return (
                <div
                  key={item.title}
                  className="rounded-lg border border-zinc-200 bg-[#f8fbfb] p-5"
                >
                  <Icon className="size-5 text-teal-700" />
                  <h3 className="mt-4 text-lg font-semibold text-zinc-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">{item.description}</p>
                </div>
              )
            })}
          </section>
        </div>
      </DocsBody>
    </DocsPage>
  )
}
