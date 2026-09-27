import * as Tabs from '@radix-ui/react-tabs'
import { ArrowUpRight, Search, X } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'

import { searchSettings } from './settings-search'
import type { SettingsSearchItem, SettingsSearchResult } from './settings-search'
import { FluidGlassGroup, FluidGlassTarget } from '@/components/fluid-glass'
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, Input } from '@/shared/ui'
import { cn } from '@/shared/lib/utils'

export type SettingsDialogTab = {
  id: string
  label: string
  content: ReactNode
  searchItems?: ReadonlyArray<SettingsSearchItem>
}

export type SettingsDialogSection = {
  id: string
  label: string
  description: string
  icon: ReactNode
  searchItems?: ReadonlyArray<SettingsSearchItem>
} & (
  | { content: ReactNode; tabs?: never }
  | { tabs: ReadonlyArray<SettingsDialogTab>; content?: never }
)

const panelClasses =
  'min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/50 md:px-6'

export function SettingsDialogContent({
  sections,
  value,
  onValueChange,
  title = 'Settings',
  footer,
}: {
  sections: ReadonlyArray<SettingsDialogSection>
  value: string
  onValueChange: (value: string) => void
  title?: string
  footer?: ReactNode
}) {
  const [query, setQuery] = useState('')
  const [selectedTabs, setSelectedTabs] = useState<Record<string, string>>({})
  const [destination, setDestination] = useState<SettingsSearchResult | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const resultsRef = useRef<HTMLUListElement>(null)
  const [vertical, setVertical] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 768px)').matches : true,
  )
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)')
    const update = () => setVertical(mediaQuery.matches)
    update()
    mediaQuery.addEventListener('change', update)
    return () => mediaQuery.removeEventListener('change', update)
  }, [])
  const selected = sections.find((section) => section.id === value) ?? sections[0]
  const searching = query.trim().length > 0
  const results = searching ? searchSettings(sections, query) : []

  useEffect(() => {
    if (!destination || searching || selected?.id !== destination.sectionId) return

    const frame = requestAnimationFrame(() => {
      const anchors = panelRef.current?.querySelectorAll<HTMLElement>('[data-settings-anchor]')
      const anchor = Array.from(anchors ?? []).find(
        (node) => node.dataset.settingsAnchor === destination.target,
      )
      const control = anchor?.querySelector<HTMLElement>('input, button, [tabindex="0"]')
      const focusTarget = control ?? panelRef.current
      focusTarget?.focus({ preventScroll: true })
      anchor?.scrollIntoView?.({ block: 'nearest', behavior: 'instant' })
      setDestination(null)
    })
    return () => cancelAnimationFrame(frame)
  }, [destination, searching, selected?.id])

  const clearSearch = () => {
    setQuery('')
    setDestination(null)
    searchRef.current?.focus()
  }
  const openResult = (result: SettingsSearchResult) => {
    const tabId = result.tabId
    if (tabId) setSelectedTabs((tabs) => ({ ...tabs, [result.sectionId]: tabId }))
    onValueChange(result.sectionId)
    setQuery('')
    setDestination(result)
  }

  return (
    <DialogContent
      className="h-[min(80dvh,42rem)] gap-0 rounded-[24px] p-0 sm:max-w-[min(58rem,calc(100vw-2rem))]"
      onEscapeKeyDown={(event) => {
        if (query) {
          event.preventDefault()
          clearSearch()
        }
      }}
    >
      <Tabs.Root
        value={selected?.id}
        onValueChange={(next) => {
          setQuery('')
          setDestination(null)
          onValueChange(next)
        }}
        orientation={vertical ? 'vertical' : 'horizontal'}
        className="flex h-full min-h-0 flex-col overflow-hidden rounded-[inherit] md:flex-row"
      >
        <div className="flex shrink-0 flex-col border-b border-border/40 md:w-52 md:border-b-0 md:border-r">
          <DialogHeader className="px-5 pb-3 pr-14 pt-5 text-left md:pr-5">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription className="sr-only">
              Choose a section to configure your preferences and account.
            </DialogDescription>
          </DialogHeader>
          <div className="relative mx-3 mb-3">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 z-10 size-3.5 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              ref={searchRef}
              type="search"
              aria-label="Search settings"
              placeholder="Search settings"
              autoComplete="off"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'ArrowDown' && searching) {
                  event.preventDefault()
                  resultsRef.current?.querySelector('button')?.focus()
                }
              }}
              className="h-10 border-transparent bg-foreground/[0.04] pl-9 pr-9 shadow-none dark:bg-foreground/[0.04] [&::-webkit-search-cancel-button]:appearance-none"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={clearSearch}
                className="absolute right-0 top-0 flex size-10 items-center justify-center rounded-md text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X aria-hidden="true" className="size-3.5" />
              </button>
            )}
          </div>
          <div className="overflow-x-auto px-3 pb-3 md:overflow-visible md:pb-4">
            <FluidGlassGroup
              environment={{ type: 'auto-dom' }}
              className="fluid-glass-settings-nav min-w-fit rounded-lg"
            >
              <Tabs.List aria-label={`${title} sections`} className="flex h-auto gap-1 md:flex-col">
                {sections.map((section) => {
                  const active = section.id === selected?.id
                  return (
                    <FluidGlassTarget
                      key={section.id}
                      id={`settings-${section.id}`}
                      active={active}
                      behaviors={['selection']}
                      radius="inherit"
                      asChild
                    >
                      <Tabs.Trigger
                        value={section.id}
                        data-active={active || undefined}
                        onFocus={(event) => {
                          if (!vertical)
                            event.currentTarget.scrollIntoView?.({
                              block: 'nearest',
                              inline: 'nearest',
                              behavior: 'instant',
                            })
                        }}
                        className={cn(
                          'glass-control relative flex min-h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-left text-sm font-medium leading-5 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 [@media(pointer:coarse)]:min-h-11',
                          active
                            ? 'text-foreground'
                            : 'text-muted-foreground hover:text-foreground',
                        )}
                      >
                        <span
                          aria-hidden
                          className="flex size-4 shrink-0 items-center [&>svg]:size-4"
                        >
                          {section.icon}
                        </span>
                        {section.label}
                      </Tabs.Trigger>
                    </FluidGlassTarget>
                  )
                })}
              </Tabs.List>
            </FluidGlassGroup>
          </div>
        </div>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="shrink-0 border-b border-border/40 px-5 py-4 pr-14 md:px-6">
            <h2 className="text-base font-semibold text-foreground">
              {searching ? 'Search results' : selected?.label}
            </h2>
            <p
              className="text-sm leading-5 text-muted-foreground"
              role={searching ? 'status' : undefined}
            >
              {searching
                ? `${results.length} ${results.length === 1 ? 'match' : 'matches'} for “${query.trim()}”`
                : selected?.description}
            </p>
          </div>
          {searching && (
            <div className={panelClasses}>
              {results.length ? (
                <ul
                  ref={resultsRef}
                  aria-label="Matching settings"
                  className="space-y-1"
                  onKeyDown={(event) => {
                    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
                    const buttons = Array.from(event.currentTarget.querySelectorAll('button'))
                    const current = buttons.indexOf(document.activeElement as HTMLButtonElement)
                    const next = current + (event.key === 'ArrowDown' ? 1 : -1)
                    event.preventDefault()
                    if (next < 0) searchRef.current?.focus()
                    else buttons[Math.min(next, buttons.length - 1)]?.focus()
                  }}
                >
                  {results.map((result) => (
                    <li key={`${result.sectionId}:${result.tabId ?? ''}:${result.label}`}>
                      <button
                        type="button"
                        onClick={() => openResult(result)}
                        className="flex w-full items-center justify-between gap-4 rounded-lg px-3 py-3 text-left outline-none hover:bg-foreground/[0.04] focus-visible:bg-foreground/[0.04] focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <span>
                          <span className="block text-sm font-medium">{result.label}</span>
                          {result.path !== result.label && (
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                              {result.path}
                            </span>
                          )}
                        </span>
                        <ArrowUpRight
                          aria-hidden="true"
                          className="size-4 shrink-0 text-muted-foreground"
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="py-8">
                  <p className="text-sm font-medium">No settings found.</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Try a setting like “dark”, “motion”, or “background”.
                  </p>
                </div>
              )}
            </div>
          )}
          {sections.map((section) => (
            <Tabs.Content
              key={section.id}
              value={section.id}
              tabIndex={section.tabs ? -1 : 0}
              ref={section.id === selected?.id ? panelRef : undefined}
              className={cn(
                'min-h-0 flex-1 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/50 data-[state=inactive]:hidden',
                section.tabs ? 'flex flex-col' : panelClasses,
                searching && 'hidden',
              )}
            >
              {!searching &&
                (section.tabs ? (
                  <Tabs.Root
                    value={selectedTabs[section.id] ?? section.tabs[0]?.id}
                    onValueChange={(tab) => {
                      setDestination(null)
                      setSelectedTabs((tabs) => ({ ...tabs, [section.id]: tab }))
                    }}
                    className="flex min-h-0 flex-1 flex-col"
                  >
                    <Tabs.List
                      aria-label={`${section.label} preferences`}
                      className="mx-5 flex shrink-0 gap-5 overflow-x-auto border-b border-border/40 md:mx-6"
                    >
                      {section.tabs.map((tab) => (
                        <Tabs.Trigger
                          key={tab.id}
                          value={tab.id}
                          className="min-h-11 shrink-0 border-b-2 border-transparent px-1 py-3 text-sm font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring data-[state=active]:border-foreground data-[state=active]:text-foreground"
                          onFocus={(event) =>
                            event.currentTarget.scrollIntoView?.({
                              block: 'nearest',
                              inline: 'nearest',
                              behavior: 'instant',
                            })
                          }
                        >
                          {tab.label}
                        </Tabs.Trigger>
                      ))}
                    </Tabs.List>
                    {section.tabs.map((tab) => (
                      <Tabs.Content key={tab.id} value={tab.id} className={panelClasses}>
                        {tab.content}
                      </Tabs.Content>
                    ))}
                  </Tabs.Root>
                ) : (
                  section.content
                ))}
            </Tabs.Content>
          ))}
          {footer && (
            <div className="shrink-0 border-t border-border/40 px-5 py-3 md:px-6">{footer}</div>
          )}
        </div>
      </Tabs.Root>
    </DialogContent>
  )
}
