import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowRight, MessagesSquare, Search } from 'lucide-react'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/ui'

interface FaqItem {
  question: string
  answer: string
}

interface FaqGroup {
  title: string
  items: Array<FaqItem>
}

const faqGroups: Array<FaqGroup> = [
  {
    title: 'Getting started',
    items: [
      {
        question: 'What is Vewave?',
        answer:
          'Vewave is a watch-together platform. You create a room around a video, share the room link, and everyone in it watches with playback kept in sync.',
      },
      {
        question: 'How do I create a room?',
        answer:
          'Sign in and press Get started, or open Create from the app. Give the room a name, paste a video link, and share the room link that Vewave generates. Creating a room requires an account; joining one only needs the link.',
      },
      {
        question: 'Which video links are supported?',
        answer:
          'YouTube, Vimeo, and TikTok links. Paste the regular watch URL — Vewave resolves it and validates the link before the room is created.',
      },
    ],
  },
  {
    title: 'Rooms & playback',
    items: [
      {
        question: 'Who controls playback in a shared room?',
        answer:
          'The host. Play, pause, seeking, and playback speed are synchronized from the host to everyone in the room. Volume stays personal — each viewer sets their own.',
      },
      {
        question: 'Is there a limit on room participants?',
        answer:
          'No enforced limit right now. Rooms are built for watch parties with friends and communities; if that changes, limits will be announced in the changelog.',
      },
    ],
  },
  {
    title: 'Studio & community',
    items: [
      {
        question: 'What is the Studio for?',
        answer:
          'The Studio is your channel workspace: manage your videos in the content manager, edit channel settings, and check analytics.',
      },
      {
        question: 'How do I join a community server?',
        answer:
          'Open Community in the app sidebar to browse public servers, then press Join server. Joined servers can be pinned to the sidebar for quick access.',
      },
      {
        question: 'How do I report a thread on the forum?',
        answer:
          'Open the thread and press Report next to its category badge. Pick a reason, optionally add details, and admins will review it.',
      },
    ],
  },
]

export function HelpPage() {
  const [query, setQuery] = useState('')

  const filteredGroups = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return faqGroups

    return faqGroups
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            item.question.toLowerCase().includes(term) || item.answer.toLowerCase().includes(term),
        ),
      }))
      .filter((group) => group.items.length > 0)
  }, [query])

  return (
    <div className="w-full px-6 py-16 md:px-10">
      <header className="mb-8 border-b border-background/10 pb-7">
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-primary">Support</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-background md:text-4xl">
          Help &amp; FAQ
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-background/50">
          Frequently asked questions about using Vewave rooms, the studio, and community servers.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div>
          <div className="relative mb-6">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-background/40" />
            <input
              type="search"
              aria-label="Search questions"
              placeholder="Search questions…"
              className="w-full rounded-lg border border-background/15 bg-background/[0.04] py-2.5 pl-9 pr-3 text-sm text-background outline-none placeholder:text-background/40 focus-visible:border-background/30"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          {filteredGroups.length === 0 ? (
            <p className="rounded-xl border border-dashed border-background/15 p-8 text-center text-sm text-background/50">
              No results for “{query}”. Try a different search.
            </p>
          ) : (
            <div className="grid gap-8">
              {filteredGroups.map((group) => (
                <section key={group.title}>
                  <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-background/40">
                    {group.title}
                  </h2>
                  <Accordion
                    type="single"
                    collapsible
                    className="divide-y divide-background/[0.08] overflow-hidden rounded-xl border border-background/10 bg-background/[0.03]"
                  >
                    {group.items.map((item) => (
                      <AccordionItem
                        key={item.question}
                        value={item.question}
                        className="border-0 px-4"
                      >
                        <AccordionTrigger className="text-background hover:text-primary [&>svg]:text-background/40">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-background/60">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </section>
              ))}
            </div>
          )}
        </div>

        <aside className="h-fit rounded-xl border border-background/10 bg-background/[0.03] p-5">
          <span className="grid size-10 place-items-center rounded-lg bg-primary/15 text-primary">
            <MessagesSquare className="size-5" />
          </span>
          <h2 className="mt-3 text-sm font-semibold text-background">Didn't find an answer?</h2>
          <p className="mt-1 text-sm leading-6 text-background/50">
            Ask in the Help &amp; Support category on the forum. Found a bug instead? Post it under
            Bugs &amp; Errors.
          </p>
          <Link
            to="/community/$category"
            params={{ category: 'help' }}
            className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Ask on the forum
            <ArrowRight className="size-4" />
          </Link>
          <Link
            to="/community/rules"
            className="mt-3 block text-xs text-background/40 underline-offset-2 transition-colors hover:text-background/70 hover:underline"
          >
            Read the community rules first
          </Link>
        </aside>
      </div>
    </div>
  )
}
