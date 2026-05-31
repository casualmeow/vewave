import { Link, Outlet, useLocation } from '@tanstack/react-router'
import { SearchProvider } from 'fumadocs-ui/contexts/search'
import gsap from 'gsap'
import { Code2, Layers3, Waves } from 'lucide-react'
import { useLayoutEffect, useRef } from 'react'

import { docsNavItems } from '../content/docs-content'
import { sharedUiCategories, sharedUiDocNavItems } from '../content/shared-ui-docs-nav'
import { DocsSearchButton, DocsSearchDialog } from './docs-search'
import type { ComponentType, ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

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
        className="min-h-screen bg-[#f6f8f5] text-zinc-950 [background-image:linear-gradient(rgba(15,23,42,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.055)_1px,transparent_1px)] [background-size:32px_32px]"
      >
        <DocsTopHeader />

        <div className="mx-auto grid w-full max-w-[94rem] gap-6 px-4 pb-5 pt-4 sm:px-6 lg:grid-cols-[18rem_minmax(0,1fr)] lg:px-8">
          <aside className="docs-gsap-reveal lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)]">
            <div className="flex h-full flex-col overflow-hidden rounded-lg border border-zinc-200/90 bg-white/92 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur">
              <div className="border-b border-zinc-200 p-4">
                <Link to="/" className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-lg bg-zinc-950 text-white shadow-sm">
                    <Waves className="size-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">Vewave Docs</span>
                    <span className="block text-xs text-zinc-500">Fumadocs-style guide</span>
                  </span>
                </Link>
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
                    to="/docs/ui/components/shared"
                    className={cn(
                      'mb-3 flex items-center gap-2 rounded-md px-2.5 py-2 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900',
                      isTocLinkActive(activePathname, '/docs/ui/components/shared', true) &&
                        'bg-teal-50 text-teal-900',
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
                          <div className="px-2.5 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-zinc-400">
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
                                    'group relative flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium text-zinc-500 transition-[background-color,color] hover:bg-zinc-50 hover:text-zinc-950',
                                    isActive &&
                                      'bg-zinc-950 text-white hover:bg-zinc-950 hover:text-white',
                                  )}
                                  aria-current={isActive ? 'page' : undefined}
                                >
                                  <span
                                    className={cn(
                                      'size-1.5 rounded-full bg-zinc-300 transition-colors group-hover:bg-teal-600',
                                      isActive && 'bg-teal-300',
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

              <div className="border-t border-zinc-200 p-4">
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                    <Code2 className="size-3.5 text-teal-700" />
                    API-first docs
                  </div>
                  <p className="mt-2 text-xs leading-5 text-zinc-500">
                    Each primitive now has a dedicated route, live example, usage snippet, and prop
                    table.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <main className="docs-gsap-reveal min-w-0">
            <div className="docs-gsap-rule mb-5 h-px w-full bg-zinc-950/15" />
            <Outlet />
          </main>
        </div>
      </div>
    </SearchProvider>
  )
}

function DocsTopHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-[#f6f8f5]/82 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[94rem] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          to="/docs"
          className="group inline-flex min-w-0 items-center gap-3 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-teal-600/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f8f5]"
        >
          <span className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-2xl border border-zinc-950/10 bg-zinc-950 text-white shadow-[0_14px_34px_rgba(15,23,42,0.18)]">
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(circle_at_28%_12%,rgba(94,234,212,0.58),transparent_42%)] opacity-90"
            />
            <span className="relative text-xs font-black tracking-[-0.08em]">VW</span>
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold tracking-tight text-zinc-950">
              Vewave Docs
            </span>
            <span className="block truncate text-xs text-zinc-500">
              Components, primitives, architecture
            </span>
          </span>
        </Link>

        <DocsSearchButton />
      </div>
    </header>
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
      <h2 className="mb-2 px-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-zinc-400">
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
        'group relative flex gap-2.5 rounded-md px-2.5 py-2 text-sm text-zinc-600 transition-[background-color,color] hover:bg-zinc-50 hover:text-zinc-950',
        active && 'bg-teal-50 text-teal-950',
      )}
      aria-current={active ? 'page' : undefined}
    >
      <span
        className={cn(
          'absolute inset-y-2 left-0 w-0.5 rounded-full bg-transparent transition-colors',
          active && 'bg-teal-700',
        )}
      />
      <Icon
        className={cn(
          'mt-0.5 size-4 shrink-0 text-zinc-400 transition-colors group-hover:text-teal-700',
          active && 'text-teal-700',
        )}
      />
      <span className="min-w-0">
        <span className="block truncate font-medium">{title}</span>
        <span className="mt-0.5 line-clamp-2 block text-xs leading-5 text-zinc-500">
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
