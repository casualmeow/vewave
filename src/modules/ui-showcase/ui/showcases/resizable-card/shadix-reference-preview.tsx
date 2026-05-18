import { mediaCardItems } from '../../../constants'
import type { ReactNode } from 'react'
import type { ResizableCardItem } from '@/components/resizable-card'
import {
  ResizableCard,
  ResizableCardBody,
  ResizableCardContent,
  ResizableCardDescription,
  ResizableCardExpandContainer,
  ResizableCardImage,
  ResizableCardTitle,
} from '@/components/resizable-card'

const shadixTransition = {
  type: 'spring',
  stiffness: 260,
  damping: 30,
  mass: 0.86,
} as const

export function ShadixReferencePreview() {
  return (
    <div className="mt-5 rounded-lg border border-zinc-200 bg-white p-5">
      <div className="mb-5 max-w-2xl">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Shadix-style compound API
        </h4>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          These cards use the new compound exports from `@/components/resizable-card`. The compact
          body and expanded container share the same surface identity, while image, title, and
          description preserve continuity.
        </p>
      </div>

      <ul className="grid w-full gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {mediaCardItems.slice(0, 3).map((item) => (
          <li key={item.id}>
            <ResizableCard transition={shadixTransition}>
              <ResizableCardBody className="h-full w-full rounded-2xl pb-4">
                <div className="h-56 overflow-hidden rounded-t-2xl bg-zinc-100">
                  <ResizableCardImage src={item.src} alt={item.imageAlt ?? ''} />
                </div>
                <ResizableCardTitle>{item.title}</ResizableCardTitle>
                <ResizableCardDescription>{item.description}</ResizableCardDescription>
              </ResizableCardBody>

              <ResizableCardExpandContainer className="w-[min(92vw,34rem)] rounded-3xl pb-0">
                <div className="h-72 overflow-hidden bg-zinc-100">
                  <ResizableCardImage src={item.src} alt={item.imageAlt ?? ''} />
                </div>
                <div className="flex items-start justify-between gap-4 pr-12">
                  <div className="min-w-0">
                    <ResizableCardTitle className="pt-4 text-xl">{item.title}</ResizableCardTitle>
                    <ResizableCardDescription>{item.description}</ResizableCardDescription>
                  </div>
                  {item.ctaText ? (
                    <a
                      href={item.ctaLink}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 shrink-0 rounded-full bg-emerald-500 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-emerald-600"
                    >
                      {item.ctaText}
                    </a>
                  ) : null}
                </div>
                <ResizableCardContent className="max-h-56 px-4 pb-6 pt-4">
                  {resolveContent(item)}
                </ResizableCardContent>
              </ResizableCardExpandContainer>
            </ResizableCard>
          </li>
        ))}
      </ul>
    </div>
  )
}

function resolveContent(item: ResizableCardItem): ReactNode {
  return typeof item.content === 'function' ? item.content() : item.content
}
