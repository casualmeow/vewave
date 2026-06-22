import {
  Component,
  GalleryHorizontalEnd,
  Layers3,
  MousePointerClick,
  PanelLeft,
  PanelTop,
  Sparkles,
  StretchHorizontal,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type ComponentDocSlug = 'glass' | 'header' | 'tabs' | 'resizable-card' | 'sidebar' | 'shared'

export type ComponentDocRoute =
  | '/admin/docs/ui/components'
  | '/admin/docs/ui/components/glass'
  | '/admin/docs/ui/components/header'
  | '/admin/docs/ui/components/tabs'
  | '/admin/docs/ui/components/resizable-card'
  | '/admin/docs/ui/components/sidebar'
  | '/admin/docs/ui/components/shared'

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
    variant="liquidGlass"
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
    interactiveGlass
    fluidPreset="balanced"
    magneticStrength={7}
    tiltStrength={2.2}
    liquidIntensity={1}
  />
  <HeaderSpacer size="lg" topOffset={12} />
</>`

const glassImportSnippet = `import {
  GLASS_FLUID_PRESETS,
  GLASS_FLUID_TRANSITION,
  getPointerProgress,
  toMotionDragMode,
  useResolvedGlassFluidConfig,
  type GlassFluidPreset,
  type GlassFluidInteractionProps,
} from '@/components/glass'`

const glassUsageSnippet = `function LiquidItem(props: GlassFluidInteractionProps & { active?: boolean }) {
  const config = useResolvedGlassFluidConfig({
    fluidPreset: 'balanced',
    minHoverSize: 2,
    ...props,
  })

  return (
    <motion.button
      drag={toMotionDragMode(config.dragMode)}
      whileHover={{ scale: props.active ? config.activeHoverScale : config.hoverScale }}
      whileDrag={{ scale: config.dragScale }}
      transition={GLASS_FLUID_TRANSITION}
      className="rounded-full border bg-background/40 px-4 py-2 backdrop-blur-xl"
    >
      Liquid control
    </motion.button>
  )
}`

const tabsImportSnippet = `import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/tabs'`

const tabsUsageSnippet = `<Tabs defaultValue="overview" design="liquidGlass" motion="fluid" fluidPreset="balanced">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="analytics" badge="12">Analytics</TabsTrigger>
    <TabsTrigger value="settings">Settings</TabsTrigger>
  </TabsList>

  <TabsContent value="overview" inset>
    Project overview content.
  </TabsContent>
  <TabsContent value="analytics" inset>
    Analytics content.
  </TabsContent>
  <TabsContent value="settings" inset>
    Settings content.
  </TabsContent>
</Tabs>`

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
  type MobileSidebarDockItem,
} from '@/components/sidebar'`

const sidebarUsageSnippet = `const mobileDockItems: Array<MobileSidebarDockItem> = [
  { label: 'Home', shortLabel: 'Home', to: '/studio/home', icon: <Home /> },
  {
    label: 'Content manager',
    shortLabel: 'Content',
    to: '/studio/content-manager',
    icon: <Video />,
    badge: '12',
  },
]

<Sidebar
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
  mobileFluidPreset="extreme"
  mobileHoverSize={22}
  mobileHoverScale={1.12}
  mobileActiveHoverScale={1.08}
  mobileDragScale={1.2}
  mobileFocusBlur
  mobileFocusBlurAmount={6}
  mobileFocusDimOpacity={0.32}
  mobileDragMode="both"
  mobileDockDragMode="both"
  mobileMaxItems={5}
  mobileDockItems={mobileDockItems}
  mobileDockPathname={location.pathname}
  mobileDockAriaLabel="Studio mobile navigation"
  mobileDockPlacement="container"
  mobileDockClassName="inset-x-3"
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
  glass: {
    slug: 'glass',
    title: 'Glass',
    eyebrow: 'Motion / liquid interaction foundation',
    description:
      'Shared glass-interaction utilities used by Header, Sidebar, and Tabs for fluid presets, magnetic pointer motion, drag behavior, and reduced-motion-aware animation tuning.',
    to: '/admin/docs/ui/components/glass',
    icon: Sparkles,
    importSnippet: glassImportSnippet,
    usageSnippet: glassUsageSnippet,
    apiRows: [
      {
        name: 'GlassFluidPreset',
        type: "'subtle' | 'balanced' | 'expressive' | 'extreme'",
        description:
          'Named interaction profiles for hover scale, active scale, drag scale, magnetic offset, tilt, focus blur, and liquid intensity.',
      },
      {
        name: 'GlassFluidInteractionProps',
        type: 'hoverScale, activeHoverScale, dragScale, hoverSize, magneticStrength, magneticVerticalStrength, tiltStrength, focusBlur, focusBlurAmount, focusDimOpacity, liquidIntensity, dragMode',
        description:
          'Override props shared by fluid components. Components should resolve them through useResolvedGlassFluidConfig instead of duplicating defaults.',
      },
      {
        name: 'useResolvedGlassFluidConfig',
        type: '(options) => GlassResolvedFluidConfig',
        description:
          'Merges a fluid preset with per-component overrides and optional minimum hover size.',
      },
      {
        name: 'useFinePointer',
        type: '() => boolean',
        description:
          'Detects whether pointer-reactive glass effects should run. Touch/coarse pointer surfaces can stay calmer.',
      },
      {
        name: 'useFluidTransform',
        type: '({ enabled, magneticStrength, magneticVerticalStrength, tiltStrength, perspective, tiltSpring })',
        description:
          'Produces transform style and update/reset handlers for magnetic pointer and tilt motion.',
      },
      {
        name: 'useRafCssVariables',
        type: '() => (node, variables) => void',
        description:
          'Batches CSS variable writes through requestAnimationFrame for pointer-driven highlights.',
      },
      {
        name: 'getPointerProgress',
        type: '({ clientX, clientY, rect })',
        description:
          'Converts pointer coordinates into local, percent, and normalized values used by glass highlights.',
      },
      {
        name: 'toMotionDragMode',
        type: "('none' | 'x' | 'y' | 'both') => false | true | 'x' | 'y'",
        description:
          'Maps the public dragMode prop to Motion drag values without leaking Motion-specific types into component APIs.',
      },
      {
        name: 'GLASS_FLUID_TRANSITION / GLASS_SOFT_TRANSITION',
        type: 'Motion transition objects',
        description:
          'Central spring presets used by fluid controls so Header, Sidebar, and Tabs do not scatter animation constants.',
      },
    ],
    sections: [
      {
        title: 'Role in the component layer',
        body: 'Glass is not a route or visual component by itself. It is the reusable interaction layer that keeps liquid-glass controls consistent across complex component packages.',
      },
      {
        title: 'Presets before magic numbers',
        body: 'Start with fluidPreset and override individual numbers only for a specific shell or control. This keeps Header, Sidebar, and Tabs visually related.',
        code: `<Header variant="liquidGlass" fluidPreset="balanced" />

<Tabs design="liquidGlass" fluidPreset="expressive">
  ...
</Tabs>`,
      },
      {
        title: 'Pointer and touch behavior',
        body: 'Use useFinePointer or component-level interactiveGlass props to keep heavy pointer effects away from coarse-pointer mobile contexts.',
        code: `const finePointer = useFinePointer()
const canInteractiveGlass = interactiveGlass && finePointer && !prefersReducedMotion`,
      },
      {
        title: 'CSS variable updates',
        body: 'Pointer highlights should write CSS variables through useRafCssVariables so movement remains smooth without forcing React state updates on every pointer event.',
      },
    ],
    accessibility: [
      'Glass utilities do not add semantics; consuming controls must preserve button, tab, link, or nav semantics.',
      'Reduced-motion users should receive opacity or instant-state fallbacks instead of transform-heavy motion.',
      'Fine-pointer checks prevent desktop-only hover physics from becoming touch-first noise.',
      'Text and icons should stay outside blurred/refraction layers so content remains sharp.',
    ],
  },
  header: {
    slug: 'header',
    title: 'Header',
    eyebrow: 'Navigation / layout primitive',
    description:
      'A React 19 scroll-reactive header with composition slots, animated width collapse, liquid/telegram glass variants, pointer-reactive shine, and reduced-motion handling.',
    to: '/admin/docs/ui/components/header',
    icon: PanelTop,
    importSnippet: headerImportSnippet,
    usageSnippet: headerUsageSnippet,
    apiRows: [
      {
        name: 'variant',
        type: "'glass' | 'glassDark' | 'glassLight' | 'liquidGlass' | 'telegramGlass' | 'solid' | 'gradient' | 'glow'",
        description:
          'Controls the visual skin of the fixed, sticky, or absolute header surface. liquidGlass and telegramGlass enable the newest glass material layer.',
      },
      {
        name: 'size',
        type: "'sm' | 'md' | 'lg'",
        description: 'Controls height, padding, and slot scale.',
      },
      {
        name: 'position',
        type: "'fixed' | 'sticky' | 'absolute'",
        description:
          'Controls header positioning. Use fixed with HeaderSpacer for normal landing/app surfaces.',
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
        name: 'hideOnScrollDown / revealAtTop',
        type: 'boolean / number',
        description:
          'Hides the header while scrolling down and reveals it again near the top or when focus enters the header.',
      },
      {
        name: 'blurIntensity',
        type: "'none' | 'sm' | 'md' | 'lg' | 'xl'",
        description:
          'Controls the backdrop blur amount used by glass variants through the --header-blur CSS variable.',
      },
      {
        name: 'interactiveGlass',
        type: 'boolean',
        description:
          'Enables fine-pointer shine, refraction filter, and fluid transform effects for interactive glass variants.',
      },
      {
        name: 'fluidPreset',
        type: "'subtle' | 'balanced' | 'expressive' | 'extreme'",
        description: 'Uses the shared glass preset system for pointer-responsive liquid behavior.',
      },
      {
        name: 'magneticStrength / magneticVerticalStrength / tiltStrength / liquidIntensity',
        type: 'number',
        description:
          'Optional low-level glass tuning values passed into the shared glass interaction resolver.',
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
        code: `<Header variant="liquidGlass" logo={<HeaderLogo text="Vewave" href="/" />} />
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
        title: 'Liquid and Telegram glass',
        body: 'liquidGlass is the richer floating material for expressive pages. telegramGlass is calmer and works well for compact app navigation. Both reuse the shared Glass fluid preset system.',
        code: `<Header
  variant="telegramGlass"
  interactiveGlass
  fluidPreset="subtle"
  blurIntensity="lg"
  logo={<HeaderLogo text="Vewave" href="/" />}
/>`,
      },
      {
        title: 'Embedded scroll previews',
        body: 'Pass scrollContainerRef when the header is rendered inside a local scroll surface instead of relying on document scroll.',
        code: `const scrollRef = useRef<HTMLDivElement>(null)

<div ref={scrollRef} className="h-96 overflow-auto">
  <Header scrollContainerRef={scrollRef} position="sticky" />
  ...
</div>`,
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
  tabs: {
    slug: 'tabs',
    title: 'Tabs',
    eyebrow: 'Navigation / segmented control',
    description:
      'A Radix Tabs wrapper with solid, glass, liquid-glass, and Telegram-style surfaces, moving shared-layout active indicators, icons, badges, vertical orientation, and shared glass interaction tuning.',
    to: '/admin/docs/ui/components/tabs',
    icon: GalleryHorizontalEnd,
    importSnippet: tabsImportSnippet,
    usageSnippet: tabsUsageSnippet,
    apiRows: [
      {
        name: 'design',
        type: "'solid' | 'glass' | 'liquidGlass' | 'telegramGlass'",
        description:
          'Visual treatment for the tab list and active indicator. liquidGlass uses the strongest moving material effect.',
      },
      {
        name: 'size',
        type: "'sm' | 'md' | 'lg'",
        description: 'Controls trigger height, padding, and list radius.',
      },
      {
        name: 'orientation',
        type: "'horizontal' | 'vertical'",
        description:
          'Passed to Radix Tabs and used by the list variants for row or column layouts.',
      },
      {
        name: 'fullWidth',
        type: 'boolean',
        description:
          'Makes the root/list/triggers stretch across the available inline size. Useful for toolbar tabs.',
      },
      {
        name: 'motion',
        type: "'none' | 'soft' | 'fluid'",
        description:
          'Controls active-indicator motion, hover scaling, dragging, and reduced-motion fallback behavior.',
      },
      {
        name: 'fluidPreset',
        type: "'subtle' | 'balanced' | 'expressive' | 'extreme'",
        description:
          'Shared glass preset for hover scale, magnetic offset, tilt, focus blur, and liquid intensity.',
      },
      {
        name: 'interactiveGlass',
        type: 'boolean',
        description:
          'Enables pointer-reactive refraction and shine when the device supports fine pointer input.',
      },
      {
        name: 'value / defaultValue / onValueChange',
        type: 'string / string / (value: string) => void',
        description:
          'Controlled and uncontrolled Radix Tabs value API. The component tracks activeValue for shared indicator placement.',
      },
      {
        name: 'TabsTrigger.icon / badge',
        type: 'ReactNode',
        description:
          'Optional trigger adornments rendered before and after the label when asChild is not used.',
      },
      {
        name: 'TabsTrigger asChild',
        type: 'boolean',
        description:
          'Preserves Radix asChild composition for custom trigger content while retaining shell effects.',
      },
      {
        name: 'TabsContent inset',
        type: 'boolean',
        description:
          'Adds a subtle bordered inset surface around tab content for docs/settings panels.',
      },
      {
        name: 'hoverScale / activeHoverScale / dragScale / hoverSize',
        type: 'number',
        description:
          'Per-trigger overrides for liquid sizing and scale behavior. Defaults come from fluidPreset.',
      },
      {
        name: 'magneticStrength / magneticVerticalStrength / tiltStrength',
        type: 'number',
        description:
          'Per-trigger pointer transform tuning values inherited from the Glass package.',
      },
      {
        name: 'focusBlur / focusBlurAmount / focusDimOpacity',
        type: 'boolean / number / number',
        description:
          'Dims and blurs sibling triggers while one trigger is hovered, focused, or dragged.',
      },
      {
        name: 'liquidIntensity / dragMode',
        type: "number / 'none' | 'x' | 'y' | 'both'",
        description:
          'Controls liquid highlight intensity and Motion drag direction for fluid triggers.',
      },
    ],
    sections: [
      {
        title: 'Component shape',
        body: 'Tabs wraps Radix Root/List/Trigger/Content with Vewave glass motion. The public API remains Radix-compatible while adding design and fluid props.',
        code: `<Tabs defaultValue="account" design="telegramGlass" motion="soft">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="billing">Billing</TabsTrigger>
  </TabsList>
  <TabsContent value="account">Account settings</TabsContent>
  <TabsContent value="billing">Billing settings</TabsContent>
</Tabs>`,
      },
      {
        title: 'Liquid active indicator',
        body: 'The active trigger renders a shared-layout material layer behind sharp text and icons. Do not place blur filters on the trigger content itself.',
      },
      {
        title: 'Vertical settings tabs',
        body: 'Use vertical orientation for settings sidebars. Keep content panels readable and use inset only when a framed surface helps scanning.',
        code: `<Tabs defaultValue="profile" orientation="vertical" design="glass" motion="soft">
  <TabsList>
    <TabsTrigger value="profile">Profile</TabsTrigger>
    <TabsTrigger value="security">Security</TabsTrigger>
  </TabsList>
  <TabsContent value="profile" inset>Profile form</TabsContent>
  <TabsContent value="security" inset>Security form</TabsContent>
</Tabs>`,
      },
      {
        title: 'Fluid tuning',
        body: 'Use fluidPreset for most cases. Override individual fluid values only when the tab group is a hero control or a touch-first dock-like surface.',
        code: `<Tabs
  design="liquidGlass"
  motion="fluid"
  fluidPreset="expressive"
  hoverSize={10}
  magneticStrength={11}
  tiltStrength={3.5}
  dragMode="both"
/>`,
      },
    ],
    accessibility: [
      'Radix Tabs supplies tablist, tab, and panel semantics.',
      'Keyboard navigation and focus management remain Radix-backed.',
      'Disabled triggers are non-interactive and visibly dimmed.',
      'Reduced-motion users do not receive fluid shared-layout movement.',
      'Text and icons remain above glass/refraction layers so labels stay readable.',
    ],
  },
  'resizable-card': {
    slug: 'resizable-card',
    title: 'ResizableCard',
    eyebrow: 'Expandable card / dialog component',
    description:
      'A reusable expandable-card system with inline and media presentations, render slots, resize constraints, shared-layout animation presets, and Shadix-style compound pieces.',
    to: '/admin/docs/ui/components/resizable-card',
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
    to: '/admin/docs/ui/components/sidebar',
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
        name: 'mobileMode',
        type: "'auto' | 'off' | 'only'",
        description:
          'Controls whether Sidebar renders the desktop rail, the mobile dock, both, or neither. auto swaps to the dock only when mobileDockItems are provided; otherwise the compound rail stays visible.',
      },
      {
        name: 'children',
        type: 'ReactNode',
        description:
          'Required compound content, usually SidebarBrand, SidebarSection, SidebarItem, and SidebarFooter. Route-aware app/studio sidebars should live in layout modules and compose these pieces.',
      },
      {
        name: 'mobileDockItems',
        type: 'Array<MobileSidebarDockItem>',
        description:
          'Items rendered by the mobile dock in compound mode. This keeps route-specific navigation data in layouts while reusing the sidebar dock behavior.',
      },
      {
        name: 'mobileDockPathname',
        type: 'string',
        description:
          'Pathname used to resolve the active mobile dock item, usually location.pathname from TanStack Router.',
      },
      {
        name: 'mobileDockAriaLabel',
        type: 'string',
        description: 'Accessible label for the mobile dock nav. Defaults to Mobile navigation.',
      },
      {
        name: 'mobileFluidPreset',
        type: "'subtle' | 'balanced' | 'expressive' | 'extreme'",
        description:
          'Mobile dock preset. Defaults to the desktop fluidPreset when omitted, but can be stronger for touch-first dock interactions.',
      },
      {
        name: 'mobileHoverSize',
        type: 'number',
        description: 'Pixel expansion for the mobile dock liquid hover and active material.',
      },
      {
        name: 'mobileHoverScale',
        type: 'number',
        description:
          'Scale applied to inactive mobile dock items on hover/fine pointer interaction.',
      },
      {
        name: 'mobileActiveHoverScale',
        type: 'number',
        description:
          'Scale applied to the active mobile dock item on hover/fine pointer interaction.',
      },
      {
        name: 'mobileDragScale',
        type: 'number',
        description: 'Scale applied while dragging a mobile dock item.',
      },
      {
        name: 'mobileMagneticStrength',
        type: 'number',
        description: 'Horizontal magnetic pointer offset strength for mobile dock items.',
      },
      {
        name: 'mobileMagneticVerticalStrength',
        type: 'number',
        description: 'Vertical magnetic pointer offset strength for mobile dock items.',
      },
      {
        name: 'mobileTiltStrength',
        type: 'number',
        description: 'Maximum mobile dock item tilt angle for fluid pointer motion.',
      },
      {
        name: 'mobileFocusBlur',
        type: 'boolean',
        description:
          'Dims and blurs sibling dock items while one mobile item is focused or hovered.',
      },
      {
        name: 'mobileFocusBlurAmount',
        type: 'number',
        description: 'Blur radius in pixels for mobile dock focus attenuation.',
      },
      {
        name: 'mobileFocusDimOpacity',
        type: 'number',
        description: 'Opacity applied to sibling mobile dock items during focus attenuation.',
      },
      {
        name: 'mobileLiquidIntensity',
        type: 'number',
        description: 'Multiplier for mobile dock liquid selector and hover material effects.',
      },
      {
        name: 'mobileDragMode',
        type: "'none' | 'x' | 'y' | 'both'",
        description: 'Drag direction for individual mobile dock items.',
      },
      {
        name: 'mobileDockDragMode',
        type: "'none' | 'x' | 'y' | 'both'",
        description: 'Drag direction for the entire floating mobile dock surface.',
      },
      {
        name: 'mobileMaxItems',
        type: 'number',
        description: 'Maximum number of navigation items rendered inside the mobile dock.',
      },
      {
        name: 'mobileDockPlacement',
        type: "'container' | 'app' | 'viewport' | 'inline'",
        description:
          'Positions the mobile dock. container and app are layout-contained absolute placements, viewport is an opt-in fixed overlay, and inline is sticky for embedded previews.',
      },
      {
        name: 'mobileDockClassName',
        type: 'string',
        description:
          'Optional className for the mobile dock wrapper, useful for shell-specific insets.',
      },
      {
        name: 'MobileSidebarDockItem.params',
        type: 'Record<string, string>',
        description:
          'Optional TanStack Router params for dock links that point to dynamic routes such as /room/$code.',
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
      {
        name: 'SidebarItem focusGroup',
        type: 'string',
        description:
          'Groups related items for interaction focus. Useful for disclosure triggers and their children so the group stays emphasized while siblings dim on hover, focus, or drag.',
      },
    ],
    sections: [
      {
        title: 'Composition model',
        body: 'Sidebar is a compound shell built from SidebarBrand, SidebarSection, SidebarItem, and SidebarFooter. Layout modules own route-specific links, active state, dialog content, and product copy, then pass those pieces into the reusable component.',
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
        title: 'App shell usage',
        body: 'Authenticated app layouts compose Sidebar from root pieces, then pass mobileDockItems so the same route model powers the desktop rail and the bottom dock. Use mobileDockPlacement="container" inside a relative 100svh app shell so the dock sits inside the padded surface instead of the raw viewport.',
        code: `<Sidebar
  design="liquidGlass"
  motion="fluid"
  fluidPreset="balanced"
  dragMode="none"
  mobileDockItems={mobileDockItems}
  mobileDockPathname={location.pathname}
  mobileDockAriaLabel="App mobile navigation"
  mobileDockPlacement="container"
  mobileDockClassName="inset-x-3"
  role="navigation"
  aria-label="App navigation"
>
  <SidebarBrand
    visual={<AvatarFallback>VW</AvatarFallback>}
    title="Vewave"
    subtitle="Watch workspace"
  />
  <SidebarSection title="Workspace">
    <SidebarItem asChild active>
      <Link to="/projects">
        <SidebarItemIcon><FolderKanban /></SidebarItemIcon>
        <SidebarItemLabel>Projects</SidebarItemLabel>
      </Link>
    </SidebarItem>
  </SidebarSection>
  <SidebarFooter>
    <SidebarItem type="button" icon={<Settings />}>Settings</SidebarItem>
  </SidebarFooter>
</Sidebar>`,
      },
      {
        title: 'Liquid glass and fluent variants',
        body: 'Use liquidGlass when the shell sits over a rich background and should show a fluid active highlight. Use fluent when the app needs a calmer acrylic-style panel. All variants share the same component API.',
        code: `<Sidebar design="liquidGlass" motion="fluid" aria-label="Liquid navigation">
  <SidebarSection title="Workspace">
    <SidebarItem active icon={<Home />}>Home</SidebarItem>
  </SidebarSection>
</Sidebar>

<Sidebar design="glass" aria-label="Glass navigation">
  <SidebarSection title="Workspace">
    <SidebarItem active icon={<Home />}>Home</SidebarItem>
  </SidebarSection>
</Sidebar>

<Sidebar design="fluent" aria-label="Fluent navigation">
  <SidebarSection title="Workspace">
    <SidebarItem active icon={<Home />}>Home</SidebarItem>
  </SidebarSection>
</Sidebar>`,
      },
      {
        title: 'Fluid active highlight',
        body: 'The liquidGlass variant renders a scoped shared-layout selector behind the active item. Item content stays sharp above it. Focus blur is interaction-driven only: active items do not dim siblings until a user hovers, focuses, or drags an item.',
        code: `<Sidebar design="liquidGlass" motion="fluid" fluidPreset="balanced">
  <SidebarSection title="Workspace">
    <SidebarItem active icon={<Home />}>Home</SidebarItem>
    <SidebarItem icon={<Video />} badge="12">Content</SidebarItem>
  </SidebarSection>
</Sidebar>`,
      },
      {
        title: 'Grouped disclosure focus',
        body: 'Use the same focusGroup on a collapsible parent and its nested items when the group should behave as one focused region. This keeps opened room/server lists readable while the surrounding sidebar can still dim during interaction.',
        code: `<SidebarSection title="Rooms">
  <SidebarItem
    type="button"
    value="rooms"
    focusGroup="rooms"
    aria-expanded={open}
  >
    Rooms
  </SidebarItem>

  {open ? (
    <SidebarItem asChild value="room-DEMO42" focusGroup="rooms">
      <Link to="/room/$code" params={{ code: 'DEMO42' }}>
        <SidebarItemLabel>Friday watch room</SidebarItemLabel>
      </Link>
    </SidebarItem>
  ) : null}
</SidebarSection>`,
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
        title: 'Mobile dock tuning',
        body: 'Sidebar can render a touch-first floating dock with its own interaction profile. Use mobileFluidPreset for broad behavior, pass mobileDockItems for compound layouts, and keep mobileDockPlacement="container" for normal app shells. Use viewport only when an intentional fixed overlay is needed.',
        code: `<Sidebar
  mobileDockItems={mobileDockItems}
  mobileDockPathname={location.pathname}
  mobileDockAriaLabel="Workspace mobile navigation"
  mobileFluidPreset="extreme"
  mobileHoverSize={22}
  mobileHoverScale={1.12}
  mobileActiveHoverScale={1.08}
  mobileDragScale={1.2}
  mobileFocusBlur
  mobileFocusBlurAmount={6}
  mobileFocusDimOpacity={0.32}
  mobileDragMode="both"
  mobileDockDragMode="both"
  mobileMaxItems={5}
  mobileDockPlacement="container"
  mobileDockClassName="inset-x-3"
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
      'Use mobileDockAriaLabel when the floating dock needs a more specific accessible name.',
      'Active items set aria-current="page".',
      'Mobile dock items also set aria-current and support TanStack Router params for dynamic routes.',
      'Collapsed labels remain accessible through sr-only text.',
      'Disabled items expose aria-disabled and block pointer interaction.',
      'Reduced-motion users do not receive transform-heavy sidebar entrance animation.',
    ],
  },
  shared: {
    slug: 'shared',
    title: 'Shared UI',
    eyebrow: 'Primitives / shared layer',
    description:
      'Low-level shadcn/Radix-style primitives for forms, actions, surfaces, and overlays. Each shared primitive has its own docs route.',
    to: '/admin/docs/ui/components/shared',
    icon: Layers3,
    importSnippet: `import {
  Button,
  Card,
  Dialog,
  DropdownMenu,
  Form,
  Input,
  Progress,
  SecureInput,
  Select,
  Sheet,
  Slider,
  Tabs,
  Table,
} from '@/shared/ui'`,
    usageSnippet: `<Card>
  <CardHeader>
    <CardTitle>Room defaults</CardTitle>
  </CardHeader>
  <CardContent>
    <Input placeholder="Room title" />
    <Button>Create</Button>
  </CardContent>
</Card>`,
    apiRows: [
      {
        name: 'Button',
        type: "variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'",
        description: 'Base action primitive with CVA variants and asChild composition.',
      },
      {
        name: 'Input / SecureInput / RegisterPasswordInput',
        type: 'input primitives and password helpers',
        description:
          'Input supports optional tooltips. SecureInput adds visibility toggle behavior. RegisterPasswordInput adds strength feedback.',
      },
      {
        name: 'Form helpers',
        type: 'React Hook Form wrappers',
        description:
          'Form, FormField, FormItem, FormControl, FormLabel, FormDescription, and FormMessage.',
      },
      {
        name: 'Checkbox / Select / Slider / Tabs',
        type: 'Radix primitives',
        description: 'Accessible interactive controls with project Tailwind tokens.',
      },
      {
        name: 'Dialog / Sheet / DropdownMenu / Tooltip',
        type: 'surface primitives',
        description:
          'Generic overlays and menus. Product-specific content, titles, and route behavior belong in modules.',
      },
      {
        name: 'Card / Table / Progress / Avatar / Separator',
        type: 'display primitives',
        description:
          'Generic layout, data, progress, identity, and divider primitives for module composition.',
      },
      {
        name: 'Cropper / SpinIcon / AccessSelector',
        type: 'specialized helpers',
        description:
          'Small reusable helpers for image cropping, status motion, and access-level selection.',
      },
    ],
    sections: [
      {
        title: 'Primitive inventory',
        body: 'The Shared UI page documents the actual src/shared/ui files: actions, forms, overlays, surfaces, data display, feedback, motion helpers, and specialized editing helpers.',
      },
      {
        title: 'Promote behavior upward',
        body: 'When a primitive needs reusable state, slots, or animation choreography, wrap it in src/components or compose it in a module.',
      },
      {
        title: 'Live docs',
        body: 'The shared UI catalog links to independent primitive pages for forms, overlays, tables, progress, tabs, password helpers, and motion status icons.',
      },
    ],
    accessibility: [
      'Radix-backed primitives preserve keyboard and ARIA behavior.',
      'Buttons and controls keep visible focus styles.',
      'Dialogs and sheets must receive route/module-specific titles and descriptions.',
    ],
  },
}

export const componentDocLinks: Array<ComponentDocLink> = [
  {
    slug: 'glass',
    title: componentDocs.glass.title,
    description: componentDocs.glass.description,
    to: componentDocs.glass.to,
    icon: componentDocs.glass.icon,
  },
  {
    slug: 'header',
    title: componentDocs.header.title,
    description: componentDocs.header.description,
    to: componentDocs.header.to,
    icon: componentDocs.header.icon,
  },
  {
    slug: 'tabs',
    title: componentDocs.tabs.title,
    description: componentDocs.tabs.description,
    to: componentDocs.tabs.to,
    icon: componentDocs.tabs.icon,
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
  {
    slug: 'shared',
    title: componentDocs.shared.title,
    description: componentDocs.shared.description,
    to: componentDocs.shared.to,
    icon: componentDocs.shared.icon,
  },
]

export const componentDocsHighlights = [
  {
    title: 'UI-kit pages',
    description:
      'Component usage now lives under /admin/docs/ui/components instead of README files inside component packages.',
    icon: Component,
  },
  {
    title: 'Live examples',
    description:
      'Docs explain the public API and embed the interactive playground for each complex component.',
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
