import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Flag, Plus } from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/shared/lib/utils'
import { useAuthStore } from '@/modules/auth/model'
import type { GetApiForumThreadsByThreadId200ThreadRepliesItem } from '@/core/api/generated/model'
import {
  getGetApiForumThreadsByThreadIdQueryKey,
  getGetApiForumThreadsQueryKey,
  useGetApiForumThreadsByThreadId,
  usePostApiForumThreadsByThreadIdReplies,
  usePostApiForumThreadsByThreadIdReport,
} from '@/core/api/generated/forum/forum'
import {
  AuthorAvatar,
  AuthorLink,
  CategoryBadge,
  categoryMeta,
  timeAgo,
} from './forum-shared'

export function ForumThreadPage({
  category,
  threadId,
}: {
  category: string
  threadId: string
}) {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const threadQuery = useGetApiForumThreadsByThreadId(threadId)
  const createReply = usePostApiForumThreadsByThreadIdReplies()
  const [body, setBody] = useState('')

  const thread = threadQuery.data?.thread

  async function submitReply() {
    if (!body.trim()) return

    try {
      await createReply.mutateAsync({ threadId, data: { body: body.trim() } })
      setBody('')
      await queryClient.invalidateQueries({
        queryKey: getGetApiForumThreadsByThreadIdQueryKey(threadId),
      })
      await queryClient.invalidateQueries({ queryKey: getGetApiForumThreadsQueryKey() })
    } catch {
      toast.error('Unable to post reply')
    }
  }

  const backCategory = thread?.category ?? category
  const backLabel = categoryMeta(backCategory).label

  return (
    <div className="w-full px-6 py-16 md:px-10">
      <Link
        to="/community/$category"
        params={{ category: backCategory }}
        className="inline-flex items-center gap-1.5 text-sm text-background/50 transition-colors hover:text-background"
      >
        <ArrowLeft className="size-4" />
        {backLabel}
      </Link>

      {threadQuery.isPending ? (
        <p className="mt-8 text-sm text-background/50">Loading discussion…</p>
      ) : threadQuery.isError || !thread ? (
        <p className="mt-8 text-sm text-background/50">Unable to load this thread.</p>
      ) : (
        <>
          <header className="mt-4 border-b border-background/10 pb-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CategoryBadge value={thread.category} />
              {user ? <ThreadReport threadId={threadId} /> : null}
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-background md:text-3xl">
              {thread.title}
            </h1>
            <div className="mt-3 flex items-center gap-2.5">
              <AuthorAvatar author={thread.author} className="size-7" />
              <p className="text-xs text-background/50">
                <AuthorLink author={thread.author} /> · {timeAgo(thread.createdAt)}
              </p>
            </div>
          </header>

          <p className="mt-6 whitespace-pre-wrap text-sm leading-6 text-background/85">
            {thread.body}
          </p>

          <section className="mt-10">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.16em] text-background/50">
              Replies ({thread.replyCount})
            </p>
            {thread.replies.length === 0 ? (
              <p className="rounded-lg border border-dashed border-background/15 p-4 text-center text-sm text-background/50">
                No replies yet. Be the first to respond.
              </p>
            ) : (
              <ul className="grid gap-5">
                {thread.replies.map((reply) => (
                  <ReplyItem key={reply.id} reply={reply} />
                ))}
              </ul>
            )}
          </section>

          <section className="mt-10 border-t border-background/10 pt-6">
            {user ? (
              <div className="grid gap-3">
                <label htmlFor="forum-reply" className="text-sm font-medium text-background">
                  Write a reply
                </label>
                <textarea
                  id="forum-reply"
                  rows={4}
                  placeholder="Share your thoughts…"
                  className="rounded-lg border border-background/15 bg-background/[0.04] px-3 py-2 text-sm text-background outline-none placeholder:text-background/40 focus-visible:border-background/30"
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={submitReply}
                    disabled={!body.trim() || createReply.isPending}
                    className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    <Plus className="size-3.5" />
                    {createReply.isPending ? 'Posting…' : 'Reply'}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-background/50">
                <Link
                  to="/sign-in"
                  search={{ redirectTo: '/community' }}
                  className="font-medium text-primary hover:underline"
                >
                  Sign in
                </Link>{' '}
                to join the discussion.
              </p>
            )}
          </section>
        </>
      )}
    </div>
  )
}

type ReportReason = 'spam' | 'harassment' | 'off_topic' | 'other'

const REPORT_REASONS: Array<{ value: ReportReason; label: string }> = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'off_topic', label: 'Off-topic' },
  { value: 'other', label: 'Other' },
]

function ThreadReport({ threadId }: { threadId: string }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState<ReportReason>('spam')
  const [details, setDetails] = useState('')
  const reportMutation = usePostApiForumThreadsByThreadIdReport()

  async function submit() {
    try {
      await reportMutation.mutateAsync({
        threadId,
        data: { reason, details: details.trim() || undefined },
      })
      toast.success('Report submitted. Admins will review it.')
      setOpen(false)
      setDetails('')
    } catch {
      toast.error('Unable to submit report')
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-background/50 transition-colors hover:text-background"
      >
        <Flag className="size-3.5" />
        Report
      </button>
    )
  }

  return (
    <div className="w-full rounded-lg border border-background/15 bg-background/[0.04] p-3">
      <p className="text-xs font-medium text-background">Report this thread</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {REPORT_REASONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setReason(option.value)}
            className={cn(
              'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
              reason === option.value
                ? 'border-background/30 bg-background/10 text-background'
                : 'border-background/10 text-background/50 hover:text-background/80',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
      <textarea
        rows={2}
        placeholder="Add details (optional)…"
        maxLength={500}
        className="mt-2 w-full rounded-lg border border-background/15 bg-background/[0.04] px-3 py-2 text-xs text-background outline-none placeholder:text-background/40 focus-visible:border-background/30"
        value={details}
        onChange={(event) => setDetails(event.target.value)}
      />
      <div className="mt-2 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md px-2.5 py-1 text-xs font-medium text-background/60 transition-colors hover:text-background"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={reportMutation.isPending}
          className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {reportMutation.isPending ? 'Submitting…' : 'Submit report'}
        </button>
      </div>
    </div>
  )
}

function ReplyItem({
  reply,
}: {
  reply: GetApiForumThreadsByThreadId200ThreadRepliesItem
}) {
  return (
    <li className="flex items-start gap-3">
      <AuthorAvatar author={reply.author} className="size-8" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-background/50">
          <AuthorLink author={reply.author} /> · {timeAgo(reply.createdAt)}
        </p>
        <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-background/85">{reply.body}</p>
      </div>
    </li>
  )
}
