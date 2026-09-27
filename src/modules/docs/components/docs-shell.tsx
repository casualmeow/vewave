import { Link, Outlet, useLocation } from '@tanstack/react-router'
import { SearchProvider } from 'fumadocs-ui/contexts/search'
import { useState } from 'react'
import { docsNavItems } from '../content/docs-content'
import { handbookGroups, handbookHref, handbookManifest } from '../content/handbook-manifest'
import { sharedUiCategories, sharedUiDocNavItems } from '../content/shared-ui-docs-nav'
import { DocsSearchButton, DocsSearchDialog } from './docs-search'
import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

export function DocsShell() {
  const pathname = useLocation({ select: (location) => location.pathname.replace(/\/$/, '') })
  const [navigationOpen, setNavigationOpen] = useState(false)
  const referenceLinks = docsNavItems.filter((item) => item.to !== '/admin/docs')
  const linkClass = (href: string) =>
    cn(
      'block rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring',
      pathname === href && 'bg-accent font-medium text-foreground',
    )

  return (
    <SearchProvider SearchDialog={DocsSearchDialog} preload>
      <div className="grid w-full min-w-0 gap-8 text-foreground lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
        <aside className="min-w-0 lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto">
          <div className="mb-5 flex items-center justify-between gap-3 lg:block">
            <Link to="/admin/docs" className="block text-base font-semibold tracking-tight">
              Vewave <span className="font-normal text-muted-foreground">/ Docs</span>
            </Link>
            <div className="lg:mt-4">
              <DocsSearchButton />
            </div>
          </div>
          <button
            type="button"
            aria-expanded={navigationOpen}
            aria-controls="docs-navigation"
            className="mb-4 flex w-full justify-between rounded-md border border-border px-3 py-2 text-sm lg:hidden"
            onClick={() => setNavigationOpen((open) => !open)}
          >
            Browse documentation <span aria-hidden>{navigationOpen ? '?' : '+'}</span>
          </button>
          <nav
            id="docs-navigation"
            aria-label="Documentation"
            className={cn('space-y-7 pb-6', navigationOpen ? 'block' : 'hidden lg:block')}
          >
            {handbookGroups.map((group) => (
              <NavigationGroup key={group} title={group}>
                {handbookManifest
                  .filter((entry) => entry.group === group)
                  .sort((a, b) => a.order - b.order)
                  .map((entry) => (
                    <Link
                      key={entry.slug}
                      to={handbookHref(entry.slug)}
                      onClick={() => setNavigationOpen(false)}
                      className={linkClass(handbookHref(entry.slug))}
                      aria-current={pathname === handbookHref(entry.slug) ? 'page' : undefined}
                    >
                      {entry.title}
                    </Link>
                  ))}
              </NavigationGroup>
            ))}
            <NavigationGroup title="Component reference">
              {referenceLinks.map((entry) => (
                <Link
                  key={entry.to}
                  to={entry.to}
                  onClick={() => setNavigationOpen(false)}
                  className={linkClass(entry.to)}
                  aria-current={pathname === entry.to ? 'page' : undefined}
                >
                  {entry.title}
                </Link>
              ))}
            </NavigationGroup>
            <NavigationGroup title="Shared UI primitives">
              {sharedUiCategories.map((category) => (
                <details
                  key={category.id}
                  open={
                    sharedUiDocNavItems.some(
                      (item) => item.category === category.id && item.to === pathname,
                    )
                      ? true
                      : undefined
                  }
                  className="mb-2"
                >
                  <summary className="cursor-pointer rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground">
                    {category.title}
                  </summary>
                  <div className="ml-3 border-l border-border pl-2">
                    {sharedUiDocNavItems
                      .filter((item) => item.category === category.id)
                      .map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setNavigationOpen(false)}
                          className={linkClass(item.to)}
                          aria-current={pathname === item.to ? 'page' : undefined}
                        >
                          {item.title}
                        </Link>
                      ))}
                  </div>
                </details>
              ))}
            </NavigationGroup>
          </nav>
        </aside>
        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </SearchProvider>
  )
}

function NavigationGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 px-3 text-xs font-medium text-muted-foreground">{title}</h2>
      <div className="space-y-0.5">{children}</div>
    </section>
  )
}
