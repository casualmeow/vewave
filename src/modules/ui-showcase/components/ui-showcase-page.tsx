import { Code2, PanelLeft, PanelTop, StretchHorizontal } from 'lucide-react'
import { useState } from 'react'

import { HeaderShowcaseSection } from './header-showcase-section'
import { ResizableCardShowcaseSection } from './resizable-card-showcase'
import { SidebarShowcaseSection } from './sidebar-showcase-section'
import { Button } from '@/shared/ui'

type ShowcaseComponentId = 'sidebar' | 'header' | 'resizable-card'

const showcaseComponents = [
  {
    id: 'sidebar',
    label: 'Sidebar',
    description: 'Navigation shell with liquid-glass controls and full prop tuning.',
    icon: PanelLeft,
  },
  {
    id: 'header',
    label: 'Header',
    description: 'Scroll-aware header playground.',
    icon: PanelTop,
  },
  {
    id: 'resizable-card',
    label: 'ResizableCard',
    description: 'Expandable/resizable card animation playground.',
    icon: StretchHorizontal,
  },
] as const satisfies ReadonlyArray<{
  id: ShowcaseComponentId
  label: string
  description: string
  icon: typeof PanelLeft
}>

export function UiShowcasePage() {
  const [activeComponent, setActiveComponent] = useState<ShowcaseComponentId>('sidebar')
  const activeConfig =
    showcaseComponents.find((item) => item.id === activeComponent) ?? showcaseComponents[0]
  const ActiveIcon = activeConfig.icon

  return (
    <div className="min-h-screen bg-[#f8faf9] text-zinc-950">
      <main className="mx-auto flex w-full max-w-[92rem] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-900/10 bg-teal-50 px-3 py-1 text-sm font-medium text-teal-800">
                <Code2 className="size-4" />
                UI playground
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
                {activeConfig.label}
              </h1>
              <p className="mt-2 text-base leading-7 text-zinc-600">{activeConfig.description}</p>
            </div>

            <div className="grid min-w-64 gap-2">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-950">
                <ActiveIcon className="size-4 text-teal-700" />
                Component
              </div>
              <div className="flex flex-wrap gap-2">
                {showcaseComponents.map((item) => {
                  const Icon = item.icon
                  const active = item.id === activeComponent

                  return (
                    <Button
                      key={item.id}
                      type="button"
                      variant={active ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveComponent(item.id)}
                      className={active ? 'bg-zinc-950 text-white' : 'bg-white'}
                    >
                      <Icon className="size-4" />
                      {item.label}
                    </Button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm leading-6 text-zinc-600">
            One focused component is rendered at a time. Use the controls inside the active
            playground to inspect real props and live state.
          </div>
        </section>

        {activeComponent === 'sidebar' ? <SidebarShowcaseSection /> : null}
        {activeComponent === 'header' ? <HeaderShowcaseSection /> : null}
        {activeComponent === 'resizable-card' ? <ResizableCardShowcaseSection /> : null}
      </main>
    </div>
  )
}
