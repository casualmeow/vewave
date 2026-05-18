# ResizableCard

`ResizableCard` is a reusable React 19 component for content-driven expandable cards. It renders a compact card list, animates the active item into a portal dialog with Motion shared layout, and can expose a resize handle for larger preview or reading surfaces.

The item-list component is exported as `ResizableCards`, `ResizableCardList`, and `ResizableCards`.
The package also exports Shadix-style `ResizableCard*` compound pieces for single-card composition.

```tsx
import {
  ResizableCard,
  ResizableCardBody,
  ResizableCardContent,
  ResizableCardDescription,
  ResizableCardExpandContainer,
  ResizableCardImage,
  ResizableCardTitle,
  ResizableCards,
  type ResizableCardItem,
} from '@/components/resizable-card'
```

## Basic Usage

```tsx
const cards: ResizableCardItem[] = [
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
    <ResizableCards
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

## Compound API

Use the compound API when you want the original Shadix-style single-card composition instead of the
data-driven list controller.

```tsx
<ResizableCard transition={{ type: 'spring', stiffness: 260, damping: 30 }}>
  <ResizableCardBody className="w-[250px]">
    <div className="h-56 overflow-hidden rounded-t-xl">
      <ResizableCardImage src="/images/card-1.jpg" alt="Preview" />
    </div>
    <ResizableCardTitle>Hello Shadix UI</ResizableCardTitle>
    <ResizableCardDescription>This is a description of the card.</ResizableCardDescription>
  </ResizableCardBody>

  <ResizableCardExpandContainer className="w-[min(92vw,34rem)]">
    <div className="h-72 overflow-hidden">
      <ResizableCardImage src="/images/card-1.jpg" alt="Preview" />
    </div>
    <ResizableCardTitle>Hello Shadix UI</ResizableCardTitle>
    <ResizableCardDescription>This is a description of the card.</ResizableCardDescription>
    <ResizableCardContent>Expanded details fade in after the surface opens.</ResizableCardContent>
  </ResizableCardExpandContainer>
</ResizableCard>
```

Compound exports:

- `ResizableCard`
- `ResizableCardBody`
- `ResizableCardExpandContainer`
- `ResizableCardImage`
- `ResizableCardTitle`
- `ResizableCardDescription`
- `ResizableCardContent`
- `ResizableCardCloseButton`

`ResizableCard` supports `open`, `defaultOpen`, `onOpenChange`, `transition`,
`closeOnEscape`, `closeOnOutsideClick`, and `lockBodyScroll`. The expanded container renders through
a portal, the backdrop closes on outside click by default, and Escape closes the card by default.

## Presentations

`presentation` controls structure. `variant` controls visual tone.

```ts
presentation: 'inline' | 'media'
variant: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive'
animationPreset: ResizableCardAnimationPreset
```

### Inline

`presentation="inline"` is the default utility layout:

```txt
[ small media ] [ title / description ] [ action ]
```

Use it for previews, settings, docs, and dense UI entries.

```tsx
<ResizableCards items={cards} presentation="inline" variant="outline" />
```

### Media

`presentation="media"` is the polished resizable-card layout. It is inspired by a compact media card growing into a larger elevated surface:

```txt
compact:
[ media ]
[ title ]
[ description ]

expanded:
[ media hero ]
[ title / description ] [ CTA ]
[ content ]
```

The card, media, title, and description can participate in shared layout. Title and description use position-oriented motion so text does not visibly stretch, while expanded-only action/content layers reveal separately.

```tsx
<ResizableCards items={mediaCards} presentation="media" animationPreset="surface-grow" />
```

## Data Model

```ts
type ResizableCardItem = {
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

`src` and `imageAlt` feed the default media renderer. `ctaText` and `ctaLink` feed the default action renderer. `content` is shown inside the expanded dialog unless `renderContent` is supplied.

## Rendering Slots

Use render callbacks to customize slots without replacing the controller, modal, resize behavior, or accessibility wiring.

```tsx
<ResizableCards
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

## Animation Presets

`animationPreset` controls the opening and closing animation strategy. It changes both Motion transition timing and which visual parts participate in shared-layout morphing.

When omitted, the component chooses a presentation-aware default:

- `inline`: `fade-scale`, because compact rows and expanded dialogs often have different geometry.
- `media`: `surface-grow`, because the media presentation is designed to read as an intentional card-surface growth transition.

Preset families:

- Morph: `container-morph`, `soft-container-morph`, `media-led-morph`, `content-led-morph`, `shape-shift`, `elevation-lift`, `surface-grow`.
- Axis: `slide-up-expand`, `slide-down-expand`, `slide-left-expand`, `slide-right-expand`, `shared-axis-x`, `shared-axis-y`.
- Fade: `fade-scale`, `container-fade`, `crossfade-details`, `fade-through`, `instant`.
- Expressive: `spring-pop`, `elastic-settle`, `squash-lift`, `overshoot-settle`, `tilt-unfold`, `flip-lite`.
- Content: `media-spotlight`, `blur-reveal`, `shimmer-handoff`, `staggered-details`.

Recommended starting points:

| Presentation | Presets                                                                   |
| ------------ | ------------------------------------------------------------------------- |
| `inline`     | `fade-scale`, `surface-grow`, `content-led-morph`, `slide-up-expand`      |
| `media`      | `surface-grow`, `media-led-morph`, `media-spotlight`, `staggered-details` |

Use `surface-grow` when the desired effect is deliberate enlargement: the compact surface acts as the spatial origin, the container grows into the dialog, and expanded-only details reveal separately so the transition reads as designed growth rather than accidental stretching.

If compact and expanded geometry differ significantly, prefer `fade-scale`, `container-fade`, or `fade-through` to avoid intermediate stretching. Use `container-morph`, `soft-container-morph`, or `media-led-morph` when compact and expanded structures are deliberately similar.

The close animation is modeled as a shared-layout return from expanded card to compact card. The shared card/media elements perform the morph, title and description prioritize position motion, and expanded-only action/content layers fade or translate independently. Compact cards intentionally avoid CSS hover translate transforms on nodes that own Motion `layoutId` values.

## Sizing And Resizing

Expansion is internally managed. Clicking a compact card opens it; closing clears the active card. `onActiveItemChange` fires whenever the active item changes.

```tsx
<ResizableCards
  items={cards}
  onActiveItemChange={(item) => {
    console.log(item?.id ?? 'closed')
  }}
/>
```

Resize behavior is controlled by `resizable` and `expandedSize`.

```tsx
<ResizableCards
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

`expandedSize` values are clamped to the viewport after subtracting `viewportPadding`. `compactSize` can set compact card width and minimum height, but avoid forcing a very small `compactSize.minHeight` with `presentation="media"` because the media presentation relies on a taller compact geometry for the shared-layout morph.

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
- its own component playground, including `inline` and `media` presentations;
- a media-card demo that uses `title`, `description`, `src`, `ctaText`, `ctaLink`, and `content`;
- Shadix-style compound cards built from `ResizableCardBody`, `ResizableCardImage`,
  `ResizableCardTitle`, `ResizableCardDescription`, and `ResizableCardExpandContainer`.
