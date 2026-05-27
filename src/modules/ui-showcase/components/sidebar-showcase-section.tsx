import {
  Bell,
  Compass,
  Gauge,
  Home,
  MessageCircle,
  PanelLeft,
  Rocket,
  Settings,
  Sparkles,
  Video,
} from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'

import { CheckboxField, ControlCard, SelectField, SliderField } from '../ui'
import type {
  SidebarDensity,
  SidebarDesign,
  SidebarDragMode,
  SidebarFluidPreset,
  SidebarMotion,
  SidebarSize,
} from '@/components/sidebar'
import {
  SIDEBAR_FLUID_PRESETS,
  Sidebar,
  SidebarBrand,
  SidebarFooter,
  SidebarItem,
  SidebarSection,
} from '@/components/sidebar'
import { Avatar, AvatarFallback, Button } from '@/shared/ui'
import { cn } from '@/shared/lib/utils'

type SidebarDemoItemId = 'home' | 'content' | 'analytics' | 'community'

type SidebarDemoItem = {
  id: SidebarDemoItemId
  label: string
  icon: typeof Home
  badge?: string
}

type SidebarShowcaseState = {
  design: SidebarDesign
  size: SidebarSize
  density: SidebarDensity
  collapsed: boolean
  motion: SidebarMotion
  fluidPreset: SidebarFluidPreset
  hoverSize: number
  hoverScale: number
  activeHoverScale: number
  dragScale: number
  magneticStrength: number
  magneticVerticalStrength: number
  tiltStrength: number
  focusBlur: boolean
  focusBlurAmount: number
  focusDimOpacity: number
  liquidIntensity: number
  dragMode: SidebarDragMode
  activeItem: SidebarDemoItemId
}

const sidebarDesigns = [
  'liquidGlass',
  'glass',
  'fluent',
  'solid',
] as const satisfies ReadonlyArray<SidebarDesign>
const sidebarSizes = ['sm', 'md', 'lg'] as const satisfies ReadonlyArray<SidebarSize>
const sidebarDensities = ['comfortable', 'compact'] as const satisfies ReadonlyArray<SidebarDensity>
const sidebarMotionModes = ['fluid', 'soft', 'none'] as const satisfies ReadonlyArray<SidebarMotion>
const sidebarFluidPresets = [
  'subtle',
  'balanced',
  'expressive',
  'extreme',
] as const satisfies ReadonlyArray<SidebarFluidPreset>
const sidebarDragModes = [
  'none',
  'x',
  'y',
  'both',
] as const satisfies ReadonlyArray<SidebarDragMode>
const activeItems = [
  'home',
  'content',
  'analytics',
  'community',
] as const satisfies ReadonlyArray<SidebarDemoItemId>

const sidebarDemoItems: ReadonlyArray<SidebarDemoItem> = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'content', label: 'Content manager', icon: Video, badge: '12' },
  { id: 'analytics', label: 'Analytics', icon: Gauge },
  { id: 'community', label: 'Community', icon: MessageCircle },
]

const sidebarPresets = [
  {
    label: 'Liquid Studio',
    description: 'Fluid glass shell with a morphing active highlight.',
    state: createSidebarState({
      design: 'liquidGlass',
      size: 'md',
      density: 'comfortable',
      collapsed: false,
      motion: 'fluid',
      fluidPreset: 'expressive',
      dragMode: 'both',
      activeItem: 'content',
    }),
  },
  {
    label: 'Fluent Compact',
    description: 'Acrylic surface with tighter navigation rows.',
    state: createSidebarState({
      design: 'fluent',
      size: 'sm',
      density: 'compact',
      collapsed: false,
      motion: 'soft',
      fluidPreset: 'balanced',
      dragMode: 'none',
      activeItem: 'analytics',
    }),
  },
  {
    label: 'Icon Rail',
    description: 'Collapsed icon-only navigation with accessible labels.',
    state: createSidebarState({
      design: 'solid',
      size: 'sm',
      density: 'compact',
      collapsed: true,
      motion: 'soft',
      fluidPreset: 'subtle',
      dragMode: 'none',
      activeItem: 'home',
    }),
  },
] as const satisfies ReadonlyArray<{
  label: string
  description: string
  state: SidebarShowcaseState
}>

const designDescriptions: Record<SidebarDesign, string> = {
  liquidGlass:
    'Telegram/iOS-style liquid glass with one floating shell, subtle section platters, and a shared liquid selector that glides between items.',
  glass: 'Layered liquid glass, blur, reflection lines, and soft tint for rich studio shells.',
  fluent: 'Calmer acrylic-style panel with Mica-like depth and a focused active rail.',
  solid: 'Token-driven solid app shell for dense operational interfaces.',
}

function fluidPresetValues(fluidPreset: SidebarFluidPreset) {
  return SIDEBAR_FLUID_PRESETS[fluidPreset]
}

function createSidebarState(
  state: Omit<
    SidebarShowcaseState,
    | 'hoverSize'
    | 'hoverScale'
    | 'activeHoverScale'
    | 'dragScale'
    | 'magneticStrength'
    | 'magneticVerticalStrength'
    | 'tiltStrength'
    | 'focusBlur'
    | 'focusBlurAmount'
    | 'focusDimOpacity'
    | 'liquidIntensity'
    | 'dragMode'
  > & {
    dragMode?: SidebarDragMode
  },
): SidebarShowcaseState {
  const preset = fluidPresetValues(state.fluidPreset)

  return {
    ...state,
    hoverSize: preset.hoverSize,
    hoverScale: preset.hoverScale,
    activeHoverScale: preset.activeHoverScale,
    dragScale: preset.dragScale,
    magneticStrength: preset.magneticStrength,
    magneticVerticalStrength: preset.magneticVerticalStrength,
    tiltStrength: preset.tiltStrength,
    focusBlur: preset.focusBlur,
    focusBlurAmount: preset.focusBlurAmount,
    focusDimOpacity: preset.focusDimOpacity,
    liquidIntensity: preset.liquidIntensity,
    dragMode: state.dragMode ?? preset.dragMode,
  }
}

const initialState: SidebarShowcaseState = {
  design: 'liquidGlass',
  size: 'md',
  density: 'comfortable',
  collapsed: false,
  motion: 'fluid',
  fluidPreset: 'expressive',
  activeItem: 'content',
  ...fluidPresetValues('expressive'),
}

const sidebarPropRows = [
  'design',
  'size',
  'density',
  'collapsed',
  'motion',
  'fluidPreset',
  'hoverSize',
  'hoverScale',
  'activeHoverScale',
  'dragScale',
  'magneticStrength',
  'magneticVerticalStrength',
  'tiltStrength',
  'focusBlur',
  'focusBlurAmount',
  'focusDimOpacity',
  'liquidIntensity',
  'dragMode',
] as const satisfies ReadonlyArray<keyof SidebarShowcaseState>

export function SidebarShowcaseSection() {
  const [state, setState] = useState<SidebarShowcaseState>(initialState)

  const updateState = <TKey extends keyof SidebarShowcaseState>(
    key: TKey,
    value: SidebarShowcaseState[TKey],
  ) => {
    setState((current) => ({ ...current, [key]: value }))
  }

  const updateFluidPreset = (fluidPreset: SidebarFluidPreset) => {
    setState((current) => ({
      ...current,
      fluidPreset,
      ...fluidPresetValues(fluidPreset),
    }))
  }

  return (
    <section id="sidebar" className="grid gap-6 rounded-lg border border-zinc-200 bg-white p-5">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-900/10 bg-teal-50 px-3 py-1 text-sm font-medium text-teal-800">
            <PanelLeft className="size-4" />
            Sidebar component
          </div>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950">
            Decomposable sidebar variants
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
            A real Sidebar instance driven by controls, plus compact comparisons for liquid glass,
            glass, fluent, and solid surfaces. The liquid variant keeps item content sharp while a
            single selector moves through the nav group and the shell catches a subtle desktop
            shine.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {sidebarPresets.map((preset) => (
            <Button
              key={preset.label}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setState(preset.state)}
              className="bg-white"
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <div className="grid gap-4">
          <ControlCard title="Appearance">
            <SelectField
              label="Design"
              value={state.design}
              options={sidebarDesigns}
              onChange={(value) => updateState('design', value)}
            />
            <SelectField
              label="Size"
              value={state.size}
              options={sidebarSizes}
              onChange={(value) => updateState('size', value)}
            />
            <SelectField
              label="Density"
              value={state.density}
              options={sidebarDensities}
              onChange={(value) => updateState('density', value)}
            />
          </ControlCard>

          <ControlCard title="Behavior">
            <SelectField
              label="Active item"
              value={state.activeItem}
              options={activeItems}
              onChange={(value) => updateState('activeItem', value)}
            />
            <SelectField
              label="Motion"
              value={state.motion}
              options={sidebarMotionModes}
              onChange={(value) => updateState('motion', value)}
            />
            <SelectField
              label="Fluid preset"
              value={state.fluidPreset}
              options={sidebarFluidPresets}
              onChange={updateFluidPreset}
            />
            <SelectField
              label="Drag mode"
              value={state.dragMode}
              options={sidebarDragModes}
              onChange={(value) => updateState('dragMode', value)}
            />
            <CheckboxField
              label="Collapsed"
              checked={state.collapsed}
              onChange={(checked) => updateState('collapsed', checked)}
            />
            <CheckboxField
              label="Focus blur"
              checked={state.focusBlur}
              onChange={(checked) => updateState('focusBlur', checked)}
            />
          </ControlCard>

          <ControlCard title="Fluid interaction props">
            <SliderField
              label="Hover size"
              value={state.hoverSize}
              min={0}
              max={24}
              step={1}
              unit="px"
              onChange={(value) => updateState('hoverSize', value)}
            />
            <SliderField
              label="Hover scale"
              value={state.hoverScale}
              min={1}
              max={1.14}
              step={0.005}
              onChange={(value) => updateState('hoverScale', value)}
            />
            <SliderField
              label="Active hover scale"
              value={state.activeHoverScale}
              min={1}
              max={1.1}
              step={0.005}
              onChange={(value) => updateState('activeHoverScale', value)}
            />
            <SliderField
              label="Drag scale"
              value={state.dragScale}
              min={1}
              max={1.22}
              step={0.005}
              onChange={(value) => updateState('dragScale', value)}
            />
            <SliderField
              label="Magnetic strength"
              value={state.magneticStrength}
              min={0}
              max={24}
              step={1}
              onChange={(value) => updateState('magneticStrength', value)}
            />
            <SliderField
              label="Vertical magnet"
              value={state.magneticVerticalStrength}
              min={0}
              max={16}
              step={1}
              onChange={(value) => updateState('magneticVerticalStrength', value)}
            />
            <SliderField
              label="Tilt strength"
              value={state.tiltStrength}
              min={0}
              max={8}
              step={0.1}
              unit="deg"
              onChange={(value) => updateState('tiltStrength', value)}
            />
            <SliderField
              label="Focus blur"
              value={state.focusBlurAmount}
              min={0}
              max={10}
              step={0.25}
              unit="px"
              onChange={(value) => updateState('focusBlurAmount', value)}
            />
            <SliderField
              label="Focus dim opacity"
              value={state.focusDimOpacity}
              min={0.2}
              max={1}
              step={0.01}
              onChange={(value) => updateState('focusDimOpacity', value)}
            />
            <SliderField
              label="Liquid intensity"
              value={state.liquidIntensity}
              min={0.3}
              max={2}
              step={0.05}
              onChange={(value) => updateState('liquidIntensity', value)}
            />
          </ControlCard>

          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-600">
            <div className="font-medium text-zinc-950">Current design intent</div>
            <p className="mt-1">{designDescriptions[state.design]}</p>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-zinc-950 p-4 text-sm text-zinc-100 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="font-medium">Current compound API</div>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[0.68rem] text-zinc-300">
                src/components/sidebar
              </span>
            </div>
            <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs leading-5 text-zinc-300">
              {`<Sidebar
  design="${state.design}"
  size="${state.size}"
  density="${state.density}"
  motion="${state.motion}"
  fluidPreset="${state.fluidPreset}"
  hoverSize={${state.hoverSize}}
  hoverScale={${state.hoverScale}}
  activeHoverScale={${state.activeHoverScale}}
  dragScale={${state.dragScale}}
  magneticStrength={${state.magneticStrength}}
  magneticVerticalStrength={${state.magneticVerticalStrength}}
  tiltStrength={${state.tiltStrength}}
  focusBlur={${state.focusBlur}}
  focusBlurAmount={${state.focusBlurAmount}}
  focusDimOpacity={${state.focusDimOpacity}}
  liquidIntensity={${state.liquidIntensity}}
  dragMode="${state.dragMode}"${state.collapsed ? ' collapsed' : ''}
>
  <SidebarBrand title="Vewave Studio" />
  <SidebarSection title="Workspace">
    <SidebarItem active icon={<Home />}>Home</SidebarItem>
  </SidebarSection>
  <SidebarFooter />
</Sidebar>`}
            </pre>
          </div>
        </div>

        <div className="grid min-w-0 gap-5">
          <SidebarPreviewCanvas
            state={state}
            onActiveChange={(value) => updateState('activeItem', value)}
          />
          <SidebarPropsMatrix state={state} />
          <SidebarVariantComparison activeItem={state.activeItem} />
        </div>
      </div>
    </section>
  )
}

function SidebarPreviewCanvas({
  state,
  onActiveChange,
}: {
  state: SidebarShowcaseState
  onActiveChange: (value: SidebarDemoItemId) => void
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-[radial-gradient(circle_at_20%_10%,rgba(45,212,191,0.18),transparent_24rem),radial-gradient(circle_at_80%_80%,rgba(14,165,233,0.16),transparent_20rem),linear-gradient(135deg,#f8fafc,#eef4f1)] p-4 shadow-sm">
      <div className="overflow-x-auto [scrollbar-width:thin]">
        <div className="grid min-w-[46rem] gap-4 lg:grid-cols-[auto_minmax(0,1fr)]">
          <DemoSidebar
            design={state.design}
            size={state.size}
            density={state.density}
            collapsed={state.collapsed}
            motionMode={state.motion}
            fluidPreset={state.fluidPreset}
            hoverSize={state.hoverSize}
            hoverScale={state.hoverScale}
            activeHoverScale={state.activeHoverScale}
            dragScale={state.dragScale}
            magneticStrength={state.magneticStrength}
            magneticVerticalStrength={state.magneticVerticalStrength}
            tiltStrength={state.tiltStrength}
            focusBlur={state.focusBlur}
            focusBlurAmount={state.focusBlurAmount}
            focusDimOpacity={state.focusDimOpacity}
            liquidIntensity={state.liquidIntensity}
            dragMode={state.dragMode}
            activeItem={state.activeItem}
            onActiveChange={onActiveChange}
            className="!min-h-[31rem]"
          />

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24 }}
            className="min-w-0 rounded-xl border border-white/70 bg-white/78 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.12)] backdrop-blur"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
                  Preview surface
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">
                  {state.activeItem === 'content'
                    ? 'Content manager'
                    : sidebarDemoItems.find((item) => item.id === state.activeItem)?.label}
                </h3>
              </div>
              <div className="rounded-full bg-zinc-950 px-3 py-1 text-xs font-medium text-white">
                {state.design}
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {['Uploads', 'Drafts', 'Scheduled'].map((label, index) => (
                <div key={label} className="rounded-lg border border-zinc-200 bg-white p-4">
                  <div className="text-2xl font-semibold text-zinc-950">{18 + index * 7}</div>
                  <div className="mt-1 text-sm text-zinc-500">{label}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-3">
              {[
                'Audience retention is up 8%',
                'Three comments need review',
                'Next publish window opens at 18:00',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600"
                >
                  <Sparkles className="size-4 text-teal-600" />
                  {item}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function SidebarVariantComparison({ activeItem }: { activeItem: SidebarDemoItemId }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
      {sidebarDesigns.map((design) => (
        <div key={design} className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold capitalize text-zinc-950">{design}</div>
            <div className="rounded-full bg-white px-2 py-0.5 text-[0.68rem] text-zinc-500 shadow-sm">
              variant
            </div>
          </div>
          <DemoSidebar
            design={design}
            size="sm"
            density="compact"
            collapsed={false}
            motionMode="none"
            fluidPreset="subtle"
            hoverSize={3}
            hoverScale={1.025}
            activeHoverScale={1.015}
            dragScale={1.045}
            magneticStrength={4}
            magneticVerticalStrength={2.5}
            tiltStrength={1.8}
            focusBlur
            focusBlurAmount={2}
            focusDimOpacity={0.72}
            liquidIntensity={0.72}
            dragMode="none"
            activeItem={activeItem}
            className="!min-h-[20rem] w-full"
          />
        </div>
      ))}
    </div>
  )
}

function DemoSidebar({
  design,
  size,
  density,
  collapsed,
  motionMode,
  fluidPreset,
  hoverSize,
  hoverScale,
  activeHoverScale,
  dragScale,
  magneticStrength,
  magneticVerticalStrength,
  tiltStrength,
  focusBlur,
  focusBlurAmount,
  focusDimOpacity,
  liquidIntensity,
  dragMode,
  activeItem,
  onActiveChange,
  className,
}: {
  design: SidebarDesign
  size: SidebarSize
  density: SidebarDensity
  collapsed: boolean
  motionMode: SidebarMotion
  fluidPreset: SidebarFluidPreset
  hoverSize: number
  hoverScale: number
  activeHoverScale: number
  dragScale: number
  magneticStrength: number
  magneticVerticalStrength: number
  tiltStrength: number
  focusBlur: boolean
  focusBlurAmount: number
  focusDimOpacity: number
  liquidIntensity: number
  dragMode: SidebarDragMode
  activeItem: SidebarDemoItemId
  onActiveChange?: (value: SidebarDemoItemId) => void
  className?: string
}) {
  return (
    <Sidebar
      design={design}
      size={size}
      density={density}
      collapsed={collapsed}
      motion={motionMode}
      fluidPreset={fluidPreset}
      hoverSize={hoverSize}
      hoverScale={hoverScale}
      activeHoverScale={activeHoverScale}
      dragScale={dragScale}
      magneticStrength={magneticStrength}
      magneticVerticalStrength={magneticVerticalStrength}
      tiltStrength={tiltStrength}
      focusBlur={focusBlur}
      focusBlurAmount={focusBlurAmount}
      focusDimOpacity={focusDimOpacity}
      liquidIntensity={liquidIntensity}
      dragMode={dragMode}
      aria-label={`${design} sidebar preview`}
      className={cn('shrink-0', className)}
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <SidebarBrand
          visual={
            <Avatar className="size-11 border border-white/60 bg-teal-950 text-white shadow-sm">
              <AvatarFallback className="bg-teal-950 text-white">VW</AvatarFallback>
            </Avatar>
          }
          title="Vewave Studio"
          subtitle="Creator workspace"
          meta="Live shell"
        />

        <SidebarSection title="Workspace">
          {sidebarDemoItems.map((item) => {
            const Icon = item.icon

            return (
              <SidebarItem
                key={item.id}
                type="button"
                active={item.id === activeItem}
                icon={<Icon />}
                badge={item.badge}
                onClick={() => onActiveChange?.(item.id)}
              >
                {item.label}
              </SidebarItem>
            )
          })}
        </SidebarSection>

        <SidebarSection title="Automation">
          <SidebarItem type="button" icon={<Rocket />}>
            Launch queue
          </SidebarItem>
          <SidebarItem type="button" icon={<Bell />} disabled>
            Alerts
          </SidebarItem>
        </SidebarSection>
      </div>

      <SidebarFooter>
        <SidebarItem type="button" icon={<Settings />}>
          Settings
        </SidebarItem>
        <SidebarItem type="button" icon={<Compass />}>
          Explore
        </SidebarItem>
      </SidebarFooter>
    </Sidebar>
  )
}

function SidebarPropsMatrix({ state }: { state: SidebarShowcaseState }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-zinc-950">Props passed to Sidebar</h3>
          <p className="mt-1 text-xs leading-5 text-zinc-500">
            Every configurable root prop is wired into the live preview.
          </p>
        </div>
        <div className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-500">
          {sidebarPropRows.length} props
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {sidebarPropRows.map((key) => (
          <div key={key} className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2">
            <div className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-zinc-400">
              {key}
            </div>
            <div className="mt-1 truncate text-sm font-medium text-zinc-900">
              {String(state[key])}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
