# Expandable Cards

Reusable React 19 expandable cards with:

- Motion shared-layout animation
- Resizable expanded dialog
- Decomposed hooks and UI modules
- CVA-based shadcn-style variants
- Custom render slots for media, title, description, action, and content

```tsx
'use client'

import { ExpandableCards, type ExpandableCardItem } from '@/shared/ui/expandable-cards'

const cards: ExpandableCardItem[] = [
  {
    id: 'lana',
    title: 'Summertime Sadness',
    description: 'Lana Del Rey',
    src: 'https://assets.aceternity.com/demos/lana-del-rey.jpeg',
    imageAlt: 'Lana Del Rey',
    ctaText: 'Play',
    ctaLink: 'https://example.com',
    content: <p>Expandable descriptive content goes here.</p>,
  },
]

export function Example() {
  return (
    <ExpandableCards
      items={cards}
      variant="outline"
      size="default"
      resizable
      expandedSize={{
        initialWidth: 760,
        initialHeight: 680,
      }}
    />
  )
}
```

## Variants

Available values:

```ts
variant:
  | 'default'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'destructive'

size:
  | 'sm'
  | 'default'
  | 'lg'
```

Example:

```tsx
<ExpandableCards
  items={cards}
  variant="secondary"
  size="lg"
  actionVariant="default"
  iconButtonVariant="outline"
/>
```

## Folder intent

- `expandable-cards.tsx`: public orchestrator
- `hooks/`: logic and side effects
- `ui/`: compact card, dialog, and default rendering
- `variants.ts`: CVA styling system
- `types.ts`: public contracts

## Custom compact actions

The compact card is rendered as a button. When overriding `renderAction`, prefer non-interactive content for the compact state, or change the list item implementation if you need nested links/buttons.
