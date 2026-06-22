import { Link, Outlet, useLocation } from '@tanstack/react-router'
import { SearchProvider } from 'fumadocs-ui/contexts/search'
import gsap from 'gsap'
import { Code2, Layers3 } from 'lucide-react'
import { useLayoutEffect, useRef } from 'react'

import { docsNavItems } from '../content/docs-content'
import { sharedUiCategories, sharedUiDocNavItems } from '../content/shared-ui-docs-nav'
import { DocsSearchButton, DocsSearchDialog } from './docs-search'
import type { ComponentType, ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'
import { VewaveLogoMark } from '@/shared/theme'

const primaryDocsNav = docsNavItems.slice(0, 3)
const componentDocsNav = docsNavItems.slice(3)

export function DocsShell() {
  const rootRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const activePathname = stripTrailingSlash(location.pathname)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.docs-gsap-reveal',
        { autoAlpha: 0, y: 14 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.58,
          ease: 'power3.out',
          stagger: 0.055,
        },
      )

      gsap.fromTo(
        '.docs-gsap-rule',
        { scaleX: 0, transformOrigin: 'left center' },
        { scaleX: 1, duration: 0.72, ease: 'power2.out' },
      )
    }, rootRef)

    return () => ctx.revert()
  }, [location.pathname])

  return (
    <SearchProvider SearchDialog={DocsSearchDialog} preload>
      <div
        ref={rootRef}
        className="grid w-full gap-6 text-foreground lg:grid-cols-[18rem_minmax(0,1fr)]"
      >
        <aside className="docs-gsap-reveal max-h-[20rem] overflow-y-auto lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)] lg:max-h-none lg:overflow-visible">
          <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <div className="space-y-3 border-b border-border p-4">
              <Link to="/admin/docs" className="flex items-center gap-3">
                <VewaveLogoMark className="size-10 rounded-lg" surfaceToken="card" />
                <span>
                  <span className="block text-sm font-semibold">Vewave Docs</span>
                  <span className="block text-xs text-muted-foreground">Admin knowledge base</span>
                </span>
              </Link>
              <DocsSearchButton />
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Docs table of contents">
              <DocsTocSection title="Start">
                {primaryDocsNav.map((item) => {
                  const isActive = isTocLinkActive(activePathname, item.to, item.exact)

                  return (
                    <DocsTocLink
                      key={item.to}
                      active={isActive}
                      description={item.description}
                      icon={item.icon}
                      title={item.title}
                      to={item.to}
                    />
                  )
                })}
              </DocsTocSection>

              <DocsTocSection title="Reusable components">
                {componentDocsNav.map((item) => {
                  const isActive = isTocLinkActive(activePathname, item.to, item.exact)

                  return (
                    <DocsTocLink
                      key={item.to}
                      active={isActive}
                      description={item.description}
                      icon={item.icon}
                      title={item.title}
                      to={item.to}
                    />
                  )
                })}
              </DocsTocSection>

              <DocsTocSection title="Shared UI primitives">
                <Link
                  to="/admin/docs/ui/components/shared"
                  className={cn(
                    'mb-3 flex items-center gap-2 rounded-md px-2.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
                    isTocLinkActive(activePathname, '/admin/docs/ui/components/shared', true) &&
                      'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                  )}
                >
                  <Layers3 className="size-3.5" />
                  Catalog overview
                </Link>

                <div className="space-y-4">
                  {sharedUiCategories.map((category) => {
                    const docs = sharedUiDocNavItems.filter((doc) => doc.category === category.id)

                    return (
                      <div key={category.id} className="space-y-1.5">
                        <div className="px-2.5 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                          {category.title}
                        </div>
                        <div className="space-y-0.5">
                          {docs.map((doc) => {
                            const isActive = isTocLinkActive(activePathname, doc.to, true)

                            return (
                              <Link
                                key={doc.to}
                                to={doc.to}
                                className={cn(
                                  'group relative flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-[background-color,color] hover:bg-accent hover:text-accent-foreground',
                                  isActive &&
                                    'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                                )}
                                aria-current={isActive ? 'page' : undefined}
                              >
                                <span
                                  className={cn(
                                    'size-1.5 rounded-full bg-border transition-colors group-hover:bg-primary',
                                    isActive && 'bg-primary-foreground',
                                  )}
                                />
                                <span className="truncate">{doc.title}</span>
                              </Link>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </DocsTocSection>
            </nav>

            <div className="hidden border-t border-border p-4 lg:block">
              <div className="rounded-lg border border-border bg-muted p-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  <Code2 className="size-3.5 text-primary" />
                  API-first docs
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Each primitive now has a dedicated route, live example, usage snippet, and prop
                  table.
                </p>
              </div>
            </div>
          </div>
        </aside>

        <main className="docs-gsap-reveal min-w-0">
          <div className="docs-gsap-rule mb-5 h-px w-full bg-border" />
          <Outlet />
        </main>
      </div>
    </SearchProvider>
  )
}

type TocLinkProps = {
  active: boolean
  description: string
  icon: ComponentType<{ className?: string }>
  title: string
  to: (typeof docsNavItems)[number]['to']
}

function DocsTocSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="mb-5">
      <h2 className="mb-2 px-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        {title}
      </h2>
      <div className="space-y-1">{children}</div>
    </section>
  )
}

function DocsTocLink({ active, description, icon: Icon, title, to }: TocLinkProps) {
  return (
    <Link
      to={to}
      className={cn(
        'group relative flex gap-2.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground transition-[background-color,color] hover:bg-accent hover:text-accent-foreground',
        active &&
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
      )}
      aria-current={active ? 'page' : undefined}
    >
      <span
        className={cn(
          'absolute inset-y-2 left-0 w-0.5 rounded-full bg-transparent transition-colors',
          active && 'bg-primary-foreground',
        )}
      />
      <Icon
        className={cn(
          'mt-0.5 size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary',
          active && 'text-primary-foreground',
        )}
      />
      <span className="min-w-0">
        <span className="block truncate font-medium">{title}</span>
        <span
          className={cn(
            'mt-0.5 line-clamp-2 block text-xs leading-5 text-muted-foreground',
            active && 'text-primary-foreground/80',
          )}
        >
          {description}
        </span>
      </span>
    </Link>
  )
}

function isTocLinkActive(pathname: string, to: string, exact = false) {
  const normalizedTo = stripTrailingSlash(to)

  if (exact) {
    return pathname === normalizedTo
  }

  return pathname === normalizedTo || pathname.startsWith(`${normalizedTo}/`)
}

function stripTrailingSlash(value: string) {
  return value === '/' ? value : value.replace(/\/$/, '')
}
