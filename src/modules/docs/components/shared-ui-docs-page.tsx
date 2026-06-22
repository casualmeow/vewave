import { Link } from '@tanstack/react-router'
import { ArrowRight, Layers3 } from 'lucide-react'
import { motion } from 'motion/react'

import { sharedUiCategories, sharedUiDocNavItems } from '../content/shared-ui-docs-nav'
import { DocsCodeBlock, DocsSection } from './component-doc-primitives'
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from './docs-page-layout'
import { Button } from '@/shared/ui'

const importSnippet = `import {
  Button,
  Card,
  Dialog,
  Form,
  Input,
  Select,
  Table,
} from '@/shared/ui'`

export function SharedUiDocsPage() {
  return (
    <DocsPage className="rounded-lg border border-zinc-200 bg-white px-5 py-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:px-8">
      <div className="inline-flex items-center gap-2 rounded-full border border-teal-900/10 bg-teal-50 px-3 py-1 text-sm font-medium text-teal-800">
        <Layers3 className="size-4" />
        src/shared/ui
      </div>
      <DocsTitle className="mt-5 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-6xl">
        Shared UI
      </DocsTitle>
      <DocsDescription className="max-w-3xl text-lg leading-8 text-zinc-600">
        Low-level primitives are documented independently. Use this page as the catalog, then open
        each primitive for its API, usage, notes, and live example.
      </DocsDescription>

      <DocsBody className="max-w-none">
        <div className="not-prose space-y-10">
          <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-xl border border-zinc-200 bg-[#f8fbfb] p-5">
              <h2 className="text-xl font-semibold tracking-tight text-zinc-950">Shared barrel</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                Import generic building blocks from the shared barrel. Promote behavior to
                src/components or src/modules when a primitive gains product state or reusable
                orchestration.
              </p>
              <div className="mt-4">
                <DocsCodeBlock>{importSnippet}</DocsCodeBlock>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-[radial-gradient(circle_at_12%_0%,rgba(45,212,191,0.14),transparent_18rem),linear-gradient(135deg,#ffffff,#f8fafc)] p-5">
              <h2 className="text-xl font-semibold tracking-tight text-zinc-950">
                Primitive families
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {sharedUiCategories.map((category) => {
                  const count = sharedUiDocNavItems.filter(
                    (doc) => doc.category === category.id,
                  ).length

                  return (
                    <div
                      key={category.id}
                      className="rounded-lg border border-zinc-200 bg-white/85 p-4 shadow-sm"
                    >
                      <div className="text-sm font-semibold text-zinc-950">{category.title}</div>
                      <p className="mt-1 text-xs leading-5 text-zinc-500">{category.description}</p>
                      <div className="mt-3 text-xs font-medium text-teal-700">
                        {count} {count === 1 ? 'component' : 'components'}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          <DocsSection title="Components">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {sharedUiDocNavItems.map((doc, index) => {
                const Icon = doc.icon

                return (
                  <motion.article
                    key={doc.slug}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.025, duration: 0.34 }}
                    className="flex min-h-56 flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <Icon className="size-5 text-teal-700" />
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[0.68rem] font-medium text-zinc-500">
                        {doc.category}
                      </span>
                    </div>
                    <h2 className="mt-4 text-xl font-semibold tracking-tight text-zinc-950">
                      {doc.title}
                    </h2>
                    <p className="mt-2 flex-1 text-sm leading-6 text-zinc-600">{doc.description}</p>
                    <div className="mt-4 rounded-md bg-zinc-50 px-3 py-2 text-xs text-zinc-500">
                      {doc.file}
                    </div>
                    <Button asChild variant="outline" className="mt-4 justify-between">
                      <Link to={doc.to}>
                        Open docs
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </motion.article>
                )
              })}
            </div>
          </DocsSection>
        </div>
      </DocsBody>
    </DocsPage>
  )
}
