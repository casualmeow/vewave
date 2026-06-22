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
    <DocsPage>
      <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
        <Layers3 className="size-4" />
        src/shared/ui
      </div>
      <DocsTitle className="mt-5">Shared UI</DocsTitle>
      <DocsDescription>
        Low-level primitives are documented independently. Use this page as the catalog, then open
        each primitive for its API, usage, notes, and live example.
      </DocsDescription>

      <DocsBody className="max-w-none">
        <div className="not-prose space-y-10">
          <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-xl border border-border bg-muted/35 p-5">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                Shared barrel
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Import generic building blocks from the shared barrel. Promote behavior to
                src/components or src/modules when a primitive gains product state or reusable
                orchestration.
              </p>
              <div className="mt-4">
                <DocsCodeBlock>{importSnippet}</DocsCodeBlock>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-[radial-gradient(circle_at_12%_0%,color-mix(in_srgb,var(--primary)_18%,transparent),transparent_18rem),linear-gradient(135deg,var(--card),var(--muted))] p-5">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
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
                      className="rounded-lg border border-border bg-card/85 p-4 shadow-sm"
                    >
                      <div className="text-sm font-semibold text-foreground">{category.title}</div>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {category.description}
                      </p>
                      <div className="mt-3 text-xs font-medium text-primary">
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
                    className="flex min-h-56 flex-col rounded-xl border border-border bg-card p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <Icon className="size-5 text-primary" />
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[0.68rem] font-medium text-muted-foreground">
                        {doc.category}
                      </span>
                    </div>
                    <h2 className="mt-4 text-xl font-semibold tracking-tight text-foreground">
                      {doc.title}
                    </h2>
                    <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">
                      {doc.description}
                    </p>
                    <div className="mt-4 rounded-md bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
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
