import { Link } from '@tanstack/react-router'
import { ChevronRight, Folder, MessageSquare, Plus, ScrollText } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import { useAuthStore } from '@/modules/auth/model'
import { useGetApiForumThreads } from '@/core/api/generated/forum/forum'
import { CATEGORIES, CATEGORY_META } from './forum-shared'

export function ForumHomePage() {
  const user = useAuthStore((state) => state.user)
  const threadsQuery = useGetApiForumThreads()
  const threads = threadsQuery.data?.threads ?? []

  const counts = threads.reduce<Record<string, number>>((acc, thread) => {
    acc[thread.category] = (acc[thread.category] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="w-full px-6 py-16 md:px-10">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-background/10 pb-7">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-primary">Forum</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-background md:text-4xl">
            Community
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-background/50">
            Browse a category to read discussions, or start a new thread.
          </p>
        </div>
        {user ? (
          <Link
            to="/community/new"
            search={{ category: undefined }}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="size-4" />
            New thread
          </Link>
        ) : (
          <Link
            to="/sign-in"
            search={{ redirectTo: '/community' }}
            className="rounded-md border border-background/20 px-3 py-1.5 text-sm font-medium text-background/70 transition-colors hover:border-background/40 hover:text-background"
          >
            Sign in to post
          </Link>
        )}
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {CATEGORIES.map((category) => {
          const meta = CATEGORY_META[category.value]
          const count = counts[category.value] ?? 0

          return (
            <Link
              key={category.value}
              to="/community/$category"
              params={{ category: category.value }}
              className="group flex items-center gap-4 rounded-xl border border-background/10 bg-background/[0.03] p-4 transition-colors hover:border-background/20 hover:bg-background/[0.06]"
            >
              <span
                className={cn(
                  'grid size-11 shrink-0 place-items-center rounded-lg bg-background/[0.06]',
                  meta.folder,
                )}
              >
                <Folder className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-background">{category.label}</p>
                <p className="mt-0.5 truncate text-xs text-background/50">{category.description}</p>
              </div>
              <span className="flex shrink-0 items-center gap-1 text-xs text-background/40">
                <MessageSquare className="size-3.5" />
                {count}
              </span>
              <ChevronRight className="size-4 shrink-0 text-background/30 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )
        })}

        <Link
          to="/community/rules"
          className="group flex items-center gap-4 rounded-xl border border-background/10 bg-background/[0.03] p-4 transition-colors hover:border-background/20 hover:bg-background/[0.06]"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-background/[0.06] text-primary">
            <ScrollText className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-background">Community rules</p>
            <p className="mt-0.5 truncate text-xs text-background/50">Guidelines for posting here.</p>
          </div>
          <ChevronRight className="size-4 shrink-0 text-background/30 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  )
}
