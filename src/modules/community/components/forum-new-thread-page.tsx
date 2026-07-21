import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

import { CATEGORIES, CATEGORY_META, isForumCategory, type ForumCategory } from './forum-shared'
import { cn } from '@/shared/lib/utils'
import {
  getGetApiForumThreadsQueryKey,
  usePostApiForumThreads,
} from '@/core/api/generated/forum/forum'

export function ForumNewThreadPage({ initialCategory }: { initialCategory?: string }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const createThread = usePostApiForumThreads()

  const [category, setCategory] = useState<ForumCategory>(
    initialCategory && isForumCategory(initialCategory) ? initialCategory : 'general',
  )
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  const canSubmit = title.trim().length > 0 && body.trim().length > 0

  async function submit() {
    if (!canSubmit) return

    try {
      const response = await createThread.mutateAsync({
        data: { category, title: title.trim(), body: body.trim() },
      })
      await queryClient.invalidateQueries({ queryKey: getGetApiForumThreadsQueryKey() })
      toast.success('Thread posted')
      await navigate({
        to: '/community/$category/$threadId',
        params: { category: response.thread.category, threadId: response.thread.id },
      })
    } catch {
      toast.error('Unable to post thread')
    }
  }

  return (
    <div className="w-full px-6 py-16 md:px-10">
      <Link
        to="/community"
        className="inline-flex items-center gap-1.5 text-sm text-background/50 transition-colors hover:text-background"
      >
        <ArrowLeft className="size-4" />
        Community
      </Link>

      <h1 className="mt-4 mb-6 text-2xl font-semibold tracking-tight text-background md:text-3xl">
        New thread
      </h1>

      <div className="grid gap-5">
        <div className="grid gap-2">
          <span className="text-sm font-medium text-background">Category</span>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((option) => {
              const active = category === option.value

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setCategory(option.value)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                    active
                      ? 'border-background/30 bg-background/10 text-background'
                      : 'border-background/10 text-background/50 hover:text-background/80',
                  )}
                >
                  <span className={cn('size-1.5 rounded-full', CATEGORY_META[option.value].dot)} />
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid gap-2">
          <label htmlFor="thread-title" className="text-sm font-medium text-background">
            Title
          </label>
          <input
            id="thread-title"
            placeholder="A short, descriptive title"
            maxLength={180}
            className="w-full rounded-lg border border-background/15 bg-background/[0.04] px-3 py-2 text-sm font-medium text-background outline-none placeholder:text-background/40 focus-visible:border-background/30"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="thread-body" className="text-sm font-medium text-background">
            Body
          </label>
          <textarea
            id="thread-body"
            rows={8}
            placeholder="Describe your question, feedback, or report…"
            className="w-full rounded-lg border border-background/15 bg-background/[0.04] px-3 py-2 text-sm text-background outline-none placeholder:text-background/40 focus-visible:border-background/30"
            value={body}
            onChange={(event) => setBody(event.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-2">
          <Link
            to="/community"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-background/60 transition-colors hover:text-background"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit || createThread.isPending}
            className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {createThread.isPending ? 'Posting…' : 'Post thread'}
          </button>
        </div>
      </div>
    </div>
  )
}
