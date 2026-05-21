import { Link, Outlet, useLocation } from '@tanstack/react-router'
import gsap from 'gsap'
import { ArrowRight, BookMarked, ExternalLink, Waves } from 'lucide-react'
import { useLayoutEffect, useRef } from 'react'

import { docsNavItems } from '../content/docs-content'
import { Button } from '@/shared/ui'

export function DocsShell() {
  const rootRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

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
    <div
      ref={rootRef}
      className="min-h-screen bg-[#f6f8f5] text-zinc-950 [background-image:linear-gradient(rgba(15,23,42,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.055)_1px,transparent_1px)] [background-size:32px_32px]"
    >
      <div className="mx-auto grid w-full max-w-[94rem] gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[18rem_minmax(0,1fr)] lg:px-8">
        <aside className="docs-gsap-reveal lg:sticky lg:top-5 lg:h-[calc(100vh-2.5rem)]">
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

            <nav className="flex-1 space-y-2 overflow-y-auto p-3" aria-label="Docs navigation">
              {docsNavItems.map((item) => {
                const Icon = item.icon

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    activeOptions={{ exact: item.exact }}
                    className="group flex gap-3 rounded-md border border-transparent px-3 py-3 text-sm text-zinc-600 transition-[background-color,border-color,color] hover:border-zinc-200 hover:bg-zinc-50 hover:text-zinc-950"
                    activeProps={{
                      className:
                        'border-teal-900/10 bg-teal-50 text-teal-950 shadow-[inset_3px_0_0_rgba(15,118,110,0.85)]',
                    }}
                  >
                    <Icon className="mt-0.5 size-4 shrink-0 text-teal-700" />
                    <span>
                      <span className="block font-medium">{item.title}</span>
                      <span className="mt-1 block text-xs leading-5 text-zinc-500">
                        {item.description}
                      </span>
                    </span>
                  </Link>
                )
              })}
            </nav>

            <div className="border-t border-zinc-200 p-4">
              <div className="rounded-lg bg-zinc-950 p-4 text-white">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <BookMarked className="size-4 text-amber-300" />
                  UI catalog
                </div>
                <p className="mt-2 text-xs leading-5 text-zinc-300">
                  Live examples remain in the showcase route so docs stay focused and readable.
                </p>
                <Button
                  asChild
                  size="sm"
                  variant="secondary"
                  className="mt-4 w-full justify-between"
                >
                  <Link to="/ui/showcase">
                    Open showcase
                    <ExternalLink className="size-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </aside>

        <main className="docs-gsap-reveal min-w-0">
          <div className="docs-gsap-rule mb-5 h-px w-full bg-zinc-950/15" />
          <Outlet />
          <div className="mt-10 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600 shadow-sm">
            <span>Need a live component state?</span>
            <Button asChild variant="outline" size="sm">
              <Link to="/ui/showcase">
                Open UI showcase
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </main>
      </div>
    </div>
  )
}
