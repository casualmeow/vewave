import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, MessageSquare, Plus, Search } from 'lucide-react'

import {
  AuthorAvatar,
  CATEGORY_META,
  StateNote,
  authorName,
  isForumCategory,
  timeAgo,
} from './forum-shared'
import type { GetApiForumThreads200ThreadsItem } from '@/core/api/generated/model'
import { useAuthStore } from '@/modules/auth/model'
import { useGetApiForumThreads } from '@/core/api/generated/forum/forum'

export function ForumCategoryPage({ category }: { category: string }) {
  const user = useAuthStore((state) => state.user)
  const [search, setSearch] = useState('')
  const valid = isForumCategory(category)

  const threadsQuery = useGetApiForumThreads(valid ? { category } : undefined, {
    query: { enabled: valid },
  })
  const threads = threadsQuery.data?.threads ?? []

  if (!valid) {
    return (
      <div className="w-full px-6 py-16 md:px-10">
        <BackLink />
        <p className="mt-6 text-sm text-background/60">Unknown category.</p>
      </div>
    )
  }

  const meta = CATEGORY_META[category]
  const filtered = threads.filter(
    (thread) =>
      thread.title.toLowerCase().includes(search.toLowerCase()) ||
      thread.body.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="w-full px-6 py-16 md:px-10">
      <BackLink />

      <header className="mt-4 mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-background/10 pb-6">
        <div className="flex items-center gap-3">
          <span className={`size-2.5 rounded-full ${meta.dot}`} />
          <h1 className="text-2xl font-semibold tracking-tight text-background md:text-3xl">
            {meta.label}
          </h1>
        </div>
        {user ? (
          <Link
            to="/community/new"
            search={{ category }}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="size-4" />
            New thread
          </Link>
        ) : null}
      </header>

      <div className="relative mb-2">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-background/40" />
        <input
          placeholder="Search threads…"
          className="w-full rounded-lg border border-background/15 bg-background/[0.04] py-2 pl-9 pr-3 text-sm text-background outline-none placeholder:text-background/40 focus-visible:border-background/30"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="divide-y divide-background/[0.06]">
        {threadsQuery.isPending ? (
          <StateNote>Loading threads…</StateNote>
        ) : threadsQuery.isError ? (
          <StateNote>Unable to load threads.</StateNote>
        ) : filtered.length === 0 ? (
          <StateNote>
            {threads.length === 0 ? 'No threads here yet.' : 'No threads found.'}
          </StateNote>
        ) : (
          filtered.map((thread) => (
            <ThreadRow key={thread.id} category={category} thread={thread} />
          ))
        )}
      </div>
    </div>
  )
}

function ThreadRow({
  category,
  thread,
}: {
  category: string
  thread: GetApiForumThreads200ThreadsItem
}) {
  return (
    <Link
      to="/community/$category/$threadId"
      params={{ category, threadId: thread.id }}
      className="flex items-start gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-background/[0.05]"
    >
      <AuthorAvatar author={thread.author} className="size-9" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-background">{thread.title}</p>
        <p className="mt-0.5 text-xs text-background/50">
          {authorName(thread.author)} · {timeAgo(thread.lastActivityAt)}
        </p>
      </div>
      <span className="mt-0.5 flex shrink-0 items-center gap-1 text-xs text-background/40">
        <MessageSquare className="size-3.5" />
        {thread.replyCount}
      </span>
    </Link>
  )
}

function BackLink() {
  return (
    <Link
      to="/community"
      className="inline-flex items-center gap-1.5 text-sm text-background/50 transition-colors hover:text-background"
    >
      <ArrowLeft className="size-4" />
      All categories
    </Link>
  )
}
