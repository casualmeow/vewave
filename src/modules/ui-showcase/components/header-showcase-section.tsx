import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, BadgeCheck, Menu, RotateCcw, Sparkles } from 'lucide-react'
import { HEADER_DEFAULT_STATE } from '../constants'
import { presets } from '../mocks'
import { CheckboxField, ControlCard, SelectField, SliderField } from '../ui/controls'

import {
  Header,
  HeaderButton,
  HeaderLogo,
  HeaderNav,
  HeaderNavItem,
  HeaderSpacer,
  type HeaderBlurIntensity,
  type HeaderCollapseBehavior,
  type HeaderMotionPreset,
  type HeaderSize,
  type HeaderVariant,
} from '@/components/header'
import { ResizableCard, type ExpandableCardItem } from '@/components/resizable-card'
import { Button } from '@/shared/ui'

type HeaderButtonVariant = 'default' | 'ghost' | 'outline' | 'soft'
type ActiveNavItem = 'overview' | 'rooms' | 'studio' | 'billing'

type HeaderPlaygroundState = {
  variant: HeaderVariant
  size: HeaderSize
  blurIntensity: HeaderBlurIntensity
  showGlow: boolean
  glowColor: string
  initialWidth: number
  collapsedWidth: number
  topOffset: number
  borderRadiusExpanded: number
  borderRadiusCollapsed: number
  collapseBehavior: HeaderCollapseBehavior
  collapsed: boolean
  hideNavOnCollapse: boolean
  hideOnScrollDown: boolean
  scrollDistance: number
  collapseThreshold: number
  motionPreset: HeaderMotionPreset
  smoothScrollMotion: boolean
  showLogo: boolean
  showNavigation: boolean
  showActions: boolean
  activeNavItem: ActiveNavItem
  showDisabledNavItem: boolean
  loadingPrimaryAction: boolean
  primaryActionVariant: HeaderButtonVariant
}

const variants: Array<HeaderVariant> = [
  'glass',
  'glassDark',
  'glassLight',
  'solid',
  'gradient',
  'glow',
]
const sizes: Array<HeaderSize> = ['sm', 'md', 'lg']
const blurIntensities: Array<HeaderBlurIntensity> = ['none', 'sm', 'md', 'lg', 'xl']
const collapseBehaviors: Array<HeaderCollapseBehavior> = ['scroll', 'manual', 'none']
const motionPresets: Array<HeaderMotionPreset> = ['gentle', 'spring', 'smooth', 'snappy', 'bouncy']
const actionVariants: Array<HeaderButtonVariant> = ['default', 'ghost', 'outline', 'soft']
const activeNavItems: Array<ActiveNavItem> = ['overview', 'rooms', 'studio', 'billing']

const previewItems: Array<ExpandableCardItem> = [
  {
    id: 'header-frame',
    title: 'Live Header preview surface',
    description: 'Open this resizable card to inspect the Header in a local scroll viewport.',
    ctaText: 'Open preview',
    content: null,
  },
]

const navItems: Array<{ id: ActiveNavItem; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'rooms', label: 'Rooms' },
  { id: 'studio', label: 'Studio' },
  { id: 'billing', label: 'Billing' },
]

export function HeaderShowcaseSection() {
  const [state, setState] = useState<HeaderPlaygroundState>(HEADER_DEFAULT_STATE)
  const [resetSignal, setResetSignal] = useState(0)

  const updateState = <TKey extends keyof HeaderPlaygroundState>(
    key: TKey,
    value: HeaderPlaygroundState[TKey],
  ) => {
    setState((current) => ({
      ...current,
      [key]: value,
    }))
  }

  const applyPreset = (preset: Partial<HeaderPlaygroundState>) => {
    setState((current) => ({
      ...current,
      ...preset,
    }))
    setResetSignal((current) => current + 1)
  }

  const resetPlayground = () => {
    setState(HEADER_DEFAULT_STATE)
    setResetSignal((current) => current + 1)
  }

  const currentProps = useMemo(
    () =>
      JSON.stringify(
        {
          variant: state.variant,
          size: state.size,
          collapseBehavior: state.collapseBehavior,
          collapsed: state.collapseBehavior === 'manual' ? state.collapsed : undefined,
          blurIntensity: state.blurIntensity,
          showGlow: state.showGlow,
          initialWidth: `${state.initialWidth}%`,
          collapsedWidth: `${state.collapsedWidth}%`,
          slots: {
            logo: state.showLogo,
            navigation: state.showNavigation,
            actions: state.showActions,
          },
        },
        null,
        2,
      ),
    [state],
  )

  return (
    <section id="header" className="grid gap-6 rounded-lg border border-zinc-200 bg-zinc-50 p-5">
      <SectionHeader
        eyebrow="Component playground"
        title="Header"
        description="A single prop-driven Header preview rendered in the page React tree and hosted by ResizableCard for responsive inspection."
      />

      <div className="grid gap-6 xl:grid-cols-[24rem_minmax(0,1fr)]">
        <aside className="space-y-4">
          <ControlCard title="Presets">
            <div className="grid gap-2">
              {presets.map((preset) => (
                <Button
                  key={preset.name}
                  type="button"
                  variant="outline"
                  className="h-auto justify-start whitespace-normal px-3 py-3 text-left"
                  onClick={() => applyPreset(preset.state)}
                >
                  <span>
                    <span className="block font-medium">{preset.name}</span>
                    <span className="mt-1 block text-xs font-normal text-zinc-500">
                      {preset.description}
                    </span>
                  </span>
                </Button>
              ))}
            </div>
          </ControlCard>

          <ControlCard title="Appearance">
            <SelectField
              label="Variant"
              value={state.variant}
              options={variants}
              onChange={(value) => updateState('variant', value)}
            />
            <SelectField
              label="Size"
              value={state.size}
              options={sizes}
              onChange={(value) => updateState('size', value)}
            />
            <SelectField
              label="Blur"
              value={state.blurIntensity}
              options={blurIntensities}
              onChange={(value) => updateState('blurIntensity', value)}
            />
            <CheckboxField
              label="Glow"
              checked={state.showGlow}
              onChange={(checked) => updateState('showGlow', checked)}
            />
            <label className="grid gap-2 text-sm font-medium">
              Glow color
              <input
                type="color"
                value={state.glowColor}
                className="h-9 w-full rounded-md border border-zinc-200 bg-white p-1"
                onChange={(event) => updateState('glowColor', event.target.value)}
              />
            </label>
          </ControlCard>

          <ControlCard title="Geometry">
            <SliderField
              label="Initial width"
              value={state.initialWidth}
              min={56}
              max={98}
              unit="%"
              onChange={(value) => updateState('initialWidth', value)}
            />
            <SliderField
              label="Collapsed width"
              value={state.collapsedWidth}
              min={34}
              max={92}
              unit="%"
              onChange={(value) => updateState('collapsedWidth', value)}
            />
            <SliderField
              label="Top offset"
              value={state.topOffset}
              min={0}
              max={36}
              unit="px"
              onChange={(value) => updateState('topOffset', value)}
            />
            <SliderField
              label="Expanded radius"
              value={state.borderRadiusExpanded}
              min={0}
              max={36}
              unit="px"
              onChange={(value) => updateState('borderRadiusExpanded', value)}
            />
            <SliderField
              label="Collapsed radius"
              value={state.borderRadiusCollapsed}
              min={16}
              max={999}
              unit="px"
              onChange={(value) => updateState('borderRadiusCollapsed', value)}
            />
          </ControlCard>

          <ControlCard title="Behavior">
            <SelectField
              label="Collapse behavior"
              value={state.collapseBehavior}
              options={collapseBehaviors}
              onChange={(value) => updateState('collapseBehavior', value)}
            />
            {state.collapseBehavior === 'manual' ? (
              <CheckboxField
                label="Collapsed"
                checked={state.collapsed}
                onChange={(checked) => updateState('collapsed', checked)}
              />
            ) : null}
            <CheckboxField
              label="Hide nav on collapse"
              checked={state.hideNavOnCollapse}
              onChange={(checked) => updateState('hideNavOnCollapse', checked)}
            />
            <CheckboxField
              label="Hide on scroll down"
              checked={state.hideOnScrollDown}
              onChange={(checked) => updateState('hideOnScrollDown', checked)}
            />
            <SliderField
              label="Scroll distance"
              value={state.scrollDistance}
              min={80}
              max={520}
              step={10}
              unit="px"
              onChange={(value) => updateState('scrollDistance', value)}
            />
            <SliderField
              label="Collapse threshold"
              value={state.collapseThreshold}
              min={0.1}
              max={0.95}
              step={0.05}
              onChange={(value) => updateState('collapseThreshold', value)}
            />
          </ControlCard>

          <ControlCard title="Motion and slots">
            <SelectField
              label="Motion preset"
              value={state.motionPreset}
              options={motionPresets}
              onChange={(value) => updateState('motionPreset', value)}
            />
            <CheckboxField
              label="Smooth scroll motion"
              checked={state.smoothScrollMotion}
              onChange={(checked) => updateState('smoothScrollMotion', checked)}
            />
            <CheckboxField
              label="Logo"
              checked={state.showLogo}
              onChange={(checked) => updateState('showLogo', checked)}
            />
            <CheckboxField
              label="Navigation"
              checked={state.showNavigation}
              onChange={(checked) => updateState('showNavigation', checked)}
            />
            <CheckboxField
              label="Actions"
              checked={state.showActions}
              onChange={(checked) => updateState('showActions', checked)}
            />
            <SelectField
              label="Active nav item"
              value={state.activeNavItem}
              options={activeNavItems}
              onChange={(value) => updateState('activeNavItem', value)}
            />
            <CheckboxField
              label="Disabled billing item"
              checked={state.showDisabledNavItem}
              onChange={(checked) => updateState('showDisabledNavItem', checked)}
            />
            <SelectField
              label="Primary action"
              value={state.primaryActionVariant}
              options={actionVariants}
              onChange={(value) => updateState('primaryActionVariant', value)}
            />
            <CheckboxField
              label="Primary action loading"
              checked={state.loadingPrimaryAction}
              onChange={(checked) => updateState('loadingPrimaryAction', checked)}
            />
          </ControlCard>

          <Button type="button" variant="ghost" className="w-full" onClick={resetPlayground}>
            <RotateCcw className="size-4" />
            Reset Header
          </Button>
        </aside>

        <div className="min-w-0 space-y-5">
          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <BadgeCheck className="mt-1 size-5 shrink-0 text-teal-700" />
              <div>
                <h3 className="font-medium">Same-document preview host</h3>
                <p className="mt-1 text-sm leading-6 text-zinc-600">
                  Open the card below. The Header is positioned over a local scroll container, so
                  collapse and hide-on-scroll behavior are measured in the same document. Drag the
                  lower-right handle after opening to resize the preview.
                </p>
              </div>
            </div>

            <div className="mt-5">
              <ResizableCard
                items={previewItems}
                variant="outline"
                size="lg"
                compactSize={{ minHeight: '10rem' }}
                expandedSize={{
                  initialWidth: 760,
                  initialHeight: 680,
                  minWidth: 520,
                  minHeight: 420,
                  maxWidth: 1320,
                  maxHeight: 920,
                  viewportPadding: 18,
                }}
                renderMedia={() => (
                  <div className="grid size-16 place-items-center rounded-lg bg-zinc-950 text-white">
                    <Sparkles className="size-6" />
                  </div>
                )}
                renderAction={() => (
                  <span className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white">
                    Open preview
                  </span>
                )}
                renderContent={() => (
                  <div className="flex h-full min-h-[28rem] flex-col gap-3">
                    <div className="shrink-0 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
                      Drag the lower-right handle to resize this live preview, then scroll inside
                      the panel to test collapse and hide-on-scroll behavior.
                    </div>
                    <div className="min-h-0 flex-1">
                      <HeaderPreviewSurface state={state} resetSignal={resetSignal} />
                    </div>
                  </div>
                )}
              />
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-zinc-950 p-5 text-white shadow-sm">
            <div className="font-semibold">Current Header props</div>
            <pre className="mt-4 max-h-72 overflow-auto rounded-md bg-black/35 p-4 text-xs leading-5 text-teal-50">
              {currentProps}
            </pre>
          </div>
        </div>
      </div>
    </section>
  )
}

function HeaderPreviewSurface({
  state,
  resetSignal,
}: {
  state: HeaderPlaygroundState
  resetSignal: number
}) {
  const previewScrollRef = useRef<HTMLDivElement>(null)
  const lightSurface = state.variant === 'glassLight' || state.variant === 'solid'
  const logoIconClassName = lightSurface
    ? 'grid size-8 place-items-center rounded-full bg-zinc-950 text-xs font-black text-white'
    : 'grid size-8 place-items-center rounded-full bg-white text-xs font-black text-zinc-950'

  useEffect(() => {
    previewScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' })
  }, [resetSignal])

  return (
    <div className="relative h-full min-h-[28rem] overflow-hidden rounded-lg bg-zinc-950">
      <Header
        position="absolute"
        variant={state.variant}
        size={state.size}
        initialWidth={state.initialWidth}
        collapsedWidth={state.collapsedWidth}
        minWidth="min(92%, 20rem)"
        maxWidth="68rem"
        scrollDistance={state.scrollDistance}
        collapseThreshold={state.collapseThreshold}
        collapseBehavior={state.collapseBehavior}
        collapsed={state.collapseBehavior === 'manual' ? state.collapsed : undefined}
        hideNavOnCollapse={state.hideNavOnCollapse}
        navigationLabel="Playground preview"
        blurIntensity={state.blurIntensity}
        borderRadiusExpanded={state.borderRadiusExpanded}
        borderRadiusCollapsed={state.borderRadiusCollapsed}
        topOffset={state.topOffset}
        showGlow={state.showGlow}
        glowColor={state.glowColor}
        motionPreset={state.motionPreset}
        smoothScrollMotion={state.smoothScrollMotion}
        hideOnScrollDown={state.hideOnScrollDown}
        revealAtTop={24}
        scrollContainerRef={previewScrollRef}
        logo={
          state.showLogo ? (
            <HeaderLogo
              href={null}
              icon={<span className={logoIconClassName}>V</span>}
              text="Vewave"
            />
          ) : undefined
        }
        navigation={
          state.showNavigation ? (
            <HeaderNav>
              {navItems.map((item) => (
                <HeaderNavItem
                  key={item.id}
                  href="#"
                  active={state.activeNavItem === item.id}
                  disabled={item.id === 'billing' && state.showDisabledNavItem}
                  onClick={(event) => event.preventDefault()}
                >
                  {item.label}
                </HeaderNavItem>
              ))}
            </HeaderNav>
          ) : undefined
        }
        actions={
          state.showActions ? (
            <>
              <HeaderButton variant="ghost" className="hidden sm:inline-flex">
                Sign in
              </HeaderButton>
              <HeaderButton
                variant={state.primaryActionVariant}
                loading={state.loadingPrimaryAction}
                endIcon={<ArrowRight className="size-4" />}
              >
                Start
              </HeaderButton>
              <HeaderButton size="icon" variant="soft" aria-label="Open navigation menu">
                <Menu className="size-4" />
              </HeaderButton>
            </>
          ) : undefined
        }
      />

      <div
        ref={previewScrollRef}
        className="h-full overflow-y-auto overscroll-contain bg-[radial-gradient(circle_at_18%_10%,rgba(45,212,191,0.38),transparent_28%),linear-gradient(135deg,#0f172a_0%,#134e4a_46%,#312e81_100%)]"
      >
        <div className="min-h-[82rem]">
          <HeaderSpacer size={state.size} topOffset={state.topOffset} extraOffset={12} />
          <PreviewContent />
        </div>
      </div>
    </div>
  )
}

function PreviewContent() {
  return (
    <div className="px-5 pb-12 text-white sm:px-8">
      <section className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
        <div className="rounded-lg border border-white/10 bg-white/[0.08] p-6 shadow-2xl shadow-black/20 backdrop-blur-md">
          <h3 className="max-w-2xl text-4xl font-semibold tracking-tight">
            Isolated live Header viewport
          </h3>
          <p className="mt-4 max-w-2xl leading-7 text-zinc-200">
            The Header receives this preview panel as its scroll source, so collapse, thresholds,
            smoothing, and hide-on-scroll behavior update from the same document tree.
          </p>
          <div className="mt-8 aspect-video rounded-lg bg-[linear-gradient(135deg,#f8fafc_0%,#a7f3d0_38%,#38bdf8_74%,#4338ca_100%)] p-4">
            <div className="flex h-full flex-col justify-between rounded-md border border-white/40 bg-white/25 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="h-3 w-32 rounded-full bg-zinc-950/40" />
                <div className="size-8 rounded-full bg-white/75" />
              </div>
              <div className="space-y-3">
                <div className="h-4 w-52 rounded-full bg-zinc-950/50" />
                <div className="h-3 w-72 max-w-full rounded-full bg-zinc-950/35" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {['Queued video', 'Room presence', 'Publish checks'].map((item, index) => (
            <div
              key={item}
              className="rounded-lg border border-white/10 bg-black/20 p-5 backdrop-blur-md"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{item}</span>
                <span className="rounded-full bg-white/12 px-2.5 py-1 text-xs text-teal-100">
                  0{index + 1}
                </span>
              </div>
              <div className="mt-5 space-y-2">
                <div className="h-2 rounded-full bg-white/25" />
                <div className="h-2 w-3/4 rounded-full bg-white/15" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {['Configure', 'Preview', 'Launch'].map((item) => (
          <div
            key={item}
            className="min-h-44 rounded-lg border border-white/10 bg-white/[0.07] p-5"
          >
            <div className="text-sm font-medium text-teal-100">{item}</div>
            <div className="mt-10 space-y-2">
              <div className="h-2 rounded-full bg-white/35" />
              <div className="h-2 w-2/3 rounded-full bg-white/20" />
            </div>
          </div>
        ))}
      </section>

      <section className="mt-8 rounded-lg border border-white/10 bg-black/20 p-6 backdrop-blur-md">
        <h3 className="text-2xl font-semibold tracking-tight">Scroll depth for behavior testing</h3>
        <p className="mt-3 max-w-2xl leading-7 text-zinc-300">
          This extra content gives the preview a real scrolling page for collapse, threshold,
          smoothing, and hide-on-scroll settings.
        </p>
        <div className="mt-8 grid gap-3">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="h-12 rounded-md border border-white/10 bg-white/[0.06]" />
          ))}
        </div>
      </section>
    </div>
  )
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      <p className="mt-3 text-base leading-7 text-zinc-600">{description}</p>
    </div>
  )
}
