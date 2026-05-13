import { type ComponentProps, type ReactNode } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  ChevronRight,
  Code2,
  Layers3,
  Menu,
  Palette,
  Zap,
  type LucideIcon,
} from 'lucide-react'

import {
  Header,
  HeaderButton,
  HeaderLogo,
  HeaderNav,
  HeaderNavItem,
  HeaderSpacer,
} from '@/shared/ui/header'

export const Route = createFileRoute('/ui/showcase/')({
  component: UiShowcasePage,
})

type HeaderVariant = NonNullable<ComponentProps<typeof Header>['variant']>
type HeaderSize = NonNullable<ComponentProps<typeof Header>['size']>
type HeaderCollapseBehavior = NonNullable<ComponentProps<typeof Header>['collapseBehavior']>
type HeaderButtonVariant = NonNullable<ComponentProps<typeof HeaderButton>['variant']>

interface HeaderPreviewProps {
  variant: HeaderVariant
  size?: HeaderSize
  collapseBehavior?: HeaderCollapseBehavior
  collapsed?: boolean
  showGlow?: boolean
  glowColor?: string
  logoText?: string
  actionVariant?: HeaderButtonVariant
  disabledItem?: boolean
}

const headerVariants = [
  {
    name: 'glass',
    variant: 'glass',
    previewClassName: 'bg-[linear-gradient(135deg,#134e4a_0%,#2563eb_55%,#18181b_100%)]',
  },
  {
    name: 'glassDark',
    variant: 'glassDark',
    previewClassName: 'bg-[linear-gradient(135deg,#111827_0%,#115e59_56%,#422006_100%)]',
  },
  {
    name: 'glassLight',
    variant: 'glassLight',
    previewClassName: 'bg-[linear-gradient(135deg,#f8fafc_0%,#ccfbf1_52%,#d9f99d_100%)]',
  },
  {
    name: 'solid',
    variant: 'solid',
    previewClassName: 'bg-[linear-gradient(135deg,#f4f4f5_0%,#e4e4e7_52%,#fafafa_100%)]',
  },
  {
    name: 'gradient',
    variant: 'gradient',
    previewClassName: 'bg-[linear-gradient(135deg,#0f172a_0%,#7c2d12_52%,#0f766e_100%)]',
  },
  {
    name: 'glow',
    variant: 'glow',
    previewClassName: 'bg-[radial-gradient(circle_at_top,#166534_0%,#18181b_48%,#09090b_100%)]',
  },
] as const

const sizeExamples = [
  { name: 'sm', size: 'sm' },
  { name: 'md', size: 'md' },
  { name: 'lg', size: 'lg' },
] as const

const behaviorExamples = [
  {
    name: 'None',
    description: 'Stays expanded and keeps the same width for static surfaces.',
    collapseBehavior: 'none',
    collapsed: false,
  },
  {
    name: 'Manual expanded',
    description: 'Controlled by parent state while rendering the expanded width.',
    collapseBehavior: 'manual',
    collapsed: false,
  },
  {
    name: 'Manual collapsed',
    description: 'Controlled by parent state while rendering the compact width.',
    collapseBehavior: 'manual',
    collapsed: true,
  },
] as const

const featureNotes = [
  'Scroll-linked width collapse with configurable distance and threshold',
  'Glow, blur, glass, solid, gradient, and light visual treatments',
  'Optional hide-on-scroll-down behavior with focus recovery',
  'Manual collapse mode for state-driven layouts',
  'Responsive navigation slot hidden below the medium breakpoint',
  'React 19 ref-as-prop support across Header subcomponents',
  'Reduced-motion handling through Motion preferences',
]

function UiShowcasePage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7faf9] text-zinc-950">
      <Header
        variant="glassDark"
        size="lg"
        initialWidth="min(94vw, 78rem)"
        collapsedWidth="min(66vw, 42rem)"
        minWidth="min(92vw, 22rem)"
        maxWidth="78rem"
        scrollDistance={220}
        collapseThreshold={0.58}
        topOffset={14}
        blurIntensity="xl"
        showGlow
        glowColor="rgba(20, 184, 166, 0.34)"
        hideOnScrollDown
        revealAtTop={28}
        navigationLabel="UI showcase"
        logo={
          <HeaderLogo
            href="/ui/showcase"
            icon={
              <span className="grid size-8 place-items-center rounded-full bg-teal-300 text-sm font-black text-zinc-950">
                UI
              </span>
            }
            text="Showcase"
          />
        }
        navigation={
          <HeaderNav>
            <HeaderNavItem href="#variants" active>
              Variants
            </HeaderNavItem>
            <HeaderNavItem href="#sizes">Sizes</HeaderNavItem>
            <HeaderNavItem href="#behavior">Behavior</HeaderNavItem>
            <HeaderNavItem href="#slots">Slots</HeaderNavItem>
          </HeaderNav>
        }
        actions={
          <>
            <HeaderButton variant="ghost" className="hidden sm:inline-flex">
              Docs
            </HeaderButton>
            <HeaderButton endIcon={<ChevronRight className="size-4" />}>Header</HeaderButton>
          </>
        }
      />

      <HeaderSpacer size="lg" topOffset={14} extraOffset={28} />

      <main>
        <section className="px-4 pb-16 pt-4 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.78fr_1fr] lg:items-end">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-900/10 bg-white px-3 py-1 text-sm text-teal-800 shadow-sm">
                <Code2 className="size-4" />
                UI primitives
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">UI Showcase</h1>
                <p className="max-w-2xl text-lg leading-8 text-zinc-600">
                  Interactive examples of reusable components used across Vewave. This route
                  currently focuses on the React 19 Header primitive and its composition helpers.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <IntroMetric icon={Palette} label="Variants" value="6" />
              <IntroMetric icon={Layers3} label="Sizes" value="3" />
              <IntroMetric icon={Zap} label="Behaviors" value="4" />
            </div>
          </div>
        </section>

        <ShowcaseSection
          id="variants"
          eyebrow="Visual variants"
          title="Header surfaces across light, dark, glass, and glow treatments."
          description="Each preview uses a locally positioned header so examples remain isolated inside their preview areas."
        >
          <div className="grid gap-5 lg:grid-cols-2">
            {headerVariants.map((item) => (
              <HeaderPreviewCard
                key={item.name}
                title={item.name}
                description={`variant="${item.variant}"`}
                previewClassName={item.previewClassName}
              >
                <PreviewHeader
                  variant={item.variant}
                  showGlow={item.variant === 'glow'}
                  glowColor="rgba(45, 212, 191, 0.34)"
                  actionVariant={
                    item.variant === 'solid' || item.variant === 'glassLight'
                      ? 'outline'
                      : 'default'
                  }
                />
              </HeaderPreviewCard>
            ))}
          </div>
        </ShowcaseSection>

        <ShowcaseSection
          id="sizes"
          eyebrow="Size presets"
          title="Small, medium, and large headers share the same composition contract."
          description="Size controls height, padding, and the matching subcomponent scale."
        >
          <div className="grid gap-5 lg:grid-cols-3">
            {sizeExamples.map((item) => (
              <HeaderPreviewCard
                key={item.name}
                title={`size="${item.size}"`}
                description={`${item.name.toUpperCase()} preset`}
                previewClassName="bg-[linear-gradient(135deg,#164e63_0%,#134e4a_50%,#1f2937_100%)]"
                compact
              >
                <PreviewHeader
                  variant="glass"
                  size={item.size}
                  logoText={item.name.toUpperCase()}
                  showGlow
                  glowColor="rgba(125, 211, 252, 0.24)"
                />
              </HeaderPreviewCard>
            ))}
          </div>
        </ShowcaseSection>

        <ShowcaseSection
          id="behavior"
          eyebrow="Collapse behavior"
          title="Static, manual, and scroll-linked modes cover different layout needs."
          description="The fixed header on this page is the live scroll example: scroll down to see width collapse and hide-on-scroll behavior, then scroll up to reveal it."
        >
          <div className="grid gap-5 lg:grid-cols-3">
            {behaviorExamples.map((item) => (
              <HeaderPreviewCard
                key={item.name}
                title={item.name}
                description={item.description}
                previewClassName="bg-[linear-gradient(135deg,#18181b_0%,#134e4a_58%,#365314_100%)]"
              >
                <PreviewHeader
                  variant="glow"
                  collapseBehavior={item.collapseBehavior}
                  collapsed={item.collapsed}
                  showGlow
                  glowColor="rgba(74, 222, 128, 0.30)"
                  logoText={item.collapsed ? 'Compact' : 'Expanded'}
                  actionVariant="soft"
                />
              </HeaderPreviewCard>
            ))}
          </div>

          <div className="mt-5 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <BadgeCheck className="mt-1 size-5 shrink-0 text-teal-700" />
              <div>
                <h3 className="font-medium">Live scroll example</h3>
                <p className="mt-1 text-sm leading-6 text-zinc-600">
                  The page-level showcase header uses `collapseBehavior="scroll"`,
                  `hideOnScrollDown`, custom widths, glow, and `HeaderSpacer` to reserve space for
                  fixed positioning.
                </p>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection
          id="slots"
          eyebrow="Slots and actions"
          title="Logo, navigation, buttons, icons, active states, and disabled items compose together."
          description="The Header primitive owns the shell while subcomponents handle accessible interactive elements."
        >
          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <HeaderPreviewCard
              title="Full slot composition"
              description="Logo, nav, active item, disabled item, and mixed action variants."
              previewClassName="bg-[linear-gradient(135deg,#042f2e_0%,#155e75_55%,#422006_100%)]"
            >
              <PreviewHeader
                variant="glassDark"
                showGlow
                disabledItem
                glowColor="rgba(251, 191, 36, 0.28)"
                actionVariant="outline"
              />
            </HeaderPreviewCard>

            <div className="grid gap-4 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <div>
                <h3 className="font-medium">Button states</h3>
                <p className="mt-1 text-sm leading-6 text-zinc-600">
                  HeaderButton supports visual variants, loading state, and icon-only controls.
                </p>
              </div>

              <div className="grid gap-3">
                <div className="rounded-lg bg-zinc-950 p-4">
                  <div className="flex flex-wrap gap-2">
                    <HeaderButton>Default</HeaderButton>
                    <HeaderButton variant="ghost">Ghost</HeaderButton>
                    <HeaderButton variant="outline">Outline</HeaderButton>
                    <HeaderButton variant="soft">Soft</HeaderButton>
                    <HeaderButton size="icon" aria-label="Notifications">
                      <Bell className="size-4" />
                    </HeaderButton>
                    <HeaderButton loading>Saving</HeaderButton>
                  </div>
                </div>

                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
                  <div className="flex items-center gap-2 text-zinc-950">
                    <Menu className="size-4" />
                    Mobile nav trigger
                  </div>
                  <p className="mt-2 leading-6">
                    Navigation is hidden below the medium breakpoint, so a menu action can be
                    supplied through the actions slot.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <section className="px-4 pb-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
                Feature notes
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                Supported Header capabilities
              </h2>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {featureNotes.map((note) => (
                <div key={note} className="flex items-start gap-3 rounded-lg bg-zinc-50 p-4">
                  <BadgeCheck className="mt-0.5 size-4 shrink-0 text-teal-700" />
                  <span className="text-sm leading-6 text-zinc-700">{note}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

function IntroMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <Icon className="size-5 text-teal-700" />
      <div className="mt-4 text-3xl font-semibold">{value}</div>
      <div className="mt-1 text-sm text-zinc-500">{label}</div>
    </div>
  )
}

function ShowcaseSection({
  id,
  eyebrow,
  title,
  description,
  children,
}: {
  id: string
  eyebrow: string
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section id={id} className="px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
            {eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
          <p className="mt-3 text-base leading-7 text-zinc-600">{description}</p>
        </div>

        <div className="mt-8">{children}</div>
      </div>
    </section>
  )
}

function HeaderPreviewCard({
  title,
  description,
  previewClassName,
  compact = false,
  children,
}: {
  title: string
  description: string
  previewClassName: string
  compact?: boolean
  children: ReactNode
}) {
  return (
    <article className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 px-5 py-4">
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="mt-1 text-sm text-zinc-500">{description}</p>
      </div>
      <div
        className={`relative overflow-hidden ${compact ? 'min-h-36' : 'min-h-64'} ${previewClassName}`}
      >
        {children}
        <div className="absolute inset-x-6 bottom-6 grid gap-2">
          <div className="h-2 w-28 rounded-full bg-white/50" />
          <div className="h-2 w-44 max-w-full rounded-full bg-white/30" />
        </div>
      </div>
    </article>
  )
}

function PreviewHeader({
  variant,
  size = 'md',
  collapseBehavior = 'none',
  collapsed = false,
  showGlow = false,
  glowColor = 'rgba(20, 184, 166, 0.28)',
  logoText = 'Vewave',
  actionVariant = 'default',
  disabledItem = false,
}: HeaderPreviewProps) {
  const lightSurface = variant === 'glassLight' || variant === 'solid'
  const activeItemClassName = lightSurface ? 'bg-zinc-950 text-white hover:bg-zinc-900' : undefined
  const logoIconClassName = lightSurface
    ? 'grid size-7 place-items-center rounded-full bg-zinc-950 text-xs font-black text-white'
    : 'grid size-7 place-items-center rounded-full bg-white text-xs font-black text-zinc-950'

  return (
    <Header
      position="absolute"
      variant={variant}
      size={size}
      collapseBehavior={collapseBehavior}
      collapsed={collapsed}
      initialWidth="min(88%, 38rem)"
      collapsedWidth="min(58%, 25rem)"
      minWidth={280}
      topOffset={22}
      showGlow={showGlow}
      glowColor={glowColor}
      navigationLabel={`${logoText} preview`}
      logo={
        <HeaderLogo
          href={null}
          icon={<span className={logoIconClassName}>V</span>}
          text={logoText}
        />
      }
      navigation={
        <HeaderNav>
          <HeaderNavItem href="#" active className={activeItemClassName}>
            Home
          </HeaderNavItem>
          <HeaderNavItem href="#">Rooms</HeaderNavItem>
          <HeaderNavItem href="#" disabled={disabledItem}>
            Billing
          </HeaderNavItem>
        </HeaderNav>
      }
      actions={
        <>
          <HeaderButton variant="ghost" className="hidden sm:inline-flex">
            Sign in
          </HeaderButton>
          <HeaderButton variant={actionVariant} endIcon={<ArrowRight className="size-4" />}>
            Start
          </HeaderButton>
        </>
      }
    />
  )
}
