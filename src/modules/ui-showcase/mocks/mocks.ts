import { Box, PanelLeft, PanelTop, Sparkles } from 'lucide-react'
import type { ResizableCardItem } from '@/components/resizable-card'

export const catalogItems = [
  {
    href: '#header',
    label: 'Header',
    description: 'Live header playground with scroll-linked behavior.',
    icon: PanelTop,
    tone: 'from-[color-mix(in_oklab,var(--primary)_36%,var(--background))] to-[color-mix(in_oklab,var(--accent)_34%,var(--background))]',
  },
  {
    href: '#sidebar',
    label: 'Sidebar',
    description: 'Solid, glass, and fluent app-shell navigation variants.',
    icon: PanelLeft,
    tone: 'from-[color-mix(in_oklab,var(--accent)_38%,var(--background))] to-[color-mix(in_oklab,var(--primary)_32%,var(--background))]',
  },
  {
    href: '#resizable-card',
    label: 'ResizableCard',
    description: 'Item-list cards plus Shadix-style compound expandable cards.',
    icon: Box,
    tone: 'from-[color-mix(in_oklab,var(--accent)_42%,var(--background))] to-[color-mix(in_oklab,var(--primary)_26%,var(--secondary))]',
  },
  {
    href: '#resizable-card',
    label: 'Media rail',
    description: 'Aceternity-style card data using image, CTA, and content props.',
    icon: Sparkles,
    tone: 'from-[color-mix(in_oklab,var(--success)_36%,var(--background))] to-[color-mix(in_oklab,var(--primary)_30%,var(--background))]',
  },
]

export const inlineCardItems: Array<ResizableCardItem> = [
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
