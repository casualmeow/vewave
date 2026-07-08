import { Link } from '@tanstack/react-router'
import { ArrowLeft, ScrollText } from 'lucide-react'

import { useGetApiForumRules } from '@/core/api/generated/forum/forum'
import { StateNote } from './forum-shared'

export function ForumRulesPage() {
  const rulesQuery = useGetApiForumRules()
  const rules = rulesQuery.data?.rules ?? []

  return (
    <div className="w-full px-6 py-16 md:px-10">
      <Link
        to="/community"
        className="inline-flex items-center gap-1.5 text-sm text-background/50 transition-colors hover:text-background"
      >
        <ArrowLeft className="size-4" />
        All categories
      </Link>

      <header className="mt-4 mb-8 flex items-center gap-3 border-b border-background/10 pb-6">
        <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-background/[0.06] text-primary">
          <ScrollText className="size-5" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-background md:text-3xl">
            Community rules
          </h1>
          <p className="mt-1 text-sm text-background/50">
            Please follow these guidelines when posting.
          </p>
        </div>
      </header>

      {rulesQuery.isPending ? (
        <StateNote>Loading rules…</StateNote>
      ) : rules.length === 0 ? (
        <StateNote>No rules have been published yet.</StateNote>
      ) : (
        <ol className="grid max-w-3xl gap-5">
          {rules.map((rule, index) => (
            <li key={rule.id} className="flex gap-4">
              <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-background/10 text-xs font-semibold tabular-nums text-background/70">
                {index + 1}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-background">{rule.title}</p>
                <p className="mt-1 text-sm leading-6 text-background/60">{rule.body}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
