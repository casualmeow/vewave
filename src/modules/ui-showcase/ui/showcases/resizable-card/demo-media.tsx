import { Maximize2, PanelTopOpen } from 'lucide-react'

import { demoMediaVariants } from '../../../config'

interface DemoMediaProps {
  id: string
  expanded: boolean
}

type DemoMediaTone = 'preview' | 'content' | 'interaction'

function getDemoMediaTone(id: string): DemoMediaTone {
  if (id === 'preview-shell') {
    return 'preview'
  }

  if (id === 'content-card') {
    return 'content'
  }

  return 'interaction'
}

export function DemoMedia({ id, expanded }: DemoMediaProps) {
  return (
    <div
      className={demoMediaVariants({
        size: expanded ? 'expanded' : 'compact',
        tone: getDemoMediaTone(id),
      })}
    >
      {expanded ? <Maximize2 className="size-8" /> : <PanelTopOpen className="size-6" />}
    </div>
  )
}
