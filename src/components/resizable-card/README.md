# ResizableCard

`ResizableCard` is a reusable React 19 component for content-driven expandable cards. It renders a compact card list, animates the active item into a portal dialog with Motion shared layout, and can expose a resize handle for larger preview or reading surfaces.

The public component is exported as both `ResizableCard` and `ExpandableCards`.

```tsx
import { ResizableCard, type ExpandableCardItem } from '@/components/resizable-card'
```

## Basic Usage

```tsx
const cards: ExpandableCardItem[] = [
  {
    id: 'preview',
    title: 'Responsive preview',
    description: 'Open the card to inspect more detail.',
    ctaText: 'Open',
    content: <div className="h-40 rounded-lg bg-muted" />,
  },
]

export function Example() {
  return (
    <ResizableCard
      items={cards}
      variant="outline"
      size="default"
      expandedSize={{
        initialWidth: 760,
        initialHeight: 640,
        minWidth: 360,
        minHeight: 420,
        maxWidth: 1100,
        maxHeight: 900,
      }}
    />
  )
}
```

## Presentations

`presentation` controls the structural layout. `variant` controls only visual tone.

```ts
presentation: 'inline' | 'media' | 'standard'
variant: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive'
animationPreset: ResizableCardAnimationPreset
```

### Inline

`presentation="inline"` is the default and preserves the existing list-like card structure:

```txt
[ small media ] [ title / description ] [ action ]
```

Expanded state keeps the same utility-card feel and is best for previews, settings, docs, and dense UI entries.

```tsx
<ResizableCard items={cards} presentation="inline" variant="outline" />
```

### Media

`presentation="media"` uses the Aceternity-style grid card structure designed for a stronger shared-element morph:

```txt
compact:
[ large media ]
[ title ]
[ description ]

expanded:
[ large media hero ]
[ title / description ] [ CTA ]
[ content ]
```

The card, media, title, and description all keep shared layout ids between compact and expanded states. The CTA and expanded content fade/reveal separately so the transition stays close to the original grid media-card demo style.

```tsx
const mediaCards: ExpandableCardItem[] = [
  {
    id: 'summertime-sadness',
    title: 'Summertime Sadness',
    description: 'Lana Del Rey',
    src: 'https://assets.aceternity.com/demos/lana-del-rey.jpeg',
    imageAlt: 'Lana Del Rey portrait',
    ctaText: 'Visit',
    ctaLink: 'https://ui.aceternity.com/templates',
    content: () => <p>Expanded long-form content.</p>,
  },
]

<ResizableCard
  items={mediaCards}
  presentation="media"
  variant="default"
  size="lg"
/>
```

### Standard

`presentation="standard"` uses the Aceternity-style row/list structure with a shared CTA:

```txt
compact:
[ media ] [ title / description ] [ CTA ]

expanded:
[ large media hero ]
[ title / description ] [ CTA ]
[ content ]
```

Use this presentation when the compact state should feel like a playable/selectable list item, but
the expanded state should still morph into a media-focused modal.

```tsx
<ResizableCard items={mediaCards} presentation="standard" variant="ghost" />
```

## Data Model

```ts
type ExpandableCardItem = {
  id: string
  title: ReactNode
  description?: ReactNode
  src?: string
  imageAlt?: string
  ctaText?: ReactNode
  ctaLink?: string
  content?: ReactNode | (() => ReactNode)
}
```

`src` and `imageAlt` feed the default media renderer. `ctaText` and `ctaLink` feed the default action renderer. `content` is shown inside the expanded dialog unless `renderContent` is supplied. The `media` and `standard` presentations are intentionally optimized for this complete item shape.

## Rendering Slots

Use render callbacks to customize slots without replacing the controller, modal, or resize behavior.

```tsx
<ResizableCard
  items={cards}
  presentation="media"
  renderMedia={(item, state) => (
    <div className="h-full w-full bg-gradient-to-br from-teal-300 to-sky-400">
      {state.expanded ? 'Expanded media' : item.title}
    </div>
  )}
  renderAction={(item, state) => (
    <span className="rounded-full bg-primary px-4 py-2 text-primary-foreground">
      {state.expanded ? 'Launch' : item.ctaText}
    </span>
  )}
  renderContent={(item) => <ArticlePreview item={item} />}
/>
```

Available callbacks:

- `renderMedia`
- `renderTitle`
- `renderDescription`
- `renderAction`
- `renderContent`

`renderMedia`, `renderTitle`, `renderDescription`, and `renderAction` receive a `CardRenderState`:

```ts
type CardRenderState = {
  expanded: boolean
  open: () => void
  close: () => void
}
```

In `inline`, the action is shared between compact and expanded states for utility-style cards. In
`media`, the compact card focuses on media/title/description and the expanded action fades in near
the title area. In `standard`, the compact and expanded actions share a layout id, matching the
row-to-modal reference animation.

## Animation Presets

`animationPreset` controls the opening and closing animation strategy. It changes both Motion
transition timing and which visual parts participate in shared-layout morphing. `transitionPreset`
is still accepted as a backward-compatible alias.

```tsx
<ResizableCard items={mediaCards} presentation="media" animationPreset="soft-container-morph" />
```

When omitted, the component chooses a presentation-aware default:

- `inline`: `fade-scale`, because compact rows and expanded dialogs often have different geometry.
- `media`: `media-led-morph`, because the card is designed around shared media continuity.
- `standard`: `soft-container-morph`, because the row, media, title, description, and CTA are structurally related.

Preset families:

- Morph: `container-morph`, `soft-container-morph`, `media-led-morph`, `content-led-morph`, `shape-shift`, `elevation-lift`.
- Axis: `slide-up-expand`, `slide-down-expand`, `slide-left-expand`, `slide-right-expand`, `shared-axis-x`, `shared-axis-y`.
- Fade: `fade-scale`, `container-fade`, `crossfade-details`, `fade-through`, `instant`.
- Expressive: `spring-pop`, `elastic-settle`, `squash-lift`, `overshoot-settle`, `tilt-unfold`, `flip-lite`.
- Content: `media-spotlight`, `blur-reveal`, `shimmer-handoff`, `staggered-details`.

Recommended starting points:

| Presentation | Presets                                                                      |
| ------------ | ---------------------------------------------------------------------------- |
| `inline`     | `fade-scale`, `content-led-morph`, `slide-up-expand`, `fade-through`         |
| `media`      | `media-led-morph`, `container-morph`, `media-spotlight`, `staggered-details` |
| `standard`   | `soft-container-morph`, `container-morph`, `flip-lite`, `staggered-details`  |

If compact and expanded geometry differ significantly, prefer `fade-scale`, `container-fade`, or
`fade-through` to avoid intermediate stretching. Use `container-morph`, `soft-container-morph`, or
`media-led-morph` when compact and expanded structures are deliberately similar.

The close animation is modeled as a shared-layout return from expanded card to compact card. The
shared card/media elements perform the morph, title and description prioritize position motion to
avoid text stretching, and expanded-only action/content layers fade or translate independently.
Compact cards intentionally avoid CSS hover translate transforms on the same node that owns a
Motion `layoutId`, because competing transform animations can cause close jitter.

## Sizing And Resizing

Expansion is internally managed. Clicking a compact card opens it; closing clears the active card. `onActiveItemChange` fires whenever the active item changes.

```tsx
<ResizableCard
  items={cards}
  onActiveItemChange={(item) => {
    console.log(item?.id ?? 'closed')
  }}
/>
```

Resize behavior is controlled by `resizable` and `expandedSize`.

```tsx
<ResizableCard
  items={cards}
  resizable
  expandedSize={{
    initialWidth: 720,
    initialHeight: 560,
    minWidth: 320,
    minHeight: 360,
    maxWidth: 980,
    maxHeight: 760,
    viewportPadding: 16,
  }}
/>
```

`expandedSize` values are clamped to the viewport after subtracting `viewportPadding`. `compactSize`
can set compact card width and minimum height, but avoid forcing a very small
`compactSize.minHeight` with `presentation="media"` because the media presentation relies on a
taller compact geometry for the shared-layout morph. `presentation="standard"` can use a shorter
compact height because the media thumbnail is row-sized on desktop.

## Accessibility And Interaction

- Compact cards render as buttons with `aria-haspopup="dialog"` and `aria-expanded`.
- The expanded surface renders with `role="dialog"` and `aria-modal="true"`.
- Escape closes the dialog when `closeOnEscape` is `true`.
- Clicking the backdrop closes the dialog when `closeOnBackdropClick` is `true`.
- The close button is focused after opening.
- Focus returns to the previously focused compact card after closing.
- Body scroll is locked while open when `lockBodyScroll` is `true`.
- The resize handle is a button with an accessible label.

## Showcase Usage

`/ui/showcase` uses `ResizableCard` as:

- the host for the same-document Header preview surface;
- its own component playground, including `inline`, `media`, and `standard` presentations;
- a media-card demo that uses the snippet-style `title`, `description`, `src`, `ctaText`, `ctaLink`, and `content` props.
