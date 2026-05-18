import { Grip } from 'lucide-react'

import type { ResizableCardItem } from '@/components/resizable-card'
import type { ContentDensity } from '../../types'

interface InlineDemoContentProps {
  item: ResizableCardItem
  density: ContentDensity
}

export function InlineDemoContent({ item, density }: InlineDemoContentProps) {
  const rows = density === 'compact' ? 4 : density === 'comfortable' ? 7 : 11

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-background p-4">
        <div className="flex items-center gap-2 font-medium text-foreground">
          <Grip className="size-4" />
          {item.title}
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          This content is rendered through `renderContent`, while media and actions are also
          customizable render slots.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="rounded-lg border border-border bg-background p-4">
            <div className="h-2 w-24 rounded-full bg-muted-foreground/30" />
            <div className="mt-4 space-y-2">
              <div className="h-2 rounded-full bg-muted" />
              <div className="h-2 w-2/3 rounded-full bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
