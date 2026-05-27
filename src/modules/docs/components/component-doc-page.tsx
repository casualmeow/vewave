import { Link } from '@tanstack/react-router'
import { Callout } from 'fumadocs-ui/components/callout'
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page'
import { ArrowRight, CheckCircle2, ExternalLink } from 'lucide-react'
import { motion } from 'motion/react'
import { DocsCodeBlock, DocsPropTable, DocsSection } from './component-doc-primitives'
import type { ReactNode } from 'react'

import type { ComponentDoc } from '../content/component-docs-content'
import { Button } from '@/shared/ui'

export function ComponentDocPage({ doc, showcase }: { doc: ComponentDoc; showcase?: ReactNode }) {
  const Icon = doc.icon

  return (
    <DocsPage
      full
      breadcrumb={{ enabled: false }}
      footer={{ enabled: false }}
      tableOfContent={{ enabled: false }}
      tableOfContentPopover={{ enabled: false }}
      className="rounded-lg border border-zinc-200 bg-white px-5 py-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:px-8"
    >
      <div className="inline-flex items-center gap-2 rounded-full border border-teal-900/10 bg-teal-50 px-3 py-1 text-sm font-medium text-teal-800">
        <Icon className="size-4" />
        {doc.eyebrow}
      </div>
      <DocsTitle className="mt-5 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-6xl">
        {doc.title}
      </DocsTitle>
      <DocsDescription className="max-w-3xl text-lg leading-8 text-zinc-600">
        {doc.description}
      </DocsDescription>

      <DocsBody className="max-w-none">
        <div className="not-prose space-y-10">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]"
          >
            <div className="space-y-4 rounded-lg border border-zinc-200 bg-[#f8fbfb] p-5">
              <h2 className="text-xl font-semibold tracking-tight text-zinc-950">Install</h2>
              <p className="text-sm leading-6 text-zinc-600">
                Import from the component package barrel. Do not import from private internal
                subfolders in feature code.
              </p>
              <DocsCodeBlock>{doc.importSnippet}</DocsCodeBlock>
            </div>
            <div className="space-y-4 rounded-lg border border-zinc-200 bg-[#fbfaf7] p-5">
              <h2 className="text-xl font-semibold tracking-tight text-zinc-950">Usage</h2>
              <p className="text-sm leading-6 text-zinc-600">
                Start with the documented public API and move interactive variants to the showcase
                when the state space gets large.
              </p>
              <DocsCodeBlock>{doc.usageSnippet}</DocsCodeBlock>
            </div>
          </motion.section>

          <Callout type="info" title="Docs location">
            Component docs now live in this UI-kit documentation route. Component folders should
            keep implementation, tests, and public exports, while /docs owns usage documentation.
          </Callout>

          {showcase ? (
            <DocsSection title="Playground">
              <div className="overflow-hidden rounded-xl border border-zinc-200 bg-[#f8faf9] p-2 shadow-sm">
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
                  className="space-y-4 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-zinc-950">{section.title}</h3>
                  <p className="text-sm leading-6 text-zinc-600">{section.body}</p>
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
                  className="flex gap-3 rounded-lg border border-zinc-200 bg-white p-4 text-sm leading-6 text-zinc-600"
                >
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                  {item}
                </div>
              ))}
            </div>
          </DocsSection>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-zinc-950 p-5 text-white">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Test it live</h2>
              <p className="mt-1 text-sm text-zinc-300">
                Use the showcase for controls, presets, and responsive preview states.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="secondary">
                <Link to="/ui/showcase">
                  Open showcase
                  <ExternalLink className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white/20 bg-white/5 text-white">
                <Link to="/docs/ui/components">
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
