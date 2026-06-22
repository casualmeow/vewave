import { Link } from '@tanstack/react-router'
import { ArrowLeft, FileCode2 } from 'lucide-react'

import { getSharedUiDoc } from '../content/shared-ui-docs-content'
import { DocsCodeBlock, DocsPropTable, DocsSection } from './component-doc-primitives'
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from './docs-page-layout'
import { Button } from '@/shared/ui'

export function SharedUiComponentDocsPage({ slug }: { slug: string }) {
  const doc = getSharedUiDoc(slug)

  if (!doc) {
    return (
      <DocsPage className="rounded-lg border border-zinc-200 bg-white px-5 py-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:px-8">
        <DocsTitle className="text-4xl font-semibold tracking-tight text-zinc-950">
          Shared primitive not found
        </DocsTitle>
        <DocsDescription className="max-w-2xl text-lg leading-8 text-zinc-600">
          No shared UI documentation exists for this slug.
        </DocsDescription>
        <DocsBody>
          <Button asChild variant="outline">
            <Link to="/admin/docs/ui/components/shared">
              <ArrowLeft className="size-4" />
              Back to Shared UI
            </Link>
          </Button>
        </DocsBody>
      </DocsPage>
    )
  }

  const Icon = doc.icon

  return (
    <DocsPage className="rounded-lg border border-zinc-200 bg-white px-5 py-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:px-8">
      <Button asChild variant="ghost" size="sm" className="mb-5 -ml-2">
        <Link to="/admin/docs/ui/components/shared">
          <ArrowLeft className="size-4" />
          Shared UI
        </Link>
      </Button>

      <div className="inline-flex items-center gap-2 rounded-full border border-teal-900/10 bg-teal-50 px-3 py-1 text-sm font-medium text-teal-800">
        <Icon className="size-4" />
        {doc.file}
      </div>
      <DocsTitle className="mt-5 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-6xl">
        {doc.title}
      </DocsTitle>
      <DocsDescription className="max-w-3xl text-lg leading-8 text-zinc-600">
        {doc.description}
      </DocsDescription>

      <DocsBody className="max-w-none">
        <div className="not-prose space-y-10">
          <section className="grid gap-4 lg:grid-cols-[0.86fr_1.14fr]">
            <div className="rounded-xl border border-zinc-200 bg-[#f8fbfb] p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
                <FileCode2 className="size-4 text-teal-700" />
                Import
              </div>
              <div className="mt-4">
                <DocsCodeBlock title="Import">{doc.importSnippet}</DocsCodeBlock>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-semibold tracking-tight text-zinc-950">Live example</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                Rendered from the actual shared/ui export where the component is safe to preview in
                docs.
              </p>
              <div className="mt-4">{doc.demo}</div>
            </div>
          </section>

          <DocsSection title="Usage">
            <DocsCodeBlock>{doc.usageSnippet}</DocsCodeBlock>
          </DocsSection>

          <DocsSection title="API">
            <DocsPropTable rows={doc.apiRows} />
          </DocsSection>

          <DocsSection title="Notes">
            <div className="grid gap-3 md:grid-cols-2">
              {doc.notes.map((note) => (
                <div
                  key={note}
                  className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm leading-6 text-zinc-600"
                >
                  {note}
                </div>
              ))}
            </div>
          </DocsSection>
        </div>
      </DocsBody>
    </DocsPage>
  )
}
