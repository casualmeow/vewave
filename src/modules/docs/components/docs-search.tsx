import { useDocsSearch } from 'fumadocs-core/search/client'
import { createContentHighlighter } from 'fumadocs-core/search'
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
} from 'fumadocs-ui/components/dialog/search'
import { useSearchContext } from 'fumadocs-ui/contexts/search'
import { Search } from 'lucide-react'
import { useMemo } from 'react'

import { docsSearchRecords } from '../content/docs-search-content'
import type { SharedProps } from 'fumadocs-ui/contexts/search'
import type { SearchClient } from 'fumadocs-core/search/client'
import type { SortedResult } from 'fumadocs-core/search'
import { cn } from '@/shared/lib/utils'

type DocsSearchDialogProps = SharedProps & {
  links?: Array<[name: string, href: string]>
}

const defaultResultCount = 8

const docsSearchClient: SearchClient = {
  search(query) {
    const normalizedQuery = normalizeSearchValue(query)
    const highlighter = createContentHighlighter(normalizedQuery)

    return docsSearchRecords
      .map((record, index) => ({
        record,
        index,
        score: scoreRecord(record, normalizedQuery),
      }))
      .filter(({ score }) => normalizedQuery.length === 0 || score > 0)
      .sort((a, b) => b.score - a.score || a.index - b.index)
      .slice(0, normalizedQuery.length === 0 ? defaultResultCount : 24)
      .map(({ record }) => {
        const content =
          normalizedQuery.length > 0
            ? highlighter.highlightMarkdown(`${record.title} - ${record.description}`)
            : `${record.title} - ${record.description}`

        return {
          id: record.id,
          url: record.url,
          type: 'page',
          content,
          breadcrumbs: record.breadcrumbs,
        } satisfies SortedResult
      })
  },
}

export function DocsSearchDialog({ open, onOpenChange }: DocsSearchDialogProps) {
  const { search, setSearch, query } = useDocsSearch(
    {
      client: docsSearchClient,
      allowEmpty: true,
      delayMs: 80,
    },
    [],
  )

  return (
    <SearchDialog
      open={open}
      onOpenChange={onOpenChange}
      search={search}
      onSearchChange={setSearch}
      isLoading={query.isLoading}
    >
      <SearchDialogOverlay className="bg-foreground/28 backdrop-blur-sm" />
      <SearchDialogContent className="border-border bg-card text-card-foreground shadow-[0_28px_90px_color-mix(in_srgb,var(--foreground)_32%,transparent)]">
        <SearchDialogHeader className="border-b border-border bg-muted">
          <SearchDialogIcon />
          <SearchDialogInput placeholder="Search docs, components, props..." />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList
          items={query.data === 'empty' ? [] : query.data}
          Empty={() => (
            <div className="px-6 py-12 text-center text-sm text-muted-foreground">
              Nothing matched. Try a component name, prop, or route.
            </div>
          )}
        />
      </SearchDialogContent>
    </SearchDialog>
  )
}

export function DocsSearchButton({ className }: { className?: string }) {
  const { hotKey, setOpenSearch } = useSearchContext()
  const hotKeyLabels = useMemo(() => hotKey.map((key) => key.display), [hotKey])

  return (
    <button
      type="button"
      data-search-trigger=""
      aria-label="Open docs search"
      className={cn(
        'inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card/86 px-3 text-sm font-medium text-muted-foreground shadow-sm backdrop-blur transition-[background-color,border-color,color,box-shadow]',
        'hover:border-primary/30 hover:bg-card hover:text-foreground hover:shadow-[0_12px_32px_color-mix(in_srgb,var(--foreground)_10%,transparent)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className,
      )}
      onClick={() => setOpenSearch(true)}
    >
      <Search className="size-4" />
      <span className="hidden sm:inline">Search docs</span>
      <span className="ml-1 hidden items-center gap-0.5 sm:inline-flex">
        {hotKeyLabels.map((label, index) => (
          <kbd
            key={index}
            className="rounded-md border border-border bg-muted px-1.5 py-0.5 text-[0.68rem] font-semibold leading-none text-muted-foreground"
          >
            {label}
          </kbd>
        ))}
      </span>
    </button>
  )
}

function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase()
}

function scoreRecord(record: (typeof docsSearchRecords)[number], query: string) {
  if (query.length === 0) return 1

  const haystack = [
    record.title,
    record.description,
    record.url,
    record.breadcrumbs.join(' '),
    ...record.keywords,
  ]
    .join(' ')
    .toLowerCase()

  if (record.title.toLowerCase() === query) return 120
  if (record.title.toLowerCase().startsWith(query)) return 96
  if (record.title.toLowerCase().includes(query)) return 72
  if (record.url.toLowerCase().includes(query)) return 58

  const words = query.split(/\s+/).filter(Boolean)
  const matchedWords = words.filter((word) => haystack.includes(word)).length

  if (matchedWords === 0) return 0

  return matchedWords * 18 + (haystack.includes(query) ? 16 : 0)
}
