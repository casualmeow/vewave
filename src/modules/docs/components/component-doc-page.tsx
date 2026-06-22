import { Link } from '@tanstack/react-router'
import { Callout } from 'fumadocs-ui/components/callout'
import { ArrowRight, CheckCircle2, ExternalLink } from 'lucide-react'
import { motion } from 'motion/react'
import { DocsCodeBlock, DocsPropTable, DocsSection } from './component-doc-primitives'
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from './docs-page-layout'
import type { ReactNode } from 'react'

import type { ComponentDoc } from '../content/component-docs-content'
import { Button } from '@/shared/ui'

export function ComponentDocPage({ doc, showcase }: { doc: ComponentDoc; showcase?: ReactNode }) {
  const Icon = doc.icon

  return (
    <DocsPage>
      <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
        <Icon className="size-4" />
        {doc.eyebrow}
      </div>
      <DocsTitle className="mt-5">{doc.title}</DocsTitle>
      <DocsDescription>{doc.description}</DocsDescription>

      <DocsBody className="max-w-none">
        <div className="not-prose space-y-10">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
          >
            <div className="min-w-0 space-y-4 rounded-lg border border-border bg-muted/35 p-5">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">Install</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Import from the component package barrel. Do not import from private internal
                subfolders in feature code.
              </p>
              <DocsCodeBlock>{doc.importSnippet}</DocsCodeBlock>
            </div>
            <div className="min-w-0 space-y-4 rounded-lg border border-border bg-muted/25 p-5">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Start with the documented public API and move interactive variants to the showcase
                when the state space gets large.
              </p>
              <DocsCodeBlock>{doc.usageSnippet}</DocsCodeBlock>
            </div>
          </motion.section>

          <Callout type="info" title="Docs location">
            Component docs now live in this UI-kit documentation route. Component folders should
            keep implementation, tests, and public exports, while /admin/docs owns usage
            documentation.
          </Callout>

          {showcase ? (
            <DocsSection title="Playground">
              <div className="overflow-hidden rounded-xl border border-border bg-muted/25 p-2 shadow-sm">
                {showcase}
              </div>
            </DocsSection>
          ) : null}

          <DocsSection title="API">
            <DocsPropTable rows={doc.apiRows} />
          </DocsSection>

          <DocsSection title="Guides">
            <div className="grid gap-4">
              {doc.sections.map((section, index) => (
                <motion.article
                  key={section.title}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ delay: index * 0.04, duration: 0.4 }}
                  className="min-w-0 space-y-4 rounded-lg border border-border bg-card p-5 shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-foreground">{section.title}</h3>
                  <p className="text-sm leading-6 text-muted-foreground">{section.body}</p>
                  {section.code ? <DocsCodeBlock>{section.code}</DocsCodeBlock> : null}
                </motion.article>
              ))}
            </div>
          </DocsSection>

          <DocsSection title="Accessibility">
            <div className="grid gap-3 md:grid-cols-2">
              {doc.accessibility.map((item) => (
                <div
                  key={item}
                  className="flex gap-3 rounded-lg border border-border bg-card p-4 text-sm leading-6 text-muted-foreground"
                >
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                  {item}
                </div>
              ))}
            </div>
          </DocsSection>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-foreground p-5 text-background">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Test it live</h2>
              <p className="mt-1 text-sm text-background/70">
                Use the showcase for controls, presets, and responsive preview states.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="secondary">
                <Link to="/admin/docs/ui/components">
                  Open showcase
                  <ExternalLink className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-background/20 bg-background/5 text-background hover:bg-background/10 hover:text-background"
              >
                <Link to="/admin/docs/ui/components">
                  All components
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </DocsBody>
    </DocsPage>
  )
}
