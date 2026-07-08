import { useMemo, useState } from 'react'
import { GitCommitHorizontal } from 'lucide-react'

import { changelogMarkdown, commits } from 'virtual:vewave-changelog'
import type { ChangelogCommit } from 'virtual:vewave-changelog'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui'
import { cn } from '@/shared/lib/utils'

export function ChangelogPage() {
  const sections = useMemo(() => parseReleases(changelogMarkdown), [changelogMarkdown])
  const latest = sections[0]?.version
  const [selected, setSelected] = useState(latest)

  const activeIndex = Math.max(
    0,
    sections.findIndex((r) => r.version === selected),
  )
  const release = sections[activeIndex]

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16 md:px-8">
      <header className="mb-12">
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-primary">Releases</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-background md:text-4xl">
          Changelog
        </h1>
      </header>

      {sections.length === 0 || !release ? (
        <div className="rounded-xl border border-background/10 bg-background/[0.03] px-6 py-12 text-center">
          <p className="text-sm font-medium text-background">No releases yet</p>
          <p className="mt-1 text-sm text-background/50">
            The first release appears here once a Release PR is merged into <code>main</code>.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-8 flex flex-wrap items-center gap-3 border-b border-background/10 pb-6">
            <Select value={selected} onValueChange={setSelected}>
              <SelectTrigger
                size="sm"
                className="w-[130px] border-background/20 bg-background/[0.04] font-semibold text-background hover:bg-background/[0.08] [&_svg]:text-background/50"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sections.map((r) => (
                  <SelectItem key={r.version} value={r.version}>
                    v{r.version}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {release.date && (
              <time className="text-xs tabular-nums text-background/50">{release.date}</time>
            )}
            {release.version === latest && (
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                Latest
              </span>
            )}
            <span className="ml-auto text-xs tabular-nums text-background/30">
              {activeIndex + 1} / {sections.length}
            </span>
          </div>

          <ReleaseGroups release={release} />
        </>
      )}

      {commits.length > 0 ? (
        <Accordion type="single" collapsible className="mt-16 border-t border-background/10 pt-4">
          <AccordionItem value="commits" className="border-0">
            <AccordionTrigger className="text-background hover:text-background [&>svg]:text-background/40">
              <span className="flex items-center gap-2">
                Recent commits
                <span className="rounded-full bg-background/10 px-2 py-0.5 text-xs font-normal text-background/60">
                  {commits.length}
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="p-0 text-background/70">
              <CommitLog commits={commits} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ) : null}
    </div>
  )
}

const COMMIT_PAGE_SIZE = 15

function CommitLog({ commits }: { commits: Array<ChangelogCommit> }) {
  const [visible, setVisible] = useState(COMMIT_PAGE_SIZE)
  const shown = commits.slice(0, visible)
  const remaining = commits.length - shown.length

  return (
    <>
      <ul className="divide-y divide-background/[0.06]">
        {shown.map((commit) => (
          <CommitRow key={commit.hash} commit={commit} />
        ))}
      </ul>
      {remaining > 0 ? (
        <div className="mt-3 flex items-center justify-between gap-3 text-xs text-background/40">
          <span className="tabular-nums">
            Showing {shown.length} of {commits.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setVisible((n) => n + COMMIT_PAGE_SIZE)}
              className="rounded-md border border-background/15 px-2.5 py-1 font-medium text-background/70 transition-colors hover:border-background/30 hover:text-background"
            >
              Show {Math.min(remaining, COMMIT_PAGE_SIZE)} more
            </button>
            <button
              type="button"
              onClick={() => setVisible(commits.length)}
              className="rounded-md px-2.5 py-1 font-medium text-background/50 transition-colors hover:text-background"
            >
              Show all
            </button>
          </div>
        </div>
      ) : commits.length > COMMIT_PAGE_SIZE ? (
        <div className="mt-3 flex items-center justify-between gap-3 text-xs text-background/40">
          <span className="tabular-nums">All {commits.length} shown</span>
          <button
            type="button"
            onClick={() => setVisible(COMMIT_PAGE_SIZE)}
            className="rounded-md px-2.5 py-1 font-medium text-background/50 transition-colors hover:text-background"
          >
            Collapse
          </button>
        </div>
      ) : null}
    </>
  )
}

function ReleaseGroups({ release }: { release: Release }) {
  return (
    <div className="space-y-6">
      {release.groups.map((group) => (
        <div key={group.name} className="grid gap-2">
          <CategoryTag name={group.name} />
          <ul className="grid gap-1.5">
            {group.items.map((item, i) => (
              <ReleaseEntryRow key={i} item={item} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

function ReleaseEntryRow({ item }: { item: ReleaseEntry }) {
  return (
    <li className="flex items-baseline gap-2 text-sm leading-6">
      <span className="select-none text-background/30" aria-hidden>
        &ndash;
      </span>
      {item.scope ? (
        <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
          {item.scope}
        </span>
      ) : null}
      <span className="text-background/80">{item.subject}</span>
      {item.commitUrl && item.shortHash ? (
        <a
          href={item.commitUrl}
          target="_blank"
          rel="noreferrer"
          className="ml-auto inline-flex shrink-0 items-center gap-1 font-mono text-xs text-background/40 underline-offset-2 transition-colors hover:text-background hover:underline"
        >
          <GitCommitHorizontal className="size-3" />
          {item.shortHash}
        </a>
      ) : null}
    </li>
  )
}

function CommitRow({ commit }: { commit: ChangelogCommit }) {
  return (
    <li className="flex items-center gap-3 py-2 text-sm">
      <code className="shrink-0 rounded bg-background/10 px-1.5 py-0.5 font-mono text-xs text-background/60">
        {commit.shortHash}
      </code>
      <span className="min-w-0 flex-1 truncate text-background/80">{commit.subject}</span>
      <span className="hidden shrink-0 text-xs text-background/40 sm:inline">{commit.author}</span>
      <time className="shrink-0 text-xs tabular-nums text-background/40">{commit.date}</time>
    </li>
  )
}

/** Maps a Release Please section name to accent styling. */
function CategoryTag({ name }: { name: string }) {
  const style = categoryStyle(name)

  return (
    <span
      className={cn(
        'inline-flex w-fit items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset',
        style,
      )}
    >
      {name}
    </span>
  )
}

function categoryStyle(name: string): string {
  switch (name.trim().toLowerCase()) {
    case 'added':
    case 'features':
      return 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/25'
    case 'fixed':
    case 'bug fixes':
      return 'bg-amber-400/10 text-amber-300 ring-amber-400/25'
    case 'changed':
      return 'bg-sky-400/10 text-sky-300 ring-sky-400/25'
    case 'security':
      return 'bg-rose-400/10 text-rose-300 ring-rose-400/25'
    case 'deprecated':
    case 'removed':
      return 'bg-zinc-400/10 text-zinc-300 ring-zinc-400/25'
    case 'breaking changes':
      return 'bg-red-500/15 text-red-300 ring-red-500/30'
    default:
      return 'bg-background/10 text-background/70 ring-background/20'
  }
}

interface ReleaseEntry {
  subject: string
  scope: string | null
  shortHash: string | null
  commitUrl: string | null
}

interface ReleaseGroup {
  name: string
  items: Array<ReleaseEntry>
}

interface Release {
  version: string
  date: string | null
  groups: Array<ReleaseGroup>
}

/**
 * Parses a Release Please-generated CHANGELOG.md.
 *
 * Expected format:
 *   ## [1.2.0](https://github.com/owner/repo/compare/v1.1.0...v1.2.0) (2024-01-15)
 *
 *   ### Features
 *
 *   * **api:** add new endpoint ([abc1234](https://github.com/owner/repo/commit/abc1234)), closes [#42](...)
 *   - plain subject without scope ([def5678](https://github.com/owner/repo/commit/def5678))
 *
 *   ### Bug Fixes
 *   ...
 *
 *   ### BREAKING CHANGES
 *   ...
 */
function parseReleases(markdown: string): Array<Release> {
  const releases: Array<Release> = []
  const lines = markdown.split('\n')

  let current: Release | null = null
  let currentGroup: ReleaseGroup | null = null

  for (const rawLine of lines) {
    const line = rawLine

    // Release header: ## [version](url) (date)  OR  ## [version](url)
    const releaseMatch = line.match(/^## \[(.+?)\]\((.+?)\)(?:\s+\((\d{4}-\d{2}-\d{2})\))?/)
    if (releaseMatch) {
      current = {
        version: releaseMatch[1],
        date: releaseMatch[3] ?? null,
        groups: [],
      }
      currentGroup = null
      releases.push(current)
      continue
    }

    if (!current) continue

    // Section header: ### Features, ### Bug Fixes, ### BREAKING CHANGES, etc.
    const sectionMatch = line.match(/^### (.+)$/)
    if (sectionMatch) {
      currentGroup = { name: sectionMatch[1].trim(), items: [] }
      current.groups.push(currentGroup)
      continue
    }

    // Item: * **scope:** subject ([hash](url))  OR  - subject ([hash](url))
    const itemMatch = line.match(/^[*-]\s+(?:\*\*(.+?):\*\*\s+)?(.+)$/)
    if (itemMatch && currentGroup) {
      const scope = itemMatch[1] ?? null
      const rawSubject = itemMatch[2]

      const { subject, shortHash, commitUrl } = extractEntryMeta(rawSubject)

      currentGroup.items.push({ subject, scope, shortHash, commitUrl })
    }
  }

  return releases
}

/**
 * Strips inline markdown commit links and trailing issue refs from an entry body,
 * returning clean display text plus the commit hash and URL.
 */
function extractEntryMeta(raw: string): {
  subject: string
  shortHash: string | null
  commitUrl: string | null
} {
  let shortHash: string | null = null
  let commitUrl: string | null = null

  // Commit link: ([abc1234](https://github.com/owner/repo/commit/abc1234))
  const commitMatch = raw.match(/\(\[([0-9a-f]{7,40})\]\((https?:\/\/[^)]+)\)/)
  if (commitMatch) {
    shortHash = commitMatch[1].slice(0, 7)
    commitUrl = commitMatch[2]
  }

  // Remove the commit link group, issue/PR refs, then collapse leftover markdown links.
  const cleaned = raw
    .replace(/\(\[[0-9a-f]{7,40}\]\([^)]+\)\)/g, '')
    .replace(/,?\s*closes\s+\[#\d+\]\([^)]+\)/gi, '')
    .replace(/,?\s*\[#\d+\]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim()

  return { subject: cleaned, shortHash, commitUrl }
}
