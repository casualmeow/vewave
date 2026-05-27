import {
  BookOpen,
  Boxes,
  Cable,
  Code2,
  Component,
  FileCode2,
  GitBranch,
  Layers3,
  MonitorPlay,
  Paintbrush,
  PanelLeft,
  Route,
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import type { ComponentDocRoute } from './component-docs-content'

export type DocsNavItem = {
  title: string
  description: string
  to: '/docs' | '/docs/ui' | '/ui/showcase' | ComponentDocRoute
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
    title: 'Header',
    description: 'Scroll-aware top navigation component.',
    to: '/docs/ui/components/header',
    icon: Route,
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
    title: 'Showcase',
    description: 'Live component catalog for visual inspection.',
    to: '/ui/showcase',
    icon: MonitorPlay,
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
      'Complex UI should have a live, state-driven showcase instead of static screenshots or one-off route demos.',
    icon: Sparkles,
  },
] as const

export const uiComponentDocs = [
  {
    title: 'Header',
    status: 'React 19 ref-as-prop component',
    description:
      'Composed from Header, HeaderLogo, HeaderNav, HeaderNavItem, HeaderButton, and HeaderSpacer.',
    notes: [
      'scroll-aware collapse',
      'manual collapse mode',
      'glass/glow variants',
      'slot-based API',
    ],
    to: '/docs/ui/components/header',
    icon: Route,
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
      'Button, Card, Dialog, Form, Select, Slider, Tabs, Tooltip, and other building blocks used by modules.',
    notes: ['CVA variants', 'Radix primitives', 'Tailwind tokens', 'barrel exports'],
    icon: Wrench,
  },
  {
    title: 'Showcase Catalog',
    status: 'Route-level UI catalog',
    description:
      'The /ui/showcase route demonstrates reusable components with controls, presets, and live preview states.',
    notes: ['module-owned state', 'live previews', 'component controls', 'developer-facing docs'],
    icon: Code2,
  },
] as const
