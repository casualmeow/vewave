import {
  BookOpen,
  Boxes,
  Cable,
  Code2,
  Component,
  FileCode2,
  GitBranch,
  GalleryHorizontalEnd,
  Layers3,
  Paintbrush,
  PanelLeft,
  Route,
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import type { ComponentDocRoute } from './component-docs-content'
import type { SharedUiDocRoute } from './shared-ui-docs-nav'

export type DocsNavItem = {
  title: string
  description: string
  to: '/docs' | '/docs/ui' | ComponentDocRoute | SharedUiDocRoute
  icon: LucideIcon
  exact?: boolean
}

export const docsNavItems = [
  {
    title: 'Overview',
    description: 'Project setup, architecture, and backend integration.',
    to: '/docs',
    icon: BookOpen,
    exact: true,
  },
  {
    title: 'UI',
    description: 'Reusable UI components, primitives, and showcase workflow.',
    to: '/docs/ui',
    icon: Component,
    exact: false,
  },
  {
    title: 'Components',
    description: 'UI-kit style API docs for reusable components.',
    to: '/docs/ui/components',
    icon: FileCode2,
    exact: false,
  },
  {
    title: 'Glass',
    description: 'Shared liquid-glass presets, hooks, and pointer interaction helpers.',
    to: '/docs/ui/components/glass',
    icon: Sparkles,
    exact: true,
  },
  {
    title: 'Header',
    description: 'Scroll-aware top navigation component with liquid glass variants.',
    to: '/docs/ui/components/header',
    icon: Route,
    exact: true,
  },
  {
    title: 'Tabs',
    description: 'Radix tabs with solid, glass, liquid, and Telegram-style surfaces.',
    to: '/docs/ui/components/tabs',
    icon: GalleryHorizontalEnd,
    exact: true,
  },
  {
    title: 'ResizableCard',
    description: 'Expandable card, resize, and motion API.',
    to: '/docs/ui/components/resizable-card',
    icon: Paintbrush,
    exact: true,
  },
  {
    title: 'Sidebar',
    description:
      'Composable shell navigation with liquid glass, glass, fluent, and solid variants.',
    to: '/docs/ui/components/sidebar',
    icon: PanelLeft,
    exact: true,
  },
  {
    title: 'Shared UI',
    description: 'Low-level primitives with one page per shared component.',
    to: '/docs/ui/components/shared',
    icon: Layers3,
    exact: false,
  },
] as const satisfies ReadonlyArray<DocsNavItem>

export const quickStartCommands = [
  { label: 'Install dependencies', command: 'npm install' },
  { label: 'Copy local env', command: 'cp .env.example .env' },
  { label: 'Generate REST client', command: 'npm run api:gen' },
  { label: 'Start frontend', command: 'npm run dev' },
] as const

export const overviewCards = [
  {
    title: 'Core API',
    description:
      'REST transport, generated clients, auth refresh, and Orval mutators live under src/core/api.',
    icon: Cable,
  },
  {
    title: 'Module Pages',
    description:
      'Feature flows stay in src/modules so TanStack route files remain thin URL wiring.',
    icon: GitBranch,
  },
  {
    title: 'Validation',
    description:
      'Use npm run test, npm run check, and npm run build before shipping broad UI or API work.',
    icon: ShieldCheck,
  },
] as const

export const architectureRows = [
  {
    path: 'src/components/**',
    purpose: 'Complex reusable UI components such as Header and ResizableCard.',
  },
  {
    path: 'src/shared/ui/**',
    purpose: 'Small shadcn-like primitives and low-level shared UI pieces.',
  },
  {
    path: 'src/modules/**',
    purpose: 'Feature/page compositions, including docs, auth, watch-together, and showcase flows.',
  },
  {
    path: 'src/core/**',
    purpose: 'App-level services, layouts, API transport, generated clients, and errors.',
  },
  {
    path: 'src/routes/**',
    purpose: 'Folder-based TanStack Router definitions only; no business logic.',
  },
] as const

export const uiPrinciples = [
  {
    title: 'Reusable Components',
    description:
      'Put stateful, animated, reusable components in src/components with local types, hooks, constants, and public docs under /docs/ui/components.',
    icon: Boxes,
  },
  {
    title: 'Primitives',
    description:
      'Keep src/shared/ui generic: buttons, inputs, cards, dialogs, sliders, select fields, and similar base controls.',
    icon: Layers3,
  },
  {
    title: 'Component Docs',
    description:
      'When a public prop changes, update the matching /docs/ui/components page rather than burying API details in prompts.',
    icon: FileCode2,
  },
  {
    title: 'Showcase First',
    description:
      'Complex UI should have live, state-driven examples embedded in its docs page instead of static screenshots or one-off route demos.',
    icon: Sparkles,
  },
] as const

export const uiComponentDocs = [
  {
    title: 'Glass',
    status: 'Shared liquid interaction layer',
    description:
      'Presets, hooks, and motion helpers used by liquid-glass Header, Sidebar, and Tabs implementations.',
    notes: ['fluid presets', 'pointer progress', 'RAF CSS variables', 'motion drag helpers'],
    to: '/docs/ui/components/glass',
    icon: Sparkles,
  },
  {
    title: 'Header',
    status: 'React 19 ref-as-prop component',
    description:
      'Composed from Header, HeaderLogo, HeaderNav, HeaderNavItem, HeaderButton, and HeaderSpacer.',
    notes: [
      'scroll-aware collapse',
      'liquid/telegram glass',
      'manual collapse mode',
      'slot-based API',
    ],
    to: '/docs/ui/components/header',
    icon: Route,
  },
  {
    title: 'Tabs',
    status: 'Radix tabs with glass material variants',
    description:
      'Compound Tabs, TabsList, TabsTrigger, and TabsContent components with moving active indicators and fluid interaction tuning.',
    notes: ['solid/glass/liquid designs', 'icons and badges', 'vertical tabs', 'fluid presets'],
    to: '/docs/ui/components/tabs',
    icon: GalleryHorizontalEnd,
  },
  {
    title: 'ResizableCard',
    status: 'Expandable and resizable component package',
    description:
      'Supports inline and media presentations, render props, resize constraints, and configurable animation presets.',
    notes: [
      'inline/media presentations',
      'surface-grow preset',
      'resize handle',
      'modal accessibility',
    ],
    to: '/docs/ui/components/resizable-card',
    icon: Paintbrush,
  },
  {
    title: 'Sidebar',
    status: 'Composable navigation shell package',
    description:
      'Builds studio/app sidebars from Sidebar, SidebarBrand, SidebarSection, SidebarItem, and SidebarFooter.',
    notes: [
      'moving liquid selector',
      'solid/glass/fluent designs',
      'compound items',
      'collapsed labels',
    ],
    to: '/docs/ui/components/sidebar',
    icon: PanelLeft,
  },
  {
    title: 'Shared UI',
    status: 'Low-level primitives',
    description:
      'Button, Card, Dialog, Form, Select, Slider, Tabs, Tooltip, and other building blocks used by modules, each with its own docs page.',
    notes: ['per-component docs', 'CVA variants', 'Radix primitives', 'barrel exports'],
    to: '/docs/ui/components/shared',
    icon: Wrench,
  },
  {
    title: 'Docs Playgrounds',
    status: 'Embedded component examples',
    description:
      'Component docs now own their live controls, presets, and preview states so API documentation and behavior stay together.',
    notes: ['module-owned state', 'live previews', 'component controls', 'developer-facing docs'],
    icon: Code2,
  },
] as const
