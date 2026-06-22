import {
  BadgeCheck,
  Bell,
  Check,
  ChevronDown,
  Eye,
  Layers3,
  LockKeyhole,
  MessageSquare,
  PanelRight,
  Play,
  Settings2,
  TableProperties,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type SharedUiDocSlug =
  | 'access-selector'
  | 'avatar'
  | 'button'
  | 'card'
  | 'checkbox'
  | 'cropper'
  | 'dialog'
  | 'dropdown-menu'
  | 'edit-player'
  | 'form'
  | 'input'
  | 'label'
  | 'progress'
  | 'register-password-input'
  | 'secure-input'
  | 'select'
  | 'separator'
  | 'sheet'
  | 'slider'
  | 'sonner'
  | 'spinning-icon'
  | 'table'
  | 'tabs'
  | 'tooltip'

export type SharedUiDocRoute =
  | '/admin/docs/ui/components/shared/access-selector'
  | '/admin/docs/ui/components/shared/avatar'
  | '/admin/docs/ui/components/shared/button'
  | '/admin/docs/ui/components/shared/card'
  | '/admin/docs/ui/components/shared/checkbox'
  | '/admin/docs/ui/components/shared/cropper'
  | '/admin/docs/ui/components/shared/dialog'
  | '/admin/docs/ui/components/shared/dropdown-menu'
  | '/admin/docs/ui/components/shared/edit-player'
  | '/admin/docs/ui/components/shared/form'
  | '/admin/docs/ui/components/shared/input'
  | '/admin/docs/ui/components/shared/label'
  | '/admin/docs/ui/components/shared/progress'
  | '/admin/docs/ui/components/shared/register-password-input'
  | '/admin/docs/ui/components/shared/secure-input'
  | '/admin/docs/ui/components/shared/select'
  | '/admin/docs/ui/components/shared/separator'
  | '/admin/docs/ui/components/shared/sheet'
  | '/admin/docs/ui/components/shared/slider'
  | '/admin/docs/ui/components/shared/sonner'
  | '/admin/docs/ui/components/shared/spinning-icon'
  | '/admin/docs/ui/components/shared/table'
  | '/admin/docs/ui/components/shared/tabs'
  | '/admin/docs/ui/components/shared/tooltip'

export type SharedUiDocCategory =
  | 'actions'
  | 'forms'
  | 'overlays'
  | 'surfaces'
  | 'data'
  | 'feedback'
  | 'specialized'

export type SharedUiDocNavItem = {
  slug: SharedUiDocSlug
  title: string
  to: SharedUiDocRoute
  file: string
  category: SharedUiDocCategory
  icon: LucideIcon
  description: string
}

export const sharedUiCategories: Array<{
  id: SharedUiDocCategory
  title: string
  description: string
}> = [
  {
    id: 'actions',
    title: 'Actions',
    description: 'Buttons and action triggers.',
  },
  {
    id: 'forms',
    title: 'Forms',
    description: 'Inputs, labels, validation helpers, and form controls.',
  },
  {
    id: 'overlays',
    title: 'Overlays',
    description: 'Dialogs, sheets, menus, and hints.',
  },
  {
    id: 'surfaces',
    title: 'Surfaces',
    description: 'Layout and identity primitives.',
  },
  {
    id: 'data',
    title: 'Data',
    description: 'Simple display structures for data and status.',
  },
  {
    id: 'feedback',
    title: 'Feedback',
    description: 'Progress, toast, and loading affordances.',
  },
  {
    id: 'specialized',
    title: 'Specialized',
    description: 'Small helpers that may later move upward if they gain feature behavior.',
  },
]

export const sharedUiDocNavItems: Array<SharedUiDocNavItem> = [
  {
    slug: 'button',
    title: 'Button',
    to: '/admin/docs/ui/components/shared/button',
    file: 'src/shared/ui/button.tsx',
    category: 'actions',
    icon: Play,
    description: 'CVA action primitive with variants, sizes, disabled state, and asChild support.',
  },
  {
    slug: 'card',
    title: 'Card',
    to: '/admin/docs/ui/components/shared/card',
    file: 'src/shared/ui/card.tsx',
    category: 'surfaces',
    icon: Layers3,
    description: 'Generic surface primitive with header, content, footer, and action slots.',
  },
  {
    slug: 'avatar',
    title: 'Avatar',
    to: '/admin/docs/ui/components/shared/avatar',
    file: 'src/shared/ui/avatar.tsx',
    category: 'surfaces',
    icon: BadgeCheck,
    description: 'Radix Avatar wrapper with image and fallback primitives.',
  },
  {
    slug: 'checkbox',
    title: 'Checkbox',
    to: '/admin/docs/ui/components/shared/checkbox',
    file: 'src/shared/ui/checkbox.tsx',
    category: 'forms',
    icon: Check,
    description: 'Radix Checkbox wrapper with project focus and checked indicator styles.',
  },
  {
    slug: 'cropper',
    title: 'Cropper',
    to: '/admin/docs/ui/components/shared/cropper',
    file: 'src/shared/ui/cropper.tsx',
    category: 'specialized',
    icon: Eye,
    description: 'Wrapper around @origin-space/image-cropper primitives.',
  },
  {
    slug: 'dialog',
    title: 'Dialog',
    to: '/admin/docs/ui/components/shared/dialog',
    file: 'src/shared/ui/dialog.tsx',
    category: 'overlays',
    icon: MessageSquare,
    description: 'Radix Dialog wrapper for modal workflows.',
  },
  {
    slug: 'dropdown-menu',
    title: 'DropdownMenu',
    to: '/admin/docs/ui/components/shared/dropdown-menu',
    file: 'src/shared/ui/dropdown-menu.tsx',
    category: 'overlays',
    icon: ChevronDown,
    description: 'Radix menu wrapper with item, checkbox, radio, separator, and sub-menu pieces.',
  },
  {
    slug: 'edit-player',
    title: 'EditPlayer',
    to: '/admin/docs/ui/components/shared/edit-player',
    file: 'src/shared/ui/edit-player.tsx',
    category: 'specialized',
    icon: Play,
    description: 'Project-adjacent helper that previews a video source and copy/open actions.',
  },
  {
    slug: 'form',
    title: 'Form',
    to: '/admin/docs/ui/components/shared/form',
    file: 'src/shared/ui/form.tsx',
    category: 'forms',
    icon: Settings2,
    description: 'React Hook Form composition helpers aligned with shadcn-style form patterns.',
  },
  {
    slug: 'input',
    title: 'Input',
    to: '/admin/docs/ui/components/shared/input',
    file: 'src/shared/ui/input.tsx',
    category: 'forms',
    icon: Settings2,
    description: 'Native input wrapper with project focus styles and optional inline tooltip.',
  },
  {
    slug: 'label',
    title: 'Label',
    to: '/admin/docs/ui/components/shared/label',
    file: 'src/shared/ui/label.tsx',
    category: 'forms',
    icon: Settings2,
    description: 'Radix Label wrapper for form control names.',
  },
  {
    slug: 'progress',
    title: 'Progress',
    to: '/admin/docs/ui/components/shared/progress',
    file: 'src/shared/ui/progress.tsx',
    category: 'feedback',
    icon: TableProperties,
    description: 'Radix Progress wrapper for determinate progress display.',
  },
  {
    slug: 'register-password-input',
    title: 'RegisterPasswordInput',
    to: '/admin/docs/ui/components/shared/register-password-input',
    file: 'src/shared/ui/register-password-input.tsx',
    category: 'forms',
    icon: LockKeyhole,
    description: 'Self-contained password field with strength meter and requirement checklist.',
  },
  {
    slug: 'secure-input',
    title: 'SecureInput',
    to: '/admin/docs/ui/components/shared/secure-input',
    file: 'src/shared/ui/secure-input.tsx',
    category: 'forms',
    icon: LockKeyhole,
    description: 'Password input helper that adds a visibility toggle button.',
  },
  {
    slug: 'select',
    title: 'Select',
    to: '/admin/docs/ui/components/shared/select',
    file: 'src/shared/ui/select.tsx',
    category: 'forms',
    icon: ChevronDown,
    description: 'Radix Select wrapper with trigger, content, item, label, and separator pieces.',
  },
  {
    slug: 'separator',
    title: 'Separator',
    to: '/admin/docs/ui/components/shared/separator',
    file: 'src/shared/ui/separator.tsx',
    category: 'surfaces',
    icon: Layers3,
    description: 'Radix Separator wrapper for horizontal and vertical dividers.',
  },
  {
    slug: 'sheet',
    title: 'Sheet',
    to: '/admin/docs/ui/components/shared/sheet',
    file: 'src/shared/ui/sheet.tsx',
    category: 'overlays',
    icon: PanelRight,
    description: 'Side-panel overlay primitive based on Radix Dialog.',
  },
  {
    slug: 'slider',
    title: 'Slider',
    to: '/admin/docs/ui/components/shared/slider',
    file: 'src/shared/ui/slider.tsx',
    category: 'forms',
    icon: Settings2,
    description: 'Radix Slider wrapper for numeric range controls.',
  },
  {
    slug: 'sonner',
    title: 'Sonner Toaster',
    to: '/admin/docs/ui/components/shared/sonner',
    file: 'src/shared/ui/sonner.tsx',
    category: 'feedback',
    icon: Bell,
    description: 'Thin wrapper around Sonner Toaster for app notifications.',
  },
  {
    slug: 'spinning-icon',
    title: 'SpinIcon',
    to: '/admin/docs/ui/components/shared/spinning-icon',
    file: 'src/shared/ui/spinning-icon.tsx',
    category: 'feedback',
    icon: Settings2,
    description: 'Composable animated status icon with size, speed, behavior, and drag support.',
  },
  {
    slug: 'table',
    title: 'Table',
    to: '/admin/docs/ui/components/shared/table',
    file: 'src/shared/ui/table.tsx',
    category: 'data',
    icon: TableProperties,
    description: 'Div-based table primitives for simple horizontally scrollable data layouts.',
  },
  {
    slug: 'tabs',
    title: 'Tabs',
    to: '/admin/docs/ui/components/shared/tabs',
    file: 'src/shared/ui/tabs.tsx',
    category: 'surfaces',
    icon: Layers3,
    description: 'Radix Tabs wrapper with list, trigger, and content primitives.',
  },
  {
    slug: 'tooltip',
    title: 'Tooltip',
    to: '/admin/docs/ui/components/shared/tooltip',
    file: 'src/shared/ui/tooltip.tsx',
    category: 'overlays',
    icon: Eye,
    description: 'Simple Radix Tooltip wrapper for text-only hints.',
  },
  {
    slug: 'access-selector',
    title: 'AccessSelector',
    to: '/admin/docs/ui/components/shared/access-selector',
    file: 'src/shared/ui/edit-access-selector.tsx',
    category: 'specialized',
    icon: LockKeyhole,
    description: 'Small visibility selector for Public, Unlisted, and Private access states.',
  },
]
