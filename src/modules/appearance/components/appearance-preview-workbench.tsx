import { Link } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import {
  Bell,
  Check,
  Eye,
  MousePointer2,
  PanelRightOpen,
  PlayCircle,
  RotateCcw,
  Save,
  SlidersHorizontal,
} from 'lucide-react'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { toast } from 'sonner'

import type { AppShellSurfaceId } from '@/core/layouts/app-layout/ui/app-shell-surfaces'
import { AppSidebar } from '@/core/layouts/app-layout/ui/app-sidebar'
import { AppShellHeader } from '@/core/layouts/app-layout/ui/app-shell-header'
import {
  getGetApiProfileMeQueryKey,
  usePatchApiProfileMe,
  type PatchApiProfileMeMutationBody,
} from '@/core/api/generated/profile/profile'
import { getApiErrorMessage } from '@/core/api/http/errors'
import {
  RoomsDashboardView,
  type RoomsDashboardSurfaceId,
  type RoomWorkspaceItem,
} from '@/modules/projects'
import { useAuthStore } from '@/modules/auth'
import { appearancePreviewProjects } from '@/modules/appearance/preview-scenarios'
import {
  defaultAppearanceSettings,
  getAppearanceSettingsFromAppConfig,
  getThemeTokenStyle,
  resolveThemeTokens,
  useAppearance,
  withAppearanceSettingsInAppConfig,
  type AppearanceSettings,
  type EditableThemeTokenName,
  type ResolvedAppearanceMode,
  type ThemeTokens,
} from '@/shared/theme'
import {
  getContrastRatio,
  getReadableForeground,
  meetsNormalTextContrast,
  normalizeHexColor,
} from '@/shared/theme/validators'
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SpinIcon,
  Tooltip,
} from '@/shared/ui'
import { cn } from '@/shared/lib/utils'

type PreviewSurfaceId = AppShellSurfaceId | RoomsDashboardSurfaceId

type PreviewSurfaceDefinition = {
  description: string
  editableTokens: Array<EditableThemeTokenName>
  label: string
  tokens: Array<keyof ThemeTokens>
}

type SurfaceRole = {
  description: string
  foregroundToken?: EditableThemeTokenName
  linkedTokens?: Array<EditableThemeTokenName>
  label: string
  token: EditableThemeTokenName
}

const previewSurfaces = {
  sidebar: {
    label: 'Sidebar',
    description: 'Navigation shell, identity area, active items, and sidebar contrast.',
    editableTokens: ['sidebar', 'sidebarForeground', 'sidebarAccent', 'sidebarAccentForeground'],
    tokens: ['sidebar', 'sidebarForeground', 'sidebarAccent', 'sidebarAccentForeground'],
  },
  header: {
    label: 'Header',
    description: 'Top app bar, header text, separators, and primary command contrast.',
    editableTokens: ['header', 'headerForeground', 'headerBorder', 'primary'],
    tokens: ['header', 'headerForeground', 'headerBorder', 'primary'],
  },
  sidebarIdentity: {
    label: 'Sidebar identity',
    description: 'Logo/profile area, account text, and sign-in action treatment.',
    editableTokens: ['sidebar', 'sidebarForeground', 'sidebarPrimary', 'sidebarPrimaryForeground'],
    tokens: ['sidebar', 'sidebarForeground', 'sidebarPrimary', 'sidebarPrimaryForeground'],
  },
  sidebarWorkspace: {
    label: 'Workspace nav',
    description: 'Primary sidebar links, active page background, and badges.',
    editableTokens: [
      'sidebarForeground',
      'sidebarAccent',
      'sidebarAccentForeground',
      'sidebarPrimary',
      'sidebarPrimaryForeground',
    ],
    tokens: [
      'sidebarForeground',
      'sidebarAccent',
      'sidebarAccentForeground',
      'sidebarPrimary',
      'sidebarPrimaryForeground',
    ],
  },
  sidebarHistory: {
    label: 'History list',
    description: 'Recent room labels, quiet text, and activity indicators.',
    editableTokens: ['sidebarForeground', 'mutedForeground', 'sidebarPrimary'],
    tokens: ['sidebarForeground', 'mutedForeground', 'sidebarPrimary'],
  },
  sidebarRooms: {
    label: 'Rooms group',
    description: 'Pinned room group, count badge, and active room emphasis.',
    editableTokens: ['sidebarForeground', 'sidebarPrimary', 'sidebarPrimaryForeground'],
    tokens: ['sidebarForeground', 'sidebarPrimary', 'sidebarPrimaryForeground'],
  },
  sidebarServers: {
    label: 'Servers group',
    description: 'Secondary sidebar group with status and muted labels.',
    editableTokens: ['sidebarForeground', 'mutedForeground', 'sidebarBorder'],
    tokens: ['sidebarForeground', 'mutedForeground', 'sidebarBorder'],
  },
  sidebarFooter: {
    label: 'Sidebar footer',
    description: 'Support, settings, sign-out, and footer separators.',
    editableTokens: ['sidebarForeground', 'sidebarBorder', 'sidebarAccent'],
    tokens: ['sidebarForeground', 'sidebarBorder', 'sidebarAccent'],
  },
  headerTitle: {
    label: 'Header title',
    description: 'Header eyebrow, title, and product accent text.',
    editableTokens: ['header', 'headerForeground', 'primary'],
    tokens: ['header', 'headerForeground', 'primary'],
  },
  headerActions: {
    label: 'Header actions',
    description: 'Primary create command and account action contrast.',
    editableTokens: ['primary', 'primaryForeground', 'card', 'border'],
    tokens: ['primary', 'primaryForeground', 'card', 'border'],
  },
  hero: {
    label: 'Page intro',
    description: 'Primary page title, supporting copy, and soft product accent.',
    editableTokens: ['background', 'foreground', 'mutedForeground', 'primary'],
    tokens: ['background', 'foreground', 'mutedForeground', 'primary'],
  },

  create: {
    label: 'Start room',
    description: 'Focused room start panel, inputs, next-step context, and action button.',
    editableTokens: ['card', 'foreground', 'primary', 'primaryForeground', 'input', 'ring'],
    tokens: ['card', 'foreground', 'primary', 'primaryForeground', 'input', 'ring'],
  },
  createIntro: {
    label: 'Room details intro',
    description: 'Create form copy and text hierarchy.',
    editableTokens: ['foreground', 'mutedForeground', 'primary', 'border'],
    tokens: ['foreground', 'mutedForeground', 'primary', 'border'],
  },
  createFields: {
    label: 'Create fields',
    description: 'Input surfaces, field borders, text color, and keyboard focus.',
    editableTokens: ['input', 'card', 'foreground', 'ring'],
    tokens: ['input', 'card', 'foreground', 'ring'],
  },

  createAction: {
    label: 'Create action',
    description: 'Primary submit button and result copy contrast.',
    editableTokens: ['primary', 'primaryForeground', 'ring'],
    tokens: ['primary', 'primaryForeground', 'ring'],
  },
  roomList: {
    label: 'Room grid',
    description: 'Room cards, expandable content, media accents, and list borders.',
    editableTokens: ['card', 'cardForeground', 'border', 'accent', 'primary'],
    tokens: ['card', 'cardForeground', 'border', 'accent', 'primary'],
  },
  roomMedia: {
    label: 'Room media',
    description: 'Card media gradients, status chips, and room code contrast.',
    editableTokens: ['primary', 'accent', 'secondary', 'card', 'foreground'],
    tokens: ['primary', 'accent', 'secondary', 'card', 'foreground'],
  },
  roomDetails: {
    label: 'Room details',
    description: 'Expanded card copy, detail stats, and nested card surfaces.',
    editableTokens: ['card', 'cardForeground', 'mutedForeground', 'primary', 'border'],
    tokens: ['card', 'cardForeground', 'mutedForeground', 'primary', 'border'],
  },
} satisfies Record<PreviewSurfaceId, PreviewSurfaceDefinition>

const surfaceRoleTokenPriority = [
  'sidebar',
  'header',
  'card',
  'popover',
  'background',
  'surfaceElevated',
  'muted',
  'secondary',
  'input',
  'mediaBackground',
] as const satisfies ReadonlyArray<EditableThemeTokenName>

const contentRoleTokenPriority = [
  'sidebarForeground',
  'headerForeground',
  'cardForeground',
  'popoverForeground',
  'foreground',
  'mutedForeground',
  'secondaryForeground',
  'mediaForeground',
  'accentForeground',
  'primaryForeground',
] as const satisfies ReadonlyArray<EditableThemeTokenName>

const actionRoleTokenPriority = [
  'primary',
  'sidebarPrimary',
  'accent',
  'sidebarAccent',
  'ring',
  'success',
  'warning',
  'destructive',
] as const satisfies ReadonlyArray<EditableThemeTokenName>

const selectionRoleTokenPriority = [
  'sidebarAccent',
  'accent',
  'secondary',
  'muted',
  'tabsActive',
] as const satisfies ReadonlyArray<EditableThemeTokenName>

const edgeRoleTokenPriority = [
  'border',
  'sidebarBorder',
  'headerBorder',
  'input',
  'ring',
  'sidebarRing',
] as const satisfies ReadonlyArray<EditableThemeTokenName>

const foregroundPairs: Partial<Record<EditableThemeTokenName, EditableThemeTokenName>> = {
  accent: 'accentForeground',
  card: 'cardForeground',
  destructive: 'destructiveForeground',
  header: 'headerForeground',
  mediaBackground: 'mediaForeground',
  muted: 'mutedForeground',
  popover: 'popoverForeground',
  primary: 'primaryForeground',
  secondary: 'secondaryForeground',
  sidebar: 'sidebarForeground',
  sidebarAccent: 'sidebarAccentForeground',
  sidebarPrimary: 'sidebarPrimaryForeground',
  success: 'successForeground',
  warning: 'warningForeground',
}

const linkedRoleTokens: Partial<Record<EditableThemeTokenName, Array<EditableThemeTokenName>>> = {
  accent: ['sidebarAccent'],
  background: ['muted'],
  border: ['input', 'headerBorder', 'sidebarBorder'],
  card: ['popover', 'surfaceElevated'],
  header: ['card'],
  input: ['border'],
  primary: ['ring', 'sidebarPrimary', 'logoAccent', 'chart1'],
  ring: ['sidebarRing'],
  sidebarAccent: ['accent'],
  sidebarBorder: ['border', 'input'],
  sidebarPrimary: ['primary', 'ring'],
}

const globalLinkedEditableTokens: ReadonlyArray<EditableThemeTokenName> = [
  'chart1',
  'chart2',
  'logoAccent',
  'ring',
  'sidebarAccent',
  'sidebarPrimary',
  'sidebarRing',
]

export function AppearancePreviewWorkbench() {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const accessToken = useAuthStore((state) => state.accessToken)
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated)
  const updateProfileMutation = usePatchApiProfileMe()
  const { resolvedMode, setAppearanceSettings, settings } = useAppearance()
  const [previewMode, setPreviewMode] = useState<ResolvedAppearanceMode>(resolvedMode)
  const previewTokens = useMemo(
    () => resolveThemeTokens(settings, previewMode),
    [previewMode, settings],
  )
  const savedAccountAppearance = getAppearanceSettingsFromAppConfig(user?.appConfig)
  const savedTargetSignature = serializeSettings(
    savedAccountAppearance ?? defaultAppearanceSettings,
  )
  const currentSignature = serializeSettings(settings)
  const hasUnsavedAccountChanges = Boolean(user) && currentSignature !== savedTargetSignature
  const saveTarget = user ? 'account' : 'this device'

  useEffect(() => {
    setPreviewMode(resolvedMode)
  }, [resolvedMode])

  function updateTokens(updates: Partial<Record<EditableThemeTokenName, string>>) {
    const normalizedUpdates = Object.entries(updates).reduce<
      Partial<Record<EditableThemeTokenName, string>>
    >((nextUpdates, [tokenName, value]) => {
      const normalized = normalizeHexColor(value ?? '')

      if (normalized) {
        nextUpdates[tokenName as EditableThemeTokenName] = normalized
      }

      return nextUpdates
    }, {})

    if (!Object.keys(normalizedUpdates).length) {
      return
    }

    setAppearanceSettings({
      ...settings,
      customTheme: {
        enabled: true,
        overrides: {
          ...settings.customTheme.overrides,
          [previewMode]: {
            ...settings.customTheme.overrides[previewMode],
            ...normalizedUpdates,
          },
        },
      },
    })
  }

  function resetTokens(tokensToReset: Array<EditableThemeTokenName>) {
    const currentModeOverrides = { ...settings.customTheme.overrides[previewMode] }

    tokensToReset.forEach((tokenName) => {
      delete currentModeOverrides[tokenName]
    })

    setAppearanceSettings({
      ...settings,
      customTheme: {
        ...settings.customTheme,
        overrides: {
          ...settings.customTheme.overrides,
          [previewMode]: currentModeOverrides,
        },
      },
    })
  }

  function resetSurface(tokensToReset: Array<EditableThemeTokenName>) {
    resetTokens(tokensToReset)
  }

  async function saveAppearance() {
    if (!user) {
      toast.success('Appearance is saved on this device.')
      return
    }

    if (!accessToken) {
      toast.error('Sign in again to save appearance settings.')
      return
    }

    try {
      const nextAppConfig = withAppearanceSettingsInAppConfig(user.appConfig, settings)
      const payload = {
        appConfig: nextAppConfig,
      } satisfies PatchApiProfileMeMutationBody
      const response = await updateProfileMutation.mutateAsync({ data: payload })

      setAuthenticated(
        {
          ...user,
          appConfig: response.profile.appConfig ?? nextAppConfig,
        },
        accessToken,
      )
      await queryClient.invalidateQueries({ queryKey: getGetApiProfileMeQueryKey() })
      toast.success('Appearance saved to account.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to save appearance settings.'))
    }
  }

  return (
    <div className="min-h-[calc(100vh-2rem)] overflow-auto p-6">
      <div className="mx-auto grid w-full max-w-7xl gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Eye className="size-4" />
              Appearance
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">Preview workbench</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Inspect the active theme against the real app shell and dashboard components, then
              tune the selected surface in place.
            </p>
          </div>
          <Button asChild className="w-full md:w-auto">
            <Link to="/appearance/colors">
              <SlidersHorizontal className="size-4" />
              Edit colors
            </Link>
          </Button>
        </div>

        <ThemePreview
          draft={settings}
          hasUnsavedAccountChanges={hasUnsavedAccountChanges}
          mode={previewMode}
          onResetSurface={resetSurface}
          onResetTokens={resetTokens}
          onSaveAppearance={saveAppearance}
          onModeChange={setPreviewMode}
          onTokensChange={updateTokens}
          saveTarget={saveTarget}
          saving={updateProfileMutation.isPending}
          tokens={previewTokens}
        />
      </div>
    </div>
  )
}

function ThemePreview({
  draft,
  hasUnsavedAccountChanges,
  mode,
  onModeChange,
  onResetSurface,
  onResetTokens,
  onSaveAppearance,
  onTokensChange,
  saveTarget,
  saving,
  tokens,
}: {
  draft: AppearanceSettings
  hasUnsavedAccountChanges: boolean
  mode: ResolvedAppearanceMode
  onModeChange: (mode: ResolvedAppearanceMode) => void
  onResetSurface: (tokens: Array<EditableThemeTokenName>) => void
  onResetTokens: (tokens: Array<EditableThemeTokenName>) => void
  onSaveAppearance: () => void
  onTokensChange: (updates: Partial<Record<EditableThemeTokenName, string>>) => void
  saveTarget: string
  saving: boolean
  tokens: ThemeTokens
}) {
  const [activeSurface, setActiveSurface] = useState<PreviewSurfaceId>('sidebar')
  const [previewRooms] = useState<Array<RoomWorkspaceItem>>(appearancePreviewProjects)
  const surfaceElementsRef = useRef<Map<PreviewSurfaceId, HTMLDivElement>>(new Map())
  const activeDefinition = previewSurfaces[activeSurface]
  const previewStyle = {
    ...getThemeTokenStyle(tokens),
    colorScheme: mode,
  } as CSSProperties

  function registerSurface(surface: PreviewSurfaceId, node: HTMLDivElement | null) {
    if (node) {
      surfaceElementsRef.current.set(surface, node)
      return
    }

    surfaceElementsRef.current.delete(surface)
  }

  function selectSurface(surface: PreviewSurfaceId, reveal = false) {
    setActiveSurface(surface)

    if (!reveal) {
      return
    }

    window.requestAnimationFrame(() => {
      surfaceElementsRef.current.get(surface)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      })
    })
  }

  function renderQuickEditor(surface: PreviewSurfaceId) {
    const definition = previewSurfaces[surface]

    return (
      <SurfaceQuickEditor
        definition={definition}
        hasUnsavedAccountChanges={hasUnsavedAccountChanges}
        mode={mode}
        onResetSurface={() => onResetSurface(getSurfaceResetTokens(definition))}
        onSaveAppearance={onSaveAppearance}
        onResetTokens={onResetTokens}
        onTokensChange={onTokensChange}
        saveTarget={saveTarget}
        saving={saving}
        settings={draft}
        tokens={tokens}
      />
    )
  }

  function renderDashboardSurface(surface: RoomsDashboardSurfaceId, children: ReactNode) {
    return (
      <PreviewHotspot
        active={activeSurface === surface}
        editor={renderQuickEditor(surface)}
        label={previewSurfaces[surface].label}
        surfaceId={surface}
        onRegister={registerSurface}
        onSelect={() => selectSurface(surface)}
      >
        {children}
      </PreviewHotspot>
    )
  }

  function renderShellSurface(surface: AppShellSurfaceId, children: ReactNode) {
    return (
      <PreviewHotspot
        active={activeSurface === surface}
        editor={renderQuickEditor(surface)}
        label={previewSurfaces[surface].label}
        surfaceId={surface}
        onRegister={registerSurface}
        onSelect={() => selectSurface(surface)}
      >
        {children}
      </PreviewHotspot>
    )
  }

  function preventPreviewNavigation(event: MouseEvent<HTMLDivElement>) {
    const target = event.target

    if (target instanceof Element && target.closest('a')) {
      event.preventDefault()
    }
  }

  return (
    <div
      style={previewStyle}
      className={cn(
        'grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]',
        mode === 'dark' && 'dark',
      )}
    >
      <section className="min-w-0 rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Interactive workspace preview</h2>
            <p className="mt-1 text-sm text-muted-foreground">Active mode resolves to {mode}.</p>
          </div>
          <Select
            value={mode}
            onValueChange={(value) => onModeChange(value as ResolvedAppearanceMode)}
          >
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div
          onClickCapture={preventPreviewNavigation}
          className={cn(
            'relative min-w-0 overflow-hidden rounded-xl border bg-background text-foreground shadow-sm',
            mode === 'dark' && 'dark',
          )}
        >
          <div className="p-3">
            <div className="relative grid h-[52rem] min-h-[42rem] min-w-0 grid-cols-[17rem_minmax(0,1fr)] items-start gap-3 rounded-[2rem] bg-[radial-gradient(circle_at_12%_10%,color-mix(in_srgb,var(--primary)_18%,transparent),transparent_28rem),radial-gradient(circle_at_84%_16%,color-mix(in_srgb,var(--accent)_16%,transparent),transparent_30rem),linear-gradient(135deg,var(--background),var(--muted)_48%,var(--background))] p-3">
              <PreviewHotspot
                active={activeSurface === 'sidebar'}
                editor={renderQuickEditor('sidebar')}
                label={previewSurfaces.sidebar.label}
                surfaceId="sidebar"
                onRegister={registerSurface}
                onSelect={() => selectSurface('sidebar')}
              >
                <AppSidebar
                  className="h-[calc(52rem-1.5rem)] max-w-full"
                  renderSurface={renderShellSurface}
                />
              </PreviewHotspot>

              <div className="min-h-0 min-w-0 flex-1 overflow-hidden rounded-[2rem] border border-border/70 bg-card/90 shadow-[0_28px_90px_color-mix(in_srgb,var(--foreground)_12%,transparent)] backdrop-blur">
                <PreviewHotspot
                  active={activeSurface === 'header'}
                  editor={renderQuickEditor('header')}
                  label={previewSurfaces.header.label}
                  surfaceId="header"
                  onRegister={registerSurface}
                  onSelect={() => selectSurface('header')}
                >
                  <AppShellHeader
                    actions={<PreviewHeaderActions />}
                    renderSurface={renderShellSurface}
                  />
                </PreviewHotspot>

                <main className="h-[calc(52rem-6.5rem)] overflow-auto pb-20">
                  <RoomsDashboardView
                    className="p-6"
                    navigation="preview"
                    rooms={previewRooms}
                    renderSurface={renderDashboardSurface}
                  />
                </main>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <ContrastRow
            label="Primary action"
            passes={meetsNormalTextContrast(tokens.primaryForeground, tokens.primary)}
            ratio={getContrastRatio(tokens.primaryForeground, tokens.primary)}
          />
          <ContrastRow
            label="Accent state"
            passes={meetsNormalTextContrast(tokens.accentForeground, tokens.accent)}
            ratio={getContrastRatio(tokens.accentForeground, tokens.accent)}
          />
          <ContrastRow
            label="Card text"
            passes={meetsNormalTextContrast(tokens.cardForeground, tokens.card)}
            ratio={getContrastRatio(tokens.cardForeground, tokens.card)}
          />
          <ContrastRow
            label="Sidebar active"
            passes={meetsNormalTextContrast(tokens.sidebarAccentForeground, tokens.sidebarAccent)}
            ratio={getContrastRatio(tokens.sidebarAccentForeground, tokens.sidebarAccent)}
          />
        </div>
      </section>

      <SurfaceEditor
        definition={activeDefinition}
        hasUnsavedAccountChanges={hasUnsavedAccountChanges}
        mode={mode}
        onSaveAppearance={onSaveAppearance}
        settings={draft}
        saveTarget={saveTarget}
        saving={saving}
        tokens={tokens}
        onResetSurface={() => onResetSurface(getSurfaceResetTokens(activeDefinition))}
        onResetTokens={onResetTokens}
        onTokensChange={onTokensChange}
      />
    </div>
  )
}

function PreviewHeaderActions() {
  return (
    <>
      <Button type="button" variant="outline" size="icon" className="rounded-full bg-card/80">
        <Bell className="size-4" />
        <span className="sr-only">Notifications</span>
      </Button>
      <Button type="button" className="rounded-full">
        <PlayCircle className="size-4" />
        Start room
      </Button>
    </>
  )
}

function SurfaceQuickEditor({
  definition,
  hasUnsavedAccountChanges,
  mode,
  onResetSurface,
  onResetTokens,
  onSaveAppearance,
  onTokensChange,
  saveTarget,
  saving,
  settings,
  tokens,
}: {
  definition: PreviewSurfaceDefinition
  hasUnsavedAccountChanges: boolean
  mode: ResolvedAppearanceMode
  onResetSurface: () => void
  onResetTokens: (tokens: Array<EditableThemeTokenName>) => void
  onSaveAppearance: () => void
  onTokensChange: (updates: Partial<Record<EditableThemeTokenName, string>>) => void
  saveTarget: string
  saving: boolean
  settings: AppearanceSettings
  tokens: ThemeTokens
}) {
  const modeOverrides = settings.customTheme.overrides[mode] ?? {}
  const roles = getSurfaceRoles(definition).slice(0, 3)
  const hasSurfaceOverrides = getSurfaceResetTokens(definition).some((tokenName) =>
    Boolean(modeOverrides[tokenName]),
  )

  return (
    <div
      data-appearance-editor
      className="absolute left-2 top-2 z-30 flex max-w-[calc(100%-1rem)] items-center gap-1 rounded-full border bg-card/95 px-2 py-1 text-card-foreground shadow-2xl backdrop-blur-xl"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="mr-1 hidden min-w-0 items-center gap-1.5 px-1 text-[0.68rem] font-semibold sm:flex">
        <MousePointer2 className="size-3.5 text-primary" />
        <span className="max-w-28 truncate">{definition.label}</span>
      </div>

      {roles.map((role) => {
        const resolvedValue = normalizeHexColor(tokens[role.token]) ?? '#000000'
        const customized = getRoleResetTokens(role).some((tokenName) =>
          Boolean(modeOverrides[tokenName]),
        )

        return (
          <Tooltip key={`${role.label}-${role.token}`} text={role.label} sideOffset={6}>
            <label
              className={cn(
                'grid size-7 cursor-pointer place-items-center rounded-full border bg-background shadow-sm',
                customized && 'border-primary ring-2 ring-primary/20',
              )}
            >
              <input
                type="color"
                value={resolvedValue}
                onChange={(event) => onTokensChange(getRoleTokenUpdates(role, event.target.value))}
                className="sr-only"
                aria-label={`${role.label} color picker`}
              />
              <span
                className="size-4 rounded-full border border-border"
                style={{ backgroundColor: resolvedValue }}
                aria-hidden
              />
            </label>
          </Tooltip>
        )
      })}

      {roles.length ? (
        <Tooltip text="Reset selected role" sideOffset={6}>
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="size-7 rounded-full bg-background"
            disabled={!hasSurfaceOverrides}
            onClick={() => onResetTokens(getRoleResetTokens(roles[0]))}
            aria-label={`Reset ${roles[0].label}`}
          >
            <RotateCcw className="size-3.5" />
          </Button>
        </Tooltip>
      ) : null}

      <Tooltip text={`Save to ${saveTarget}`} sideOffset={6}>
        <Button
          type="button"
          size="icon"
          className="size-7 rounded-full"
          disabled={saving || (saveTarget === 'account' && !hasUnsavedAccountChanges)}
          onClick={onSaveAppearance}
          aria-label={`Save ${definition.label} appearance`}
        >
          {saving ? (
            <SpinIcon size="sm" label="Saving appearance" />
          ) : (
            <Save className="size-3.5" />
          )}
        </Button>
      </Tooltip>

      <Tooltip text="Reset surface" sideOffset={6}>
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="size-7 rounded-full bg-background"
          disabled={!hasSurfaceOverrides}
          onClick={onResetSurface}
          aria-label={`Reset ${definition.label} appearance`}
        >
          <span className="text-[0.65rem] font-semibold">All</span>
        </Button>
      </Tooltip>
    </div>
  )
}

function SurfaceEditor({
  definition,
  hasUnsavedAccountChanges,
  mode,
  onResetSurface,
  onResetTokens,
  onSaveAppearance,
  onTokensChange,
  saveTarget,
  saving,
  settings,
  tokens,
}: {
  definition: PreviewSurfaceDefinition
  hasUnsavedAccountChanges: boolean
  mode: ResolvedAppearanceMode
  onResetSurface: () => void
  onResetTokens: (tokens: Array<EditableThemeTokenName>) => void
  onSaveAppearance: () => void
  onTokensChange: (updates: Partial<Record<EditableThemeTokenName, string>>) => void
  saveTarget: string
  saving: boolean
  settings: AppearanceSettings
  tokens: ThemeTokens
}) {
  const modeOverrides = settings.customTheme.overrides[mode] ?? {}
  const roles = getSurfaceRoles(definition)
  const hasSurfaceOverrides = getSurfaceResetTokens(definition).some((tokenName) =>
    Boolean(modeOverrides[tokenName]),
  )

  return (
    <aside
      data-appearance-editor
      className="grid max-h-[52rem] min-w-0 content-start gap-4 overflow-y-auto rounded-xl border bg-card/95 p-4 text-card-foreground shadow-sm backdrop-blur-xl xl:sticky xl:top-4"
    >
      <div className="grid gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <PanelRightOpen className="size-4 text-primary" />
              {definition.label}
            </div>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{definition.description}</p>
            <p className="mt-2 text-[0.68rem] leading-4 text-muted-foreground">
              Select another highlighted surface in the workspace to edit it here.
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-success/12 px-2 py-1 text-[0.68rem] font-medium text-success">
            <Check className="size-3.5" />
            Live
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {roles.slice(0, 4).map((role) => (
            <button
              key={`${role.label}-${role.token}`}
              type="button"
              className="flex items-center gap-2 rounded-lg border bg-background px-2 py-2 text-left text-xs shadow-sm transition hover:border-primary/50"
              onClick={() =>
                document.getElementById(getSurfaceRoleControlId(mode, definition, role))?.focus()
              }
            >
              <span
                className="size-4 shrink-0 rounded-full border"
                style={{ backgroundColor: tokens[role.token] }}
                aria-hidden
              />
              <span className="min-w-0 truncate">{role.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        {roles.map((role) => (
          <SurfaceRoleControl
            key={`${role.label}-${role.token}`}
            customValues={modeOverrides}
            definition={definition}
            mode={mode}
            role={role}
            tokens={tokens}
            onReset={() => onResetTokens(getRoleResetTokens(role))}
            onTokensChange={onTokensChange}
          />
        ))}
      </div>

      <div className="grid gap-2 border-t pt-4">
        <Button
          type="button"
          disabled={saving || (saveTarget === 'account' && !hasUnsavedAccountChanges)}
          onClick={onSaveAppearance}
        >
          {saving ? <SpinIcon size="sm" label="Saving appearance" /> : <Save className="size-4" />}
          {hasUnsavedAccountChanges ? `Save to ${saveTarget}` : `Saved on ${saveTarget}`}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!hasSurfaceOverrides}
          onClick={onResetSurface}
        >
          <RotateCcw className="size-4" />
          Reset selected surface
        </Button>
        <Button asChild variant="ghost">
          <Link to="/appearance/colors">
            <SlidersHorizontal className="size-4" />
            Advanced color studio
          </Link>
        </Button>
      </div>
    </aside>
  )
}

function SurfaceRoleControl({
  customValues,
  definition,
  mode,
  onReset,
  onTokensChange,
  role,
  tokens,
}: {
  customValues: Partial<Record<EditableThemeTokenName, string>>
  definition: PreviewSurfaceDefinition
  mode: ResolvedAppearanceMode
  onReset: () => void
  onTokensChange: (updates: Partial<Record<EditableThemeTokenName, string>>) => void
  role: SurfaceRole
  tokens: ThemeTokens
}) {
  const resolvedValue = normalizeHexColor(tokens[role.token]) ?? '#000000'
  const [inputValue, setInputValue] = useState(resolvedValue)
  const roleResetTokens = getRoleResetTokens(role)
  const customized = roleResetTokens.some((tokenName) => Boolean(customValues[tokenName]))
  const contrastForegroundToken = role.foregroundToken ?? foregroundPairs[role.token]
  const contrastForeground = contrastForegroundToken ? tokens[contrastForegroundToken] : null
  const contrastRatio = contrastForeground
    ? getContrastRatio(contrastForeground, resolvedValue)
    : null
  const inputId = getSurfaceRoleControlId(mode, definition, role)

  useEffect(() => {
    setInputValue(resolvedValue)
  }, [resolvedValue])

  function updateValue(nextValue: string) {
    setInputValue(nextValue)

    if (normalizeHexColor(nextValue)) {
      onTokensChange(getRoleTokenUpdates(role, nextValue))
    }
  }

  return (
    <div
      className={cn(
        'grid gap-2 rounded-lg border bg-background p-3',
        customized && 'border-primary/60 shadow-[inset_3px_0_0_var(--primary)]',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <label htmlFor={inputId} className="text-xs font-semibold">
            {role.label}
          </label>
          <div className="mt-1 text-[0.68rem] leading-4 text-muted-foreground">
            {role.description}
          </div>
        </div>
        <span
          className="size-7 shrink-0 rounded-md border"
          style={{ backgroundColor: resolvedValue }}
          aria-hidden
        />
      </div>

      <div className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-2">
        <input
          type="color"
          value={resolvedValue}
          onChange={(event) => updateValue(event.target.value)}
          className="size-10 rounded-md border border-border bg-transparent"
          aria-label={`${role.label} color picker`}
        />
        <Input
          id={inputId}
          value={inputValue}
          onBlur={() => setInputValue(resolvedValue)}
          onChange={(event) => updateValue(event.target.value)}
          className="h-8 font-mono text-xs"
          aria-label={`${role.label} hex value`}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={!customized}
          onClick={onReset}
          aria-label={`Reset ${role.label}`}
        >
          <RotateCcw className="size-4" />
        </Button>
      </div>

      {contrastRatio ? (
        <div
          className={cn(
            'rounded-md px-2 py-1 text-[0.68rem] font-medium',
            contrastRatio >= 4.5
              ? 'bg-success/15 text-success'
              : contrastRatio >= 3
                ? 'bg-warning/20 text-warning-foreground'
                : 'bg-destructive/15 text-destructive',
          )}
        >
          Text contrast {contrastRatio.toFixed(2)}:1
        </div>
      ) : null}
    </div>
  )
}

function PreviewHotspot({
  active,
  children,
  editor,
  label,
  onRegister,
  onSelect,
  surfaceId,
}: {
  active: boolean
  children: ReactNode
  editor?: ReactNode
  label: string
  onRegister: (surface: PreviewSurfaceId, node: HTMLDivElement | null) => void
  onSelect: () => void
  surfaceId: PreviewSurfaceId
}) {
  return (
    <div
      ref={(node) => onRegister(surfaceId, node)}
      className={cn(
        'group relative min-w-0 rounded-[inherit] outline-none',
        active && 'ring-2 ring-primary/65 ring-offset-2 ring-offset-background',
      )}
      role="group"
      tabIndex={0}
      aria-label={`Customize ${label}`}
      onFocus={onSelect}
      onPointerDownCapture={(event) => {
        const target = event.target

        if (target instanceof Element && target.closest('[data-appearance-editor]')) {
          return
        }

        onSelect()
      }}
    >
      {children}
      {active ? editor : null}
      <div
        className={cn(
          'pointer-events-none absolute right-2 top-2 z-20 rounded-md border bg-background/92 px-2 py-1 text-[0.68rem] font-medium text-foreground opacity-0 shadow-sm backdrop-blur transition-opacity',
          active ? 'opacity-100' : 'group-hover:opacity-100 group-focus-within:opacity-100',
        )}
      >
        {label}
      </div>
    </div>
  )
}

function getSurfaceRoles(definition: PreviewSurfaceDefinition) {
  const roles: Array<SurfaceRole> = []
  const used = new Set<EditableThemeTokenName>()
  const addRole = (role: SurfaceRole | null) => {
    if (!role || used.has(role.token)) {
      return
    }

    roles.push(role)
    used.add(role.token)
  }
  const surfaceToken = pickEditableToken(definition.editableTokens, surfaceRoleTokenPriority)
  const contentToken = pickEditableToken(definition.editableTokens, contentRoleTokenPriority)
  const actionToken = pickEditableToken(definition.editableTokens, actionRoleTokenPriority)
  const selectionToken = pickEditableToken(definition.editableTokens, selectionRoleTokenPriority)
  const edgeToken = pickEditableToken(definition.editableTokens, edgeRoleTokenPriority)

  addRole(
    surfaceToken
      ? {
          label: 'Surface',
          description: 'Changes the selected area background and keeps readable text paired to it.',
          token: surfaceToken,
          foregroundToken: foregroundPairs[surfaceToken],
          linkedTokens: getLinkedTokensForRole(surfaceToken, definition.editableTokens),
        }
      : null,
  )
  addRole(
    contentToken
      ? {
          label: 'Content',
          description: 'Adjusts labels, icons, descriptions, and other readable content.',
          token: contentToken,
        }
      : null,
  )
  addRole(
    actionToken
      ? {
          label: 'Action',
          description: 'Updates primary commands, badges, focus color, and related brand accents.',
          token: actionToken,
          foregroundToken: foregroundPairs[actionToken],
          linkedTokens: getLinkedTokensForRole(actionToken, definition.editableTokens),
        }
      : null,
  )
  addRole(
    selectionToken
      ? {
          label: 'Selection',
          description: 'Tunes active items, selected states, and soft highlighted regions.',
          token: selectionToken,
          foregroundToken: foregroundPairs[selectionToken],
          linkedTokens: getLinkedTokensForRole(selectionToken, definition.editableTokens),
        }
      : null,
  )
  addRole(
    edgeToken
      ? {
          label: 'Edges',
          description: 'Controls borders, field strokes, and keyboard focus treatment.',
          token: edgeToken,
          linkedTokens: getLinkedTokensForRole(edgeToken, definition.editableTokens),
        }
      : null,
  )

  return roles
}

function pickEditableToken(
  editableTokens: Array<EditableThemeTokenName>,
  priority: ReadonlyArray<EditableThemeTokenName>,
) {
  return priority.find((tokenName) => editableTokens.includes(tokenName)) ?? null
}

function getLinkedTokensForRole(
  tokenName: EditableThemeTokenName,
  editableTokens: Array<EditableThemeTokenName>,
) {
  const linkedTokens = linkedRoleTokens[tokenName] ?? []

  return linkedTokens.filter(
    (linkedToken) =>
      linkedToken !== tokenName &&
      (editableTokens.includes(linkedToken) || globalLinkedEditableTokens.includes(linkedToken)),
  )
}

function getRoleTokenUpdates(role: SurfaceRole, nextValue: string) {
  const normalized = normalizeHexColor(nextValue)

  if (!normalized) {
    return {}
  }

  const updates: Partial<Record<EditableThemeTokenName, string>> = {
    [role.token]: normalized,
  }
  const pairedForeground = role.foregroundToken ?? foregroundPairs[role.token]

  if (pairedForeground) {
    updates[pairedForeground] = getReadableForeground(normalized)
  }

  role.linkedTokens?.forEach((linkedToken) => {
    updates[linkedToken] = normalized

    const linkedForeground = foregroundPairs[linkedToken]

    if (linkedForeground) {
      updates[linkedForeground] = getReadableForeground(normalized)
    }
  })

  return updates
}

function getRoleResetTokens(role: SurfaceRole) {
  const tokensToReset = new Set<EditableThemeTokenName>([role.token])
  const pairedForeground = role.foregroundToken ?? foregroundPairs[role.token]

  if (pairedForeground) {
    tokensToReset.add(pairedForeground)
  }

  role.linkedTokens?.forEach((linkedToken) => {
    tokensToReset.add(linkedToken)

    const linkedForeground = foregroundPairs[linkedToken]

    if (linkedForeground) {
      tokensToReset.add(linkedForeground)
    }
  })

  return Array.from(tokensToReset)
}

function getSurfaceResetTokens(definition: PreviewSurfaceDefinition) {
  const tokensToReset = new Set<EditableThemeTokenName>(definition.editableTokens)

  getSurfaceRoles(definition).forEach((role) => {
    getRoleResetTokens(role).forEach((tokenName) => tokensToReset.add(tokenName))
  })

  return Array.from(tokensToReset)
}

function getSurfaceRoleControlId(
  mode: ResolvedAppearanceMode,
  definition: PreviewSurfaceDefinition,
  role: SurfaceRole,
) {
  return `surface-${mode}-${definition.label.toLowerCase().replace(/\W+/g, '-')}-${role.label
    .toLowerCase()
    .replace(/\W+/g, '-')}`
}

function serializeSettings(settings: AppearanceSettings) {
  return JSON.stringify(settings)
}

function ContrastRow({
  label,
  passes,
  ratio,
}: {
  label: string
  passes: boolean
  ratio: number | null
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/40 px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className={passes ? 'font-medium text-success' : 'font-medium text-destructive'}>
        {ratio ? `${ratio.toFixed(2)}:1` : 'n/a'} {passes ? 'AA' : 'Review'}
      </span>
    </div>
  )
}
