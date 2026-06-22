import type { ComponentPropsWithoutRef } from 'react'

import { cn } from '@/shared/lib/utils'

type DocsPageProps = ComponentPropsWithoutRef<'article'>
type DocsTitleProps = ComponentPropsWithoutRef<'h1'>
type DocsDescriptionProps = ComponentPropsWithoutRef<'p'>
type DocsBodyProps = ComponentPropsWithoutRef<'div'>

export function DocsPage({ children, className, ...props }: DocsPageProps) {
  return (
    <article
      className={cn(
        'w-full rounded-lg border border-border bg-card px-5 py-6 text-card-foreground shadow-[0_18px_60px_color-mix(in_srgb,var(--foreground)_8%,transparent)] sm:px-8',
        className,
      )}
      {...props}
    >
      {children}
    </article>
  )
}

export function DocsTitle({ children, className, ...props }: DocsTitleProps) {
  return (
    <h1
      className={cn('text-4xl font-semibold tracking-tight text-foreground sm:text-6xl', className)}
      {...props}
    >
      {children}
    </h1>
  )
}

export function DocsDescription({ children, className, ...props }: DocsDescriptionProps) {
  return (
    <p
      className={cn('mt-3 max-w-3xl text-lg leading-8 text-muted-foreground', className)}
      {...props}
    >
      {children}
    </p>
  )
}

export function DocsBody({ children, className, ...props }: DocsBodyProps) {
  return (
    <div className={cn('mt-8 max-w-none', className)} {...props}>
      {children}
    </div>
  )
}
