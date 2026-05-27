import {
  Component,
  GalleryHorizontalEnd,
  MousePointerClick,
  PanelLeft,
  PanelTop,
  Sparkles,
  StretchHorizontal,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type ComponentDocSlug = 'header' | 'resizable-card' | 'sidebar'

export type ComponentDocRoute =
  | '/docs/ui/components'
  | '/docs/ui/components/header'
  | '/docs/ui/components/resizable-card'
  | '/docs/ui/components/sidebar'

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

const sidebarImportSnippet = `import {
  Sidebar,
  SidebarBrand,
  SidebarFooter,
  SidebarItem,
  SidebarItemBadge,
  SidebarItemIcon,
  SidebarItemLabel,
  SidebarSection,
} from '@/components/sidebar'`

const sidebarUsageSnippet = `<Sidebar
  design="liquidGlass"
  size="md"
  density="comfortable"
  motion="fluid"
  fluidPreset="expressive"
  hoverSize={10}
  hoverScale={1.07}
  activeHoverScale={1.045}
  dragScale={1.12}
  magneticStrength={13}
  magneticVerticalStrength={8}
  tiltStrength={4.2}
  focusBlur
  focusBlurAmount={4.5}
  focusDimOpacity={0.46}
  liquidIntensity={1.25}
  dragMode="both"
  aria-label="Studio navigation"
>
  <SidebarBrand
    visual={<Avatar className="size-12" />}
    title="Your channel"
    subtitle="Creator studio"
  />

  <SidebarSection title="Workspace">
    <SidebarItem asChild active>
      <Link to="/studio/home">
        <SidebarItemIcon><Home /></SidebarItemIcon>
        <SidebarItemLabel>Home</SidebarItemLabel>
        <SidebarItemBadge>Live</SidebarItemBadge>
      </Link>
    </SidebarItem>
  </SidebarSection>

  <SidebarFooter>
    <SidebarItem type="button" icon={<Settings />}>
      Settings
    </SidebarItem>
  </SidebarFooter>
</Sidebar>`

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
  sidebar: {
    slug: 'sidebar',
    title: 'Sidebar',
    eyebrow: 'Navigation / shell component',
    description:
      'A decomposable sidebar system for app shells with compound items, CVA design variants, one moving active selector, and solid/glass/liquid-glass/fluent visual treatments.',
    to: '/docs/ui/components/sidebar',
    icon: PanelLeft,
    importSnippet: sidebarImportSnippet,
    usageSnippet: sidebarUsageSnippet,
    apiRows: [
      {
        name: 'design',
        type: "'solid' | 'glass' | 'liquidGlass' | 'fluent'",
        description:
          'Visual treatment for the sidebar surface and items. liquidGlass uses one floating glass shell, subtle nav platters, and a moving liquid active selector; fluent uses acrylic-like depth.',
      },
      {
        name: 'size',
        type: "'sm' | 'md' | 'lg'",
        description: 'Controls sidebar width, spacing, and item scale.',
      },
      {
        name: 'density',
        type: "'compact' | 'comfortable'",
        description: 'Controls vertical rhythm inside sections and items.',
      },
      {
        name: 'collapsed',
        type: 'boolean',
        description:
          'Switches text labels and badges into icon-only layout while preserving accessible text.',
      },
      {
        name: 'motion',
        type: "'none' | 'soft' | 'fluid'",
        description:
          'Controls entrance, hover, and active-indicator motion. fluid uses a tighter spring for the liquid-glass active highlight.',
      },
      {
        name: 'fluidPreset',
        type: "'subtle' | 'balanced' | 'expressive' | 'extreme'",
        description:
          'Preconfigured interaction strength for liquidGlass hover scale, magnetic movement, tilt, focus blur, and liquid intensity.',
      },
      {
        name: 'hoverSize',
        type: 'number',
        description:
          'Pixel expansion of the liquid hover/active selector layer around the item shell.',
      },
      {
        name: 'hoverScale',
        type: 'number',
        description: 'Scale applied to inactive liquid item shells on hover.',
      },
      {
        name: 'activeHoverScale',
        type: 'number',
        description: 'Scale applied to the active liquid item shell on hover.',
      },
      {
        name: 'dragScale',
        type: 'number',
        description: 'Scale used while dragging a liquid item shell.',
      },
      {
        name: 'magneticStrength',
        type: 'number',
        description: 'Horizontal magnetic pointer offset strength for liquidGlass items.',
      },
      {
        name: 'magneticVerticalStrength',
        type: 'number',
        description: 'Vertical magnetic pointer offset strength for liquidGlass items.',
      },
      {
        name: 'tiltStrength',
        type: 'number',
        description: 'Maximum tilt angle used by pointer-driven liquid item motion.',
      },
      {
        name: 'focusBlur',
        type: 'boolean',
        description: 'Dims and blurs sibling items while one liquid item is focused or hovered.',
      },
      {
        name: 'focusBlurAmount',
        type: 'number',
        description: 'Blur radius in pixels for focus/hover sibling attenuation.',
      },
      {
        name: 'focusDimOpacity',
        type: 'number',
        description: 'Opacity applied to sibling items during focus/hover attenuation.',
      },
      {
        name: 'liquidIntensity',
        type: 'number',
        description: 'Multiplier used by the liquid selector and hover material effects.',
      },
      {
        name: 'dragMode',
        type: "'none' | 'x' | 'y' | 'both'",
        description:
          'Controls drag direction for liquid item shells when motion is fluid. Use none for conservative navigation.',
      },
      {
        name: 'SidebarItem asChild',
        type: 'boolean',
        description:
          'Lets route links or dialog triggers receive sidebar item classes while keeping router primitives outside the reusable package.',
      },
      {
        name: 'SidebarItem icon / badge',
        type: 'ReactNode',
        description:
          'Optional shorthand slots for button-style items. Use SidebarItemIcon, SidebarItemLabel, and SidebarItemBadge when composing asChild links.',
      },
    ],
    sections: [
      {
        title: 'Composition model',
        body: 'Sidebar owns reusable shell behavior. Layouts provide route-specific links, active state, dialog content, and product copy. SidebarSection creates the grouped navigation region and keeps section labels accessible in collapsed mode.',
        code: `<Sidebar design="glass">
  <SidebarBrand title="Studio" subtitle="Creator tools" />
  <SidebarSection title="Navigation">
    <SidebarItem asChild>
      <Link to="/studio/home">
        <SidebarItemIcon><Home /></SidebarItemIcon>
        <SidebarItemLabel>Home</SidebarItemLabel>
      </Link>
    </SidebarItem>
  </SidebarSection>
</Sidebar>`,
      },
      {
        title: 'Liquid glass and fluent variants',
        body: 'Use liquidGlass when the shell sits over a rich background and should show a fluid active highlight. Use fluent when the app needs a calmer acrylic-style panel. All variants share the same component API.',
        code: `<Sidebar design="liquidGlass" motion="fluid" />
<Sidebar design="glass" />
<Sidebar design="fluent" />`,
      },
      {
        title: 'Fluid active highlight',
        body: 'The liquidGlass variant renders a scoped shared-layout selector behind the active item. Item content stays sharp above it, and fine-pointer devices only add a small shell shine rather than per-item glass cards.',
        code: `<Sidebar design="liquidGlass" motion="fluid" fluidPreset="balanced">
  <SidebarSection title="Workspace">
    <SidebarItem active icon={<Home />}>Home</SidebarItem>
    <SidebarItem icon={<Video />} badge="12">Content</SidebarItem>
  </SidebarSection>
</Sidebar>`,
      },
      {
        title: 'Interaction tuning',
        body: 'Use fluidPreset first. Reach for hoverScale, magneticStrength, tiltStrength, liquidIntensity, focusBlur, or dragMode only when a layout needs a specific interaction profile.',
        code: `<Sidebar
  design="liquidGlass"
  motion="fluid"
  fluidPreset="subtle"
  hoverSize={3}
  hoverScale={1.025}
  activeHoverScale={1.015}
  dragScale={1.045}
  magneticStrength={4}
  magneticVerticalStrength={2.5}
  tiltStrength={1.8}
  liquidIntensity={0.72}
  dragMode="none"
  focusBlur={false}
/>`,
      },
      {
        title: 'Collapsed sidebars',
        body: 'Collapsed mode hides visible labels with sr-only text instead of removing names from assistive technology.',
        code: `<Sidebar collapsed aria-label="Primary navigation">
  <SidebarSection title="Workspace">
    <SidebarItem icon={<Home />}>Home</SidebarItem>
  </SidebarSection>
</Sidebar>`,
      },
    ],
    accessibility: [
      'Consumers provide aria-label on the Sidebar root when it acts as navigation.',
      'Active items set aria-current="page".',
      'Collapsed labels remain accessible through sr-only text.',
      'Disabled items expose aria-disabled and block pointer interaction.',
      'Reduced-motion users do not receive transform-heavy sidebar entrance animation.',
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
  {
    slug: 'sidebar',
    title: componentDocs.sidebar.title,
    description: componentDocs.sidebar.description,
    to: componentDocs.sidebar.to,
    icon: componentDocs.sidebar.icon,
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
