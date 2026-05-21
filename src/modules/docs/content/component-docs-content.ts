import {
  Component,
  GalleryHorizontalEnd,
  MousePointerClick,
  PanelTop,
  Sparkles,
  StretchHorizontal,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type ComponentDocSlug = 'header' | 'resizable-card'

export type ComponentDocRoute =
  | '/docs/ui/components'
  | '/docs/ui/components/header'
  | '/docs/ui/components/resizable-card'

export type ComponentDocLink = {
  slug: ComponentDocSlug
  title: string
  description: string
  to: ComponentDocRoute
  icon: LucideIcon
}

export type ComponentDocSection = {
  title: string
  body: string
  code?: string
}

export type ComponentApiRow = {
  name: string
  type: string
  description: string
}

export type ComponentDoc = ComponentDocLink & {
  eyebrow: string
  importSnippet: string
  usageSnippet: string
  apiRows: Array<ComponentApiRow>
  sections: Array<ComponentDocSection>
  accessibility: Array<string>
}

const headerImportSnippet = `import {
  Header,
  HeaderButton,
  HeaderLogo,
  HeaderNav,
  HeaderNavItem,
  HeaderSpacer,
} from '@/components/header'`

const headerUsageSnippet = `<>
  <Header
    variant="glass"
    size="lg"
    initialWidth="min(94vw, 76rem)"
    collapsedWidth="min(68vw, 48rem)"
    maxWidth="76rem"
    scrollDistance={220}
    collapseThreshold={0.58}
    showGlow
    logo={<HeaderLogo text="Vewave" href="/" />}
    navigation={
      <HeaderNav>
        <HeaderNavItem href="#features">Features</HeaderNavItem>
        <HeaderNavItem href="#workflow">Workflow</HeaderNavItem>
      </HeaderNav>
    }
    actions={<HeaderButton>Create room</HeaderButton>}
  />
  <HeaderSpacer size="lg" topOffset={12} />
</>`

const resizableCardImportSnippet = `import {
  ResizableCards,
  ResizableCard,
  ResizableCardBody,
  ResizableCardContent,
  ResizableCardDescription,
  ResizableCardExpandContainer,
  ResizableCardImage,
  ResizableCardTitle,
  type ResizableCardItem,
} from '@/components/resizable-card'`

const resizableCardUsageSnippet = `const items: ResizableCardItem[] = [
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
      items={items}
      presentation="media"
      animationPreset="surface-grow"
      resizable
      expandedSize={{
        initialWidth: 720,
        initialHeight: 560,
        minWidth: 320,
        minHeight: 360,
        maxWidth: 980,
        maxHeight: 760,
      }}
    />
  )
}`

export const componentDocs: Record<ComponentDocSlug, ComponentDoc> = {
  header: {
    slug: 'header',
    title: 'Header',
    eyebrow: 'Navigation / layout primitive',
    description:
      'A React 19 scroll-reactive header with composition slots, animated width collapse, glass visuals, and reduced-motion handling.',
    to: '/docs/ui/components/header',
    icon: PanelTop,
    importSnippet: headerImportSnippet,
    usageSnippet: headerUsageSnippet,
    apiRows: [
      {
        name: 'variant',
        type: "'glass' | 'glassDark' | 'glassLight' | 'solid' | 'gradient' | 'glow'",
        description: 'Controls the visual skin of the fixed or sticky header surface.',
      },
      {
        name: 'size',
        type: "'sm' | 'md' | 'lg'",
        description: 'Controls height, padding, and slot scale.',
      },
      {
        name: 'collapseBehavior',
        type: "'scroll' | 'manual' | 'none'",
        description: 'Switches between scroll progress, controlled collapse, or no collapse.',
      },
      {
        name: 'collapsed',
        type: 'boolean',
        description: 'Controls the collapsed state when collapseBehavior is manual.',
      },
      {
        name: 'logo / navigation / actions',
        type: 'ReactNode',
        description: 'Slot props used to compose HeaderLogo, HeaderNav, and HeaderButton content.',
      },
      {
        name: 'scrollContainerRef',
        type: 'RefObject<HTMLElement | null>',
        description: 'Optional local scroll container for embedded previews and isolated surfaces.',
      },
      {
        name: 'slotClassNames',
        type: 'HeaderSlotClassNames',
        description: 'Scoped class overrides for inner, logo, navigation, actions, and children.',
      },
    ],
    sections: [
      {
        title: 'Spacing model',
        body: 'Use HeaderSpacer below fixed headers so page content does not render underneath the header.',
        code: `<Header variant="solid" logo={<HeaderLogo text="Vewave" href="/" />} />
<HeaderSpacer size="md" />`,
      },
      {
        title: 'Manual collapse',
        body: 'Use manual mode when the page or tool owns the compact state rather than document scroll.',
        code: `<Header
  collapseBehavior="manual"
  collapsed={compact}
  logo={<HeaderLogo text="Studio" href="/studio" />}
  actions={<HeaderButton onClick={() => setCompact((value) => !value)}>Toggle</HeaderButton>}
/>`,
      },
      {
        title: 'Slot composition',
        body: 'Header logic stays in the component package. Layouts provide project-specific logo, links, and actions.',
      },
    ],
    accessibility: [
      'Navigation receives an accessible label through navigationLabel.',
      'Active nav items use aria-current="page".',
      'Disabled nav items expose aria-disabled and cannot be activated.',
      'Loading buttons expose aria-busy.',
      'Hidden-on-scroll headers reveal when focus enters the header.',
    ],
  },
  'resizable-card': {
    slug: 'resizable-card',
    title: 'ResizableCard',
    eyebrow: 'Expandable card / dialog component',
    description:
      'A reusable expandable-card system with inline and media presentations, render slots, resize constraints, shared-layout animation presets, and Shadix-style compound pieces.',
    to: '/docs/ui/components/resizable-card',
    icon: StretchHorizontal,
    importSnippet: resizableCardImportSnippet,
    usageSnippet: resizableCardUsageSnippet,
    apiRows: [
      {
        name: 'items',
        type: 'ReadonlyArray<ResizableCardItem>',
        description: 'Data-driven list items for ResizableCards.',
      },
      {
        name: 'presentation',
        type: "'inline' | 'media'",
        description:
          'Structural layout. Inline is dense and utility-like; media is the card-to-expanded-surface presentation.',
      },
      {
        name: 'variant',
        type: "'default' | 'secondary' | 'outline' | 'ghost' | 'destructive'",
        description: 'Visual tone for compact cards and dialog surfaces.',
      },
      {
        name: 'animationPreset',
        type: 'ResizableCardAnimationPreset',
        description: 'Motion strategy for compact to expanded transitions, including surface-grow.',
      },
      {
        name: 'expandedSize',
        type: 'ExpandedCardSize',
        description: 'Initial, min, max, and viewport padding constraints for the expanded dialog.',
      },
      {
        name: 'renderMedia / renderAction / renderContent',
        type: 'render callbacks',
        description:
          'Slot renderers that customize content while preserving the controller, modal, resize, and accessibility wiring.',
      },
      {
        name: 'ResizableCard compound exports',
        type: 'single-card composition',
        description:
          'Use ResizableCardBody, ResizableCardExpandContainer, ResizableCardImage, ResizableCardTitle, ResizableCardDescription, and ResizableCardContent for Shadix-style composition.',
      },
    ],
    sections: [
      {
        title: 'Inline presentation',
        body: 'Use inline for settings rows, dense previews, and content lists where the compact state should stay horizontally efficient.',
        code: `<ResizableCards items={items} presentation="inline" variant="outline" />`,
      },
      {
        title: 'Media presentation',
        body: 'Use media when the compact card should visually grow into a larger elevated surface with image, title, description, CTA, and details.',
        code: `<ResizableCards
  items={mediaItems}
  presentation="media"
  animationPreset="surface-grow"
/>`,
      },
      {
        title: 'Compound API',
        body: 'Use the compound pieces when you want a single Shadix-style card composition instead of a data-driven list controller.',
        code: `<ResizableCard>
  <ResizableCardBody>
    <ResizableCardImage src="/preview.jpg" alt="Preview" />
    <ResizableCardTitle>Preview</ResizableCardTitle>
    <ResizableCardDescription>Open for details.</ResizableCardDescription>
  </ResizableCardBody>
  <ResizableCardExpandContainer>
    <ResizableCardImage src="/preview.jpg" alt="Preview" />
    <ResizableCardTitle>Preview</ResizableCardTitle>
    <ResizableCardContent>Expanded details fade in separately.</ResizableCardContent>
  </ResizableCardExpandContainer>
</ResizableCard>`,
      },
    ],
    accessibility: [
      'Compact cards render as buttons with dialog semantics.',
      'Expanded surfaces use role="dialog" and aria-modal.',
      'Escape and backdrop close behavior are configurable.',
      'Focus moves to the close button on open and returns to the trigger on close.',
      'The resize handle is keyboard focusable and labeled.',
    ],
  },
}

export const componentDocLinks: Array<ComponentDocLink> = [
  {
    slug: 'header',
    title: componentDocs.header.title,
    description: componentDocs.header.description,
    to: componentDocs.header.to,
    icon: componentDocs.header.icon,
  },
  {
    slug: 'resizable-card',
    title: componentDocs['resizable-card'].title,
    description: componentDocs['resizable-card'].description,
    to: componentDocs['resizable-card'].to,
    icon: componentDocs['resizable-card'].icon,
  },
]

export const componentDocsHighlights = [
  {
    title: 'UI-kit pages',
    description:
      'Component usage now lives under /docs/ui/components instead of README files inside component packages.',
    icon: Component,
  },
  {
    title: 'Live examples',
    description:
      'Docs explain the public API. /ui/showcase stays responsible for interactive playground states.',
    icon: MousePointerClick,
  },
  {
    title: 'Motion details',
    description:
      'Animation behavior is documented alongside component props so presets and accessibility rules are discoverable.',
    icon: Sparkles,
  },
  {
    title: 'Import surface',
    description:
      'Docs reference barrel imports from component packages, matching how the app should consume reusable UI.',
    icon: GalleryHorizontalEnd,
  },
]
