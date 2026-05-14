import { Code2, Layers3 } from 'lucide-react'

import { ShowcaseCatalogRail } from '../ui'
import { HeaderShowcaseSection } from './header-showcase-section'
import { ResizableCardShowcaseSection } from './resizable-card-showcase'

export function UiShowcasePage() {
  return (
    <div className="min-h-screen bg-[#f7faf9] text-zinc-950">
      <main className="mx-auto flex w-full max-w-[96rem] flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-900/10 bg-white px-3 py-1 text-sm text-teal-800 shadow-sm">
              <Code2 className="size-4" />
              UI catalog
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">UI Showcase</h1>
              <p className="text-lg leading-8 text-zinc-600">
                Interactive playgrounds for reusable project components. Each section owns its own
                state, controls, presets, and live demo surface.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-600 shadow-sm">
            <div className="flex items-center gap-2 font-medium text-zinc-950">
              <Layers3 className="size-4 text-teal-700" />
              Component list
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <a className="rounded-full bg-zinc-100 px-3 py-1 text-xs" href="#header">
                Header
              </a>
              <a className="rounded-full bg-zinc-100 px-3 py-1 text-xs" href="#resizable-card">
                ResizableCard
              </a>
            </div>
          </div>
        </section>

        <ShowcaseCatalogRail />
        <HeaderShowcaseSection />
        <ResizableCardShowcaseSection />
      </main>
    </div>
  )
}
