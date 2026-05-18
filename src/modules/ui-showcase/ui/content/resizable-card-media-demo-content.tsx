import type { ResizableCardItem } from '@/components/resizable-card'
import type { ContentDensity } from '../../types/types'

interface MediaDemoContentProps {
  item: ResizableCardItem
  density: ContentDensity
}

export function MediaDemoContent({ item, density }: MediaDemoContentProps) {
  const rows = density === 'compact' ? 2 : density === 'comfortable' ? 4 : 6

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-background p-4">
        <div className="text-sm leading-7 text-muted-foreground">
          {typeof item.content === 'function' ? item.content() : item.content}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="rounded-lg border border-border bg-background p-4">
            <div className="h-2 w-20 rounded-full bg-muted-foreground/30" />
            <div className="mt-4 h-24 rounded-lg bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}
