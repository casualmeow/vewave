import { PanelTop, Box, Sparkles } from 'lucide-react'
import type { ExpandableCardItem } from '@/components/resizable-card'

export const catalogItems = [
  {
    href: '#header',
    label: 'Header',
    description: 'Live header playground with scroll-linked behavior.',
    icon: PanelTop,
    tone: 'from-teal-300 to-sky-400',
  },
  {
    href: '#resizable-card',
    label: 'ResizableCard',
    description: 'Inline, standard, and media presentations with shared-layout morphs.',
    icon: Box,
    tone: 'from-violet-300 to-fuchsia-400',
  },
  {
    href: '#resizable-card',
    label: 'Media rail',
    description: 'Aceternity-style card data using image, CTA, and content props.',
    icon: Sparkles,
    tone: 'from-lime-300 to-emerald-400',
  },
]

export const inlineCardItems: Array<ExpandableCardItem> = [
  {
    id: 'preview-shell',
    title: 'Responsive preview shell',
    description: 'Use the expanded dialog and resize handle to inspect component states.',
    ctaText: 'Inspect',
  },
  {
    id: 'content-card',
    title: 'Content-rich card',
    description: 'A card with enough detail to show shared-layout animation and overflow behavior.',
    ctaText: 'Open',
  },
  {
    id: 'documentation-card',
    title: 'Documentation card',
    description: 'A compact entry that expands into prop and interaction notes.',
    ctaText: 'Read',
  },
]
