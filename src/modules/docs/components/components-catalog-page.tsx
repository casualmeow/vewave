import { Link } from '@tanstack/react-router'
import { ArrowRight, BookOpen } from 'lucide-react'
import { motion } from 'motion/react'

import { componentDocLinks, componentDocsHighlights } from '../content/component-docs-content'
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from './docs-page-layout'
import { Button } from '@/shared/ui'

export function ComponentsCatalogPage() {
  return (
    <DocsPage>
      <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
        <BookOpen className="size-4" />
        UI kit documentation
      </div>
      <DocsTitle className="mt-5">Components</DocsTitle>
      <DocsDescription>
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
                  className="rounded-lg border border-border bg-card p-5 shadow-sm"
                >
                  <Icon className="size-5 text-primary" />
                  <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
                    {component.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {component.description}
                  </p>
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
                <div key={item.title} className="rounded-lg border border-border bg-muted/35 p-5">
                  <Icon className="size-5 text-primary" />
                  <h3 className="mt-4 text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                </div>
              )
            })}
          </section>
        </div>
      </DocsBody>
    </DocsPage>
  )
}
