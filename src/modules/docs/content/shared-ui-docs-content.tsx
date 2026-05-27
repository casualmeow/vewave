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
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useState } from 'react'
import type { ComponentType, ReactNode } from 'react'

import type { ComponentApiRow } from './component-docs-content'
import type { SharedUiDocCategory, SharedUiDocSlug } from './shared-ui-docs-nav'
import {
  AccessSelector,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  Cropper,
  CropperCropArea,
  CropperDescription,
  CropperImage,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  EditPlayer,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Label,
  Progress,
  RegisterPasswordInput,
  SecureInput,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Slider,
  SpinIcon,
  Table,
  TableCell,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Toaster,
  Tooltip,
} from '@/shared/ui'

export type SharedUiDoc = {
  slug: SharedUiDocSlug
  title: string
  file: string
  category: SharedUiDocCategory
  icon: ComponentType<{ className?: string }>
  description: string
  importSnippet: string
  usageSnippet: string
  apiRows: Array<ComponentApiRow>
  notes: Array<string>
  demo: ReactNode
}

type FormDemoValues = {
  email: string
}

function DemoFrame({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-[radial-gradient(circle_at_12%_0%,rgba(45,212,191,0.12),transparent_16rem),linear-gradient(135deg,#ffffff,#f8fafc)] p-5 shadow-sm">
      {children}
    </div>
  )
}

function ButtonDemo() {
  return (
    <DemoFrame>
      <div className="flex flex-wrap gap-2">
        <Button>Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Delete</Button>
        <Button size="icon" aria-label="Play preview">
          <Play className="size-4" />
        </Button>
      </div>
    </DemoFrame>
  )
}

function CardDemo() {
  return (
    <DemoFrame>
      <Card className="max-w-md border-zinc-200 bg-white/90">
        <CardHeader>
          <CardTitle>Room snapshot</CardTitle>
          <CardDescription>Card primitives create generic layout surfaces.</CardDescription>
          <CardAction>
            <BadgeCheck className="size-5 text-teal-700" />
          </CardAction>
        </CardHeader>
        <CardContent className="text-sm leading-6 text-zinc-600">
          Product-specific content stays in modules. Card only owns spacing and visual structure.
        </CardContent>
        <CardFooter>
          <Button size="sm">Open</Button>
        </CardFooter>
      </Card>
    </DemoFrame>
  )
}

function AvatarDemo() {
  return (
    <DemoFrame>
      <div className="flex items-center gap-4">
        <Avatar className="size-14 border border-white shadow-sm">
          <AvatarImage src="https://github.com/shadcn.png" alt="Example avatar" />
          <AvatarFallback>SC</AvatarFallback>
        </Avatar>
        <Avatar className="size-14 border border-white shadow-sm">
          <AvatarFallback>VW</AvatarFallback>
        </Avatar>
      </div>
    </DemoFrame>
  )
}

function CheckboxDemo() {
  const [checked, setChecked] = useState(true)

  return (
    <DemoFrame>
      <div className="flex items-center gap-3">
        <Checkbox
          id="docs-checkbox"
          checked={checked}
          onCheckedChange={(value) => setChecked(Boolean(value))}
        />
        <Label htmlFor="docs-checkbox">Enable synchronized playback</Label>
      </div>
    </DemoFrame>
  )
}

function CropperDemo() {
  return (
    <DemoFrame>
      <Cropper
        className="h-56 rounded-xl bg-zinc-950"
        image="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80"
        aspectRatio={1}
      >
        <CropperDescription>Crop the preview image.</CropperDescription>
        <CropperImage />
        <CropperCropArea className="h-32 w-32 rounded-lg" />
      </Cropper>
    </DemoFrame>
  )
}

function DialogDemo() {
  return (
    <DemoFrame>
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite viewer</DialogTitle>
            <DialogDescription>
              Dialog primitives provide the accessible overlay. Modules provide copy and behavior.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </DemoFrame>
  )
}

function DropdownMenuDemo() {
  return (
    <DemoFrame>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            Workspace menu
            <ChevronDown className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Workspace</DropdownMenuLabel>
          <DropdownMenuItem>
            Invite members
            <DropdownMenuShortcut>I</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>Duplicate room</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Delete draft</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </DemoFrame>
  )
}

function EditPlayerDemo() {
  return (
    <DemoFrame>
      <EditPlayer src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" />
    </DemoFrame>
  )
}

function FormDemo() {
  const form = useForm<FormDemoValues>({
    defaultValues: {
      email: 'viewer@vewave.local',
    },
  })

  return (
    <DemoFrame>
      <Form {...form}>
        <form className="max-w-sm space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="viewer@example.com" {...field} />
                </FormControl>
                <FormDescription>React Hook Form state is owned by the module.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </DemoFrame>
  )
}

function InputDemo() {
  return (
    <DemoFrame>
      <div className="grid max-w-sm gap-2">
        <Label htmlFor="docs-input">Room title</Label>
        <Input id="docs-input" defaultValue="Friday premiere" tooltip="Optional tooltip prop." />
      </div>
    </DemoFrame>
  )
}

function LabelDemo() {
  return (
    <DemoFrame>
      <div className="grid max-w-sm gap-2">
        <Label htmlFor="docs-label-input">Labeled input</Label>
        <Input id="docs-label-input" placeholder="Accessible name comes from Label" />
      </div>
    </DemoFrame>
  )
}

function ProgressDemo() {
  const [value, setValue] = useState([64])

  return (
    <DemoFrame>
      <div className="grid max-w-md gap-4">
        <div className="flex items-center justify-between text-sm">
          <Label>Upload progress</Label>
          <span className="font-medium text-zinc-700">{value[0]}%</span>
        </div>
        <Progress value={value[0]} />
        <Slider value={value} onValueChange={setValue} max={100} step={1} />
      </div>
    </DemoFrame>
  )
}

function RegisterPasswordInputDemo() {
  return (
    <DemoFrame>
      <div className="max-w-sm">
        <RegisterPasswordInput />
      </div>
    </DemoFrame>
  )
}

function SecureInputDemo() {
  return (
    <DemoFrame>
      <div className="grid max-w-sm gap-2">
        <Label htmlFor="docs-secure-input">Password</Label>
        <SecureInput id="docs-secure-input" placeholder="Enter password" />
      </div>
    </DemoFrame>
  )
}

function SelectDemo() {
  const [quality, setQuality] = useState('1080p')

  return (
    <DemoFrame>
      <div className="grid max-w-sm gap-2">
        <Label>Default quality</Label>
        <Select value={quality} onValueChange={setQuality}>
          <SelectTrigger>
            <SelectValue placeholder="Select quality" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="720p">720p</SelectItem>
            <SelectItem value="1080p">1080p</SelectItem>
            <SelectItem value="4k">4K</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </DemoFrame>
  )
}

function SeparatorDemo() {
  return (
    <DemoFrame>
      <div className="max-w-md rounded-xl border border-zinc-200 bg-white p-4">
        <div className="font-medium text-zinc-950">Room controls</div>
        <Separator className="my-4" />
        <div className="text-sm text-zinc-600">Separator divides related interface regions.</div>
      </div>
    </DemoFrame>
  )
}

function SheetDemo() {
  return (
    <DemoFrame>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="secondary">
            Open sheet
            <PanelRight className="size-4" />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Room details</SheetTitle>
            <SheetDescription>Sheet is the side-panel overlay primitive.</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </DemoFrame>
  )
}

function SliderDemo() {
  const [volume, setVolume] = useState([72])

  return (
    <DemoFrame>
      <div className="grid max-w-md gap-3">
        <div className="flex items-center justify-between text-sm">
          <Label>Volume</Label>
          <span className="font-medium text-zinc-700">{volume[0]}%</span>
        </div>
        <Slider value={volume} onValueChange={setVolume} max={100} step={1} />
      </div>
    </DemoFrame>
  )
}

function SonnerDemo() {
  return (
    <DemoFrame>
      <Toaster richColors />
      <Button
        type="button"
        onClick={() =>
          toast.success('Shared Toaster', {
            description: 'Sonner renders app notifications from a shared primitive wrapper.',
          })
        }
      >
        Show toast
        <Bell className="size-4" />
      </Button>
    </DemoFrame>
  )
}

function SpinningIconDemo() {
  return (
    <DemoFrame>
      <div className="flex flex-wrap items-center gap-5 rounded-xl bg-zinc-950 p-5 text-white">
        <SpinIcon label="Syncing" showLabel behavior="always" glyph="arc" />
        <SpinIcon label="Hover" showLabel behavior="hover" glyph="ring" />
        <SpinIcon label="Drag" showLabel behavior="drag" glyph="dots" draggable />
      </div>
    </DemoFrame>
  )
}

function TableDemo() {
  return (
    <DemoFrame>
      <Table>
        <TableHeader>
          <TableCell>Asset</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Progress</TableCell>
        </TableHeader>
        {[
          ['Intro cut', 'Uploaded', '100%'],
          ['Premiere render', 'Processing', '64%'],
          ['Captions', 'Draft', '28%'],
        ].map(([asset, status, progress]) => (
          <TableRow key={asset}>
            <TableCell>{asset}</TableCell>
            <TableCell>{status}</TableCell>
            <TableCell>{progress}</TableCell>
          </TableRow>
        ))}
      </Table>
    </DemoFrame>
  )
}

function TabsDemo() {
  return (
    <DemoFrame>
      <Tabs
        defaultValue="usage"
        className="max-w-md rounded-xl border border-zinc-200 bg-white p-3"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
        </TabsList>
        <TabsContent value="usage" className="pt-4 text-sm leading-6 text-zinc-600">
          Tabs organize related panels while preserving keyboard behavior.
        </TabsContent>
        <TabsContent value="rules" className="pt-4 text-sm leading-6 text-zinc-600">
          Keep tab state local to the module unless a reusable component owns it.
        </TabsContent>
      </Tabs>
    </DemoFrame>
  )
}

function TooltipDemo() {
  return (
    <DemoFrame>
      <Tooltip text="Tooltip text comes from the simple text prop." sideOffset={8}>
        <Button variant="outline">
          Hover for tooltip
          <Eye className="size-4" />
        </Button>
      </Tooltip>
    </DemoFrame>
  )
}

function AccessSelectorDemo() {
  return (
    <DemoFrame>
      <div className="max-w-sm">
        <AccessSelector initialAccess="Unlisted" />
      </div>
    </DemoFrame>
  )
}

const sharedUiDocs: Array<SharedUiDoc> = [
  {
    slug: 'button',
    title: 'Button',
    file: 'src/shared/ui/button.tsx',
    category: 'actions',
    icon: Play,
    description: 'CVA action primitive with variants, sizes, disabled state, and asChild support.',
    importSnippet: `import { Button } from '@/shared/ui'`,
    usageSnippet: `<Button variant="outline" size="sm">Invite</Button>
<Button asChild>
  <Link to="/projects">Open projects</Link>
</Button>`,
    apiRows: [
      {
        name: 'variant',
        type: "'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'",
        description: 'Visual tone.',
      },
      { name: 'size', type: "'default' | 'sm' | 'lg' | 'icon'", description: 'Button dimensions.' },
      {
        name: 'asChild',
        type: 'boolean',
        description: 'Composes classes onto another element through Radix Slot.',
      },
    ],
    notes: [
      'Use icons inside buttons when an icon exists.',
      'Keep route behavior in modules/routes, not the primitive.',
    ],
    demo: <ButtonDemo />,
  },
  {
    slug: 'card',
    title: 'Card',
    file: 'src/shared/ui/card.tsx',
    category: 'surfaces',
    icon: Layers3,
    description: 'Generic surface primitive with header, content, footer, and action slots.',
    importSnippet: `import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui'`,
    usageSnippet: `<Card>
  <CardHeader>
    <CardTitle>Room snapshot</CardTitle>
  </CardHeader>
  <CardContent>...</CardContent>
</Card>`,
    apiRows: [
      { name: 'Card', type: "ComponentProps<'div'>", description: 'Root surface.' },
      {
        name: 'CardHeader / CardContent / CardFooter',
        type: "ComponentProps<'div'>",
        description: 'Layout regions.',
      },
      {
        name: 'CardAction',
        type: "ComponentProps<'div'>",
        description: 'Right-aligned header action slot.',
      },
    ],
    notes: ['Use Card for individual framed items, not page section wrappers.'],
    demo: <CardDemo />,
  },
  {
    slug: 'avatar',
    title: 'Avatar',
    file: 'src/shared/ui/avatar.tsx',
    category: 'surfaces',
    icon: BadgeCheck,
    description: 'Radix Avatar wrapper with image and fallback primitives.',
    importSnippet: `import { Avatar, AvatarImage, AvatarFallback } from '@/shared/ui'`,
    usageSnippet: `<Avatar>
  <AvatarImage src="/avatar.png" alt="User" />
  <AvatarFallback>VW</AvatarFallback>
</Avatar>`,
    apiRows: [
      { name: 'Avatar', type: 'Radix Avatar Root props', description: 'Avatar container.' },
      {
        name: 'AvatarImage',
        type: 'Radix Avatar Image props',
        description: 'Image content with alt text.',
      },
      {
        name: 'AvatarFallback',
        type: 'Radix Avatar Fallback props',
        description: 'Fallback initials or icon.',
      },
    ],
    notes: ['Always provide alt text for AvatarImage.', 'Fallback should be short and readable.'],
    demo: <AvatarDemo />,
  },
  {
    slug: 'checkbox',
    title: 'Checkbox',
    file: 'src/shared/ui/checkbox.tsx',
    category: 'forms',
    icon: Check,
    description: 'Radix Checkbox wrapper with project focus, border, and checked indicator styles.',
    importSnippet: `import { Checkbox } from '@/shared/ui'`,
    usageSnippet: `<Checkbox checked={enabled} onCheckedChange={setEnabled} />`,
    apiRows: [
      {
        name: 'checked',
        type: 'boolean | "indeterminate"',
        description: 'Controlled checked state.',
      },
      { name: 'onCheckedChange', type: '(value) => void', description: 'State change callback.' },
    ],
    notes: ['Pair with Label for accessible naming.'],
    demo: <CheckboxDemo />,
  },
  {
    slug: 'cropper',
    title: 'Cropper',
    file: 'src/shared/ui/cropper.tsx',
    category: 'specialized',
    icon: Eye,
    description: 'Wrapper around @origin-space/image-cropper primitives for image crop surfaces.',
    importSnippet: `import { Cropper, CropperImage, CropperCropArea } from '@/shared/ui'`,
    usageSnippet: `<Cropper image="/image.jpg" aspectRatio={1}>
  <CropperDescription>Crop image</CropperDescription>
  <CropperImage />
  <CropperCropArea />
</Cropper>`,
    apiRows: [
      {
        name: 'Cropper',
        type: 'CropperPrimitive.Root props',
        description: 'Interactive crop root.',
      },
      {
        name: 'CropperImage',
        type: 'CropperPrimitive.Image props',
        description: 'Rendered image.',
      },
      {
        name: 'CropperCropArea',
        type: 'CropperPrimitive.CropArea props',
        description: 'Visible crop box.',
      },
    ],
    notes: [
      'Keep upload/storage behavior in modules.',
      'Provide CropperDescription for screen readers.',
    ],
    demo: <CropperDemo />,
  },
  {
    slug: 'dialog',
    title: 'Dialog',
    file: 'src/shared/ui/dialog.tsx',
    category: 'overlays',
    icon: MessageSquare,
    description: 'Radix Dialog wrapper for modal workflows.',
    importSnippet: `import { Dialog, DialogTrigger, DialogContent, DialogTitle } from '@/shared/ui'`,
    usageSnippet: `<Dialog>
  <DialogTrigger asChild><Button>Open</Button></DialogTrigger>
  <DialogContent><DialogTitle>Title</DialogTitle></DialogContent>
</Dialog>`,
    apiRows: [
      { name: 'Dialog', type: 'Radix Root props', description: 'Dialog state root.' },
      {
        name: 'DialogContent',
        type: 'Radix Content props',
        description: 'Modal panel and close button.',
      },
      {
        name: 'DialogTitle / DialogDescription',
        type: 'Radix title/description props',
        description: 'Accessible modal naming.',
      },
    ],
    notes: ['Every dialog should include a title.', 'Feature copy belongs in modules.'],
    demo: <DialogDemo />,
  },
  {
    slug: 'dropdown-menu',
    title: 'DropdownMenu',
    file: 'src/shared/ui/dropdown-menu.tsx',
    category: 'overlays',
    icon: ChevronDown,
    description:
      'Radix Dropdown Menu wrapper with item, checkbox, radio, separator, and sub-menu pieces.',
    importSnippet: `import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from '@/shared/ui'`,
    usageSnippet: `<DropdownMenu>
  <DropdownMenuTrigger asChild><Button>Menu</Button></DropdownMenuTrigger>
  <DropdownMenuContent><DropdownMenuItem>Invite</DropdownMenuItem></DropdownMenuContent>
</DropdownMenu>`,
    apiRows: [
      {
        name: 'DropdownMenuContent',
        type: 'Radix Content props & { disablePortal?: boolean }',
        description: 'Menu content. Can render without a portal when needed.',
      },
      {
        name: 'DropdownMenuItem',
        type: "variant?: 'default' | 'destructive'",
        description: 'Command row.',
      },
      {
        name: 'DropdownMenuShortcut',
        type: "ComponentProps<'span'>",
        description: 'Right-aligned keyboard hint.',
      },
    ],
    notes: ['Use destructive variant only for irreversible actions.'],
    demo: <DropdownMenuDemo />,
  },
  {
    slug: 'edit-player',
    title: 'EditPlayer',
    file: 'src/shared/ui/edit-player.tsx',
    category: 'specialized',
    icon: Play,
    description:
      'Project-adjacent helper that previews a video source and offers copy/open actions.',
    importSnippet: `import { EditPlayer } from '@/shared/ui'`,
    usageSnippet: `<EditPlayer src="https://example.com/video.mp4" />`,
    apiRows: [
      { name: 'src', type: 'string', description: 'Video URL to preview, open, and copy.' },
    ],
    notes: [
      'This imports the video module, so promote it out of shared/ui if it gains more product behavior.',
    ],
    demo: <EditPlayerDemo />,
  },
  {
    slug: 'form',
    title: 'Form',
    file: 'src/shared/ui/form.tsx',
    category: 'forms',
    icon: Settings2,
    description: 'React Hook Form composition helpers aligned with shadcn-style form patterns.',
    importSnippet: `import { Form, FormField, FormItem, FormControl, FormMessage } from '@/shared/ui'`,
    usageSnippet: `<Form {...form}>
  <FormField
    control={form.control}
    name="email"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Email</FormLabel>
        <FormControl><Input {...field} /></FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
</Form>`,
    apiRows: [
      { name: 'Form', type: 'FormProvider', description: 'React Hook Form provider.' },
      { name: 'FormField', type: 'ControllerProps', description: 'Controlled field bridge.' },
      { name: 'useFormField', type: 'hook', description: 'Reads field ids and error state.' },
    ],
    notes: [
      'Schemas and submit behavior belong in modules.',
      'Use FormMessage for validation errors.',
    ],
    demo: <FormDemo />,
  },
  {
    slug: 'input',
    title: 'Input',
    file: 'src/shared/ui/input.tsx',
    category: 'forms',
    icon: Settings2,
    description: 'Native input wrapper with project focus styles and optional inline tooltip.',
    importSnippet: `import { Input } from '@/shared/ui'`,
    usageSnippet: `<Input placeholder="Room title" tooltip="Shown in a Tooltip" />`,
    apiRows: [
      {
        name: 'tooltip',
        type: 'string',
        description: 'Optional tooltip text rendered with the help icon.',
      },
      { name: '...props', type: "ComponentProps<'input'>", description: 'Native input props.' },
    ],
    notes: ['Pair with Label or FormLabel for accessible names.'],
    demo: <InputDemo />,
  },
  {
    slug: 'label',
    title: 'Label',
    file: 'src/shared/ui/label.tsx',
    category: 'forms',
    icon: Settings2,
    description: 'Radix Label wrapper for form control names.',
    importSnippet: `import { Label } from '@/shared/ui'`,
    usageSnippet: `<Label htmlFor="room-title">Room title</Label>`,
    apiRows: [
      { name: 'htmlFor', type: 'string', description: 'Connects the label to a control id.' },
      { name: '...props', type: 'Radix Label props', description: 'Radix label attributes.' },
    ],
    notes: ['Use Label for standalone controls; use FormLabel inside FormItem.'],
    demo: <LabelDemo />,
  },
  {
    slug: 'progress',
    title: 'Progress',
    file: 'src/shared/ui/progress.tsx',
    category: 'feedback',
    icon: TableProperties,
    description: 'Radix Progress wrapper for determinate progress display.',
    importSnippet: `import { Progress } from '@/shared/ui'`,
    usageSnippet: `<Progress value={64} />`,
    apiRows: [
      { name: 'value', type: 'number | null', description: 'Progress value from 0 to 100.' },
      { name: '...props', type: 'Radix Progress Root props', description: 'Root progress props.' },
    ],
    notes: ['Use adjacent text when precise progress value matters.'],
    demo: <ProgressDemo />,
  },
  {
    slug: 'register-password-input',
    title: 'RegisterPasswordInput',
    file: 'src/shared/ui/register-password-input.tsx',
    category: 'forms',
    icon: LockKeyhole,
    description: 'Self-contained password field with strength meter and requirement checklist.',
    importSnippet: `import { RegisterPasswordInput } from '@/shared/ui'`,
    usageSnippet: `<RegisterPasswordInput />`,
    apiRows: [
      {
        name: 'state',
        type: 'internal',
        description: 'Owns password text, visibility, and requirement checks internally.',
      },
      {
        name: 'requirements',
        type: '8 chars, number, lowercase, uppercase',
        description: 'Built-in strength rules.',
      },
    ],
    notes: ['This is stateful; use it only when the built-in validation UX fits the form.'],
    demo: <RegisterPasswordInputDemo />,
  },
  {
    slug: 'secure-input',
    title: 'SecureInput',
    file: 'src/shared/ui/secure-input.tsx',
    category: 'forms',
    icon: LockKeyhole,
    description: 'Password input helper that composes Input with a visibility toggle button.',
    importSnippet: `import { SecureInput } from '@/shared/ui'`,
    usageSnippet: `<SecureInput placeholder="Password" />`,
    apiRows: [
      {
        name: '...props',
        type: 'InputProps without tooltip',
        description: 'Forwards input props to Input.',
      },
      {
        name: 'visibility',
        type: 'internal boolean',
        description: 'Toggles between password and text input types.',
      },
    ],
    notes: ['Use RegisterPasswordInput when strength feedback is also required.'],
    demo: <SecureInputDemo />,
  },
  {
    slug: 'select',
    title: 'Select',
    file: 'src/shared/ui/select.tsx',
    category: 'forms',
    icon: ChevronDown,
    description: 'Radix Select wrapper with trigger, content, item, label, and separator pieces.',
    importSnippet: `import { Select, SelectTrigger, SelectContent, SelectItem } from '@/shared/ui'`,
    usageSnippet: `<Select value={quality} onValueChange={setQuality}>
  <SelectTrigger><SelectValue placeholder="Quality" /></SelectTrigger>
  <SelectContent><SelectItem value="1080p">1080p</SelectItem></SelectContent>
</Select>`,
    apiRows: [
      {
        name: 'Select',
        type: 'Radix Root props',
        description: 'Controlled or uncontrolled select state.',
      },
      { name: 'SelectTrigger', type: 'Radix Trigger props', description: 'Button-like trigger.' },
      { name: 'SelectItem', type: 'Radix Item props', description: 'Selectable option.' },
    ],
    notes: ['Use value/onValueChange for controlled module state.'],
    demo: <SelectDemo />,
  },
  {
    slug: 'separator',
    title: 'Separator',
    file: 'src/shared/ui/separator.tsx',
    category: 'surfaces',
    icon: Layers3,
    description: 'Radix Separator wrapper for horizontal and vertical dividers.',
    importSnippet: `import { Separator } from '@/shared/ui'`,
    usageSnippet: `<Separator className="my-4" />`,
    apiRows: [
      {
        name: 'orientation',
        type: "'horizontal' | 'vertical'",
        description: 'Divider orientation.',
      },
      { name: 'decorative', type: 'boolean', description: 'Whether the separator is decorative.' },
    ],
    notes: ['Use spacing around separators rather than hardcoded line breaks.'],
    demo: <SeparatorDemo />,
  },
  {
    slug: 'sheet',
    title: 'Sheet',
    file: 'src/shared/ui/sheet.tsx',
    category: 'overlays',
    icon: PanelRight,
    description: 'Side-panel overlay primitive based on Radix Dialog.',
    importSnippet: `import { Sheet, SheetTrigger, SheetContent, SheetTitle } from '@/shared/ui'`,
    usageSnippet: `<Sheet>
  <SheetTrigger asChild><Button>Open</Button></SheetTrigger>
  <SheetContent side="right"><SheetTitle>Panel</SheetTitle></SheetContent>
</Sheet>`,
    apiRows: [
      {
        name: 'SheetContent side',
        type: "'top' | 'right' | 'bottom' | 'left'",
        description: 'Panel entrance side.',
      },
      {
        name: 'SheetTitle / SheetDescription',
        type: 'Radix title/description props',
        description: 'Accessible panel naming.',
      },
    ],
    notes: ['Use for secondary workflows that should not replace the page.'],
    demo: <SheetDemo />,
  },
  {
    slug: 'slider',
    title: 'Slider',
    file: 'src/shared/ui/slider.tsx',
    category: 'forms',
    icon: Settings2,
    description: 'Radix Slider wrapper for numeric range controls.',
    importSnippet: `import { Slider } from '@/shared/ui'`,
    usageSnippet: `<Slider value={volume} onValueChange={setVolume} max={100} step={1} />`,
    apiRows: [
      { name: 'value', type: 'number[]', description: 'Controlled slider values.' },
      { name: 'max / step', type: 'number', description: 'Range and increment settings.' },
    ],
    notes: ['Display the current value near the slider when the number matters.'],
    demo: <SliderDemo />,
  },
  {
    slug: 'sonner',
    title: 'Sonner Toaster',
    file: 'src/shared/ui/sonner.tsx',
    category: 'feedback',
    icon: Bell,
    description: 'Thin wrapper around Sonner Toaster for app notifications.',
    importSnippet: `import { Toaster } from '@/shared/ui'
import { toast } from 'sonner'`,
    usageSnippet: `<Toaster richColors />
<Button onClick={() => toast.success('Saved')}>Show toast</Button>`,
    apiRows: [
      { name: 'Toaster', type: 'ToasterProps', description: 'Forwards props to Sonner.' },
      {
        name: 'toast',
        type: 'sonner API',
        description: 'Use Sonner toast helpers from feature code.',
      },
    ],
    notes: ['Place one Toaster at an app/provider boundary in production layouts.'],
    demo: <SonnerDemo />,
  },
  {
    slug: 'spinning-icon',
    title: 'SpinIcon',
    file: 'src/shared/ui/spinning-icon.tsx',
    category: 'feedback',
    icon: Settings2,
    description:
      'Composable animated status icon with size, speed, behavior, direction, and drag support.',
    importSnippet: `import { SpinIcon } from '@/shared/ui'`,
    usageSnippet: `<SpinIcon label="Syncing" showLabel behavior="always" glyph="arc" />`,
    apiRows: [
      {
        name: 'size',
        type: "'xs' | 'sm' | 'md' | 'lg' | 'xl' | number | string",
        description: 'Icon size.',
      },
      {
        name: 'behavior',
        type: "'always' | 'hover' | 'drag' | 'dynamic' | 'none'",
        description: 'Animation trigger.',
      },
      { name: 'glyph', type: "'arc' | 'ring' | 'dots'", description: 'Built-in glyph shape.' },
    ],
    notes: [
      'Respects motion-reduce classes and disableMotion.',
      'Use label for accessible status semantics.',
    ],
    demo: <SpinningIconDemo />,
  },
  {
    slug: 'table',
    title: 'Table',
    file: 'src/shared/ui/table.tsx',
    category: 'data',
    icon: TableProperties,
    description: 'Div-based table primitives for simple horizontally scrollable data layouts.',
    importSnippet: `import { Table, TableHeader, TableRow, TableCell } from '@/shared/ui'`,
    usageSnippet: `<Table>
  <TableHeader><TableCell>Name</TableCell></TableHeader>
  <TableRow><TableCell>Intro cut</TableCell></TableRow>
</Table>`,
    apiRows: [
      { name: 'Table', type: "ComponentProps<'div'>", description: 'Scrollable table wrapper.' },
      {
        name: 'TableHeader / TableRow / TableCell',
        type: "ComponentProps<'div'>",
        description: 'Flex-based table regions.',
      },
    ],
    notes: [
      'This is not a semantic table. Use native table markup if semantic tabular data is required.',
    ],
    demo: <TableDemo />,
  },
  {
    slug: 'tabs',
    title: 'Tabs',
    file: 'src/shared/ui/tabs.tsx',
    category: 'surfaces',
    icon: Layers3,
    description: 'Radix Tabs wrapper with list, trigger, and content primitives.',
    importSnippet: `import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui'`,
    usageSnippet: `<Tabs defaultValue="usage">
  <TabsList><TabsTrigger value="usage">Usage</TabsTrigger></TabsList>
  <TabsContent value="usage">...</TabsContent>
</Tabs>`,
    apiRows: [
      { name: 'Tabs', type: 'Radix Root props', description: 'Tabs root and state.' },
      {
        name: 'TabsList / TabsTrigger / TabsContent',
        type: 'Radix tabs props',
        description: 'Tab navigation pieces.',
      },
    ],
    notes: ['Use concise tab labels and keep panel content related.'],
    demo: <TabsDemo />,
  },
  {
    slug: 'tooltip',
    title: 'Tooltip',
    file: 'src/shared/ui/tooltip.tsx',
    category: 'overlays',
    icon: Eye,
    description: 'Simple Radix Tooltip wrapper for text-only hints.',
    importSnippet: `import { Tooltip } from '@/shared/ui'`,
    usageSnippet: `<Tooltip text="Copy link">
  <Button size="icon">...</Button>
</Tooltip>`,
    apiRows: [
      { name: 'text', type: 'string', description: 'Tooltip content.' },
      { name: 'delayDuration', type: 'number', description: 'Open delay in milliseconds.' },
      { name: 'sideOffset', type: 'number', description: 'Offset from trigger.' },
    ],
    notes: ['Use tooltips for hints, not required instructions.'],
    demo: <TooltipDemo />,
  },
  {
    slug: 'access-selector',
    title: 'AccessSelector',
    file: 'src/shared/ui/edit-acess-selector.tsx',
    category: 'specialized',
    icon: LockKeyhole,
    description: 'Small visibility selector for Public, Unlisted, and Private access states.',
    importSnippet: `import { AccessSelector } from '@/shared/ui'`,
    usageSnippet: `<AccessSelector initialAccess="Unlisted" onChange={setAccess} />`,
    apiRows: [
      {
        name: 'initialAccess',
        type: "'Public' | 'Unlisted' | 'Private'",
        description: 'Initial selected access state.',
      },
      { name: 'onChange', type: '(value) => void', description: 'Called when access changes.' },
    ],
    notes: ['File name is currently edit-acess-selector.tsx; public export is AccessSelector.'],
    demo: <AccessSelectorDemo />,
  },
]

export { sharedUiDocs }

export const sharedUiDocBySlug = new Map<SharedUiDocSlug, SharedUiDoc>(
  sharedUiDocs.map((doc) => [doc.slug, doc]),
)

export function getSharedUiDoc(slug: string) {
  return sharedUiDocBySlug.get(slug as SharedUiDocSlug)
}
