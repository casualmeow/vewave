import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { formatDistanceToNow } from 'date-fns'

import { cn } from '@/shared/lib/utils'
import type { GetApiForumThreadsByThreadId200ThreadAuthor } from '@/core/api/generated/model'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui'

export type ForumAuthor = GetApiForumThreadsByThreadId200ThreadAuthor
export type ForumCategory = 'general' | 'bugs' | 'features' | 'help' | 'announcements'

export const CATEGORIES: Array<{
  value: ForumCategory
  label: string
  description: string
}> = [
  { value: 'general', label: 'General', description: 'Open discussion and introductions.' },
  { value: 'bugs', label: 'Bugs & Errors', description: 'Report problems and unexpected behavior.' },
  {
    value: 'features',
    label: 'Feature Requests',
    description: 'Suggest and vote on new ideas.',
  },
  { value: 'help', label: 'Help & Support', description: 'Ask questions and get unstuck.' },
  {
    value: 'announcements',
    label: 'Announcements',
    description: 'Official updates from the Vewave team.',
  },
]

export const CATEGORY_META: Record<
  ForumCategory,
  { label: string; badge: string; dot: string; folder: string }
> = {
  general: {
    label: 'General',
    badge: 'bg-background/10 text-background/70 ring-background/20',
    dot: 'bg-background/40',
    folder: 'text-background/60',
  },
  bugs: {
    label: 'Bugs & Errors',
    badge: 'bg-rose-400/10 text-rose-300 ring-rose-400/25',
    dot: 'bg-rose-400',
    folder: 'text-rose-300',
  },
  features: {
    label: 'Feature Requests',
    badge: 'bg-violet-400/10 text-violet-300 ring-violet-400/25',
    dot: 'bg-violet-400',
    folder: 'text-violet-300',
  },
  help: {
    label: 'Help & Support',
    badge: 'bg-amber-400/10 text-amber-300 ring-amber-400/25',
    dot: 'bg-amber-400',
    folder: 'text-amber-300',
  },
  announcements: {
    label: 'Announcements',
    badge: 'bg-sky-400/10 text-sky-300 ring-sky-400/25',
    dot: 'bg-sky-400',
    folder: 'text-sky-300',
  },
}

export function isForumCategory(value: string): value is ForumCategory {
  return value in CATEGORY_META
}

export function categoryMeta(value: string) {
  return CATEGORY_META[value as ForumCategory] ?? CATEGORY_META.general
}

export function CategoryBadge({ value, className }: { value: string; className?: string }) {
  const meta = categoryMeta(value)

  return (
    <span
      className={cn(
        'inline-flex w-fit items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset',
        meta.badge,
        className,
      )}
    >
      <span className={cn('size-1.5 rounded-full', meta.dot)} />
      {meta.label}
    </span>
  )
}

/**
 * Renders the author's display name, linking to their profile route when a
 * username is available. Deleted/anonymous authors render as plain text.
 */
export function AuthorLink({ author, className }: { author: ForumAuthor; className?: string }) {
  const label = authorName(author)

  if (author?.username) {
    return (
      <Link
        to="/profile/$username"
        params={{ username: author.username }}
        className={cn('transition-colors hover:text-background hover:underline', className)}
        onClick={(event) => event.stopPropagation()}
      >
        {label}
      </Link>
    )
  }

  return <span className={className}>{label}</span>
}

export function AuthorAvatar({ author, className }: { author: ForumAuthor; className?: string }) {
  return (
    <Avatar className={cn('shrink-0 border border-background/10', className)}>
      {author?.avatarUrl ? <AvatarImage src={author.avatarUrl} alt={author.name} /> : null}
      <AvatarFallback className="bg-background/10 text-xs font-medium text-background/70">
        {authorInitials(author)}
      </AvatarFallback>
    </Avatar>
  )
}

export function StateNote({ children }: { children: ReactNode }) {
  return <p className="py-6 text-center text-sm text-background/50">{children}</p>
}

export function authorName(author: ForumAuthor) {
  if (!author) return 'Deleted user'

  return author.username ? `@${author.username}` : author.name
}

export function authorInitials(author: ForumAuthor) {
  const source = author?.name ?? '?'

  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export function timeAgo(iso: string) {
  return formatDistanceToNow(new Date(iso), { addSuffix: true })
}
