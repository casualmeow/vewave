import {
  BarChart3,
  Bell,
  CalendarClock,
  Check,
  Eye,
  FileVideo,
  Filter,
  ImageIcon,
  LayoutDashboard,
  MessageSquareText,
  PanelRightOpen,
  PlayCircle,
  Radio,
  RotateCcw,
  Save,
  Search,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  Tags,
  Upload,
  UsersRound,
  Wand2,
} from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { toast } from 'sonner'

import {
  defaultAppearanceSettings,
  getAppearanceSettingsFromAppConfig,
  getThemeTokenStyle,
  resolveThemeTokens,
  useAppearance,
  VewaveLogoMark,
  withAppearanceSettingsInAppConfig,
  type AppearanceSettings,
  type EditableThemeTokenName,
  type ResolvedAppearanceMode,
  type ThemeTokens,
  type UserAppConfig,
} from '@/shared/theme'
import {
  getContrastRatio,
  meetsNormalTextContrast,
  normalizeHexColor,
} from '@/shared/theme/validators'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Progress,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SpinIcon,
  Table,
  TableCell,
  TableHeader,
  TableRow,
  Tooltip,
} from '@/shared/ui'
import { cn } from '@/shared/lib/utils'
import {
  getGetApiProfileMeQueryKey,
  usePatchApiProfileMe,
  type PatchApiProfileMeMutationBody,
} from '@/core/api/generated/profile/profile'
import { getApiErrorMessage } from '@/core/api/http/errors'
import { useAuthStore } from '@/modules/auth'

type PreviewSurfaceId =
  | 'sidebar'
  | 'header'
  | 'actions'
  | 'metrics'
  | 'queue'
  | 'inspector'
  | 'media'

type PreviewSurfaceDefinition = {
  description: string
  editableTokens: Array<EditableThemeTokenName>
  label: string
  tokens: Array<keyof ThemeTokens>
}

const previewSurfaces = {
  sidebar: {
    label: 'Sidebar',
    description: 'Navigation surface, active state, separators, and logo contrast.',
    editableTokens: ['sidebar', 'sidebarForeground', 'sidebarAccent', 'sidebarAccentForeground'],
    tokens: ['sidebar', 'sidebarForeground', 'sidebarAccent', 'sidebarAccentForeground'],
  },
  header: {
    label: 'Header',
    description: 'Top bar surface, header text, border, and primary commands.',
    editableTokens: ['header', 'headerForeground', 'headerBorder', 'primary'],
    tokens: ['header', 'headerForeground', 'headerBorder', 'primary'],
  },
  actions: {
    label: 'Actions',
    description: 'Primary and secondary command contrast across the workspace.',
    editableTokens: ['primary', 'primaryForeground', 'secondary', 'secondaryForeground', 'ring'],
    tokens: ['primary', 'primaryForeground', 'secondary', 'secondaryForeground', 'ring'],
  },
  metrics: {
    label: 'Metrics',
    description: 'Cards, charts, progress bars, and supporting labels.',
    editableTokens: ['card', 'cardForeground', 'mutedForeground', 'chart1', 'chart2'],
    tokens: ['card', 'cardForeground', 'mutedForeground', 'chart1', 'chart2'],
  },
  queue: {
    label: 'Queue',
    description: 'Tables, status badges, muted surfaces, and state colors.',
    editableTokens: ['card', 'border', 'success', 'warning', 'destructive'],
    tokens: ['card', 'border', 'success', 'warning', 'destructive'],
  },
  inspector: {
    label: 'Inspector',
    description: 'Detail panels, forms, input borders, and focus rings.',
    editableTokens: ['card', 'cardForeground', 'input', 'ring', 'popover'],
    tokens: ['card', 'cardForeground', 'input', 'ring', 'popover'],
  },
  media: {
    label: 'Media',
    description: 'Player canvas, controls, and media foreground tokens.',
    editableTokens: ['mediaBackground', 'mediaForeground'],
    tokens: ['mediaBackground', 'mediaForeground', 'mediaControl', 'mediaMuted'],
  },
} satisfies Record<PreviewSurfaceId, PreviewSurfaceDefinition>

type PreviewStatusTone = 'destructive' | 'muted' | 'success' | 'warning'

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

  function updateToken(tokenName: EditableThemeTokenName, nextValue: string) {
    const normalized = normalizeHexColor(nextValue)

    if (!normalized) {
      return
    }

    const currentModeOverrides = settings.customTheme.overrides[previewMode] ?? {}

    setAppearanceSettings({
      ...settings,
      customTheme: {
        enabled: true,
        overrides: {
          ...settings.customTheme.overrides,
          [previewMode]: {
            ...currentModeOverrides,
            [tokenName]: normalized,
          },
        },
      },
    })
  }

  function resetToken(tokenName: EditableThemeTokenName) {
    const currentModeOverrides = { ...(settings.customTheme.overrides[previewMode] ?? {}) }
    delete currentModeOverrides[tokenName]

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
    const currentModeOverrides = { ...(settings.customTheme.overrides[previewMode] ?? {}) }

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
              Inspect the active theme against a realistic workspace surface and jump back to color
              controls when a component needs adjustment.
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
          onResetToken={resetToken}
          onSaveAppearance={saveAppearance}
          onModeChange={setPreviewMode}
          onTokenChange={updateToken}
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
  onResetToken,
  onSaveAppearance,
  onTokenChange,
  saveTarget,
  saving,
  tokens,
}: {
  draft: AppearanceSettings
  hasUnsavedAccountChanges: boolean
  mode: ResolvedAppearanceMode
  onModeChange: (mode: ResolvedAppearanceMode) => void
  onResetSurface: (tokens: Array<EditableThemeTokenName>) => void
  onResetToken: (token: EditableThemeTokenName) => void
  onSaveAppearance: () => void
  onTokenChange: (token: EditableThemeTokenName, value: string) => void
  saveTarget: string
  saving: boolean
  tokens: ThemeTokens
}) {
  const [activeSurface, setActiveSurface] = useState<PreviewSurfaceId>('sidebar')
  const activeDefinition = previewSurfaces[activeSurface]
  const previewStyle = {
    ...getThemeTokenStyle(tokens),
    colorScheme: mode,
  } as CSSProperties

  return (
    <section className="rounded-lg border bg-card p-4 shadow-sm">
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

      <div className="grid gap-4">
        <div
          style={previewStyle}
          className={cn(
            'relative overflow-x-auto rounded-xl border bg-background text-foreground shadow-sm',
            mode === 'dark' && 'dark',
          )}
        >
          <div className="grid min-h-[46rem] min-w-[72rem] grid-cols-[10rem_minmax(0,1fr)]">
            <PreviewHotspot
              active={activeSurface === 'sidebar'}
              label={previewSurfaces.sidebar.label}
              onSelect={() => setActiveSurface('sidebar')}
            >
              <div className="flex min-w-0 flex-col border-r border-sidebar-border bg-sidebar p-3 text-sidebar-foreground">
                <div className="mb-5 flex items-center gap-2">
                  <VewaveLogoMark
                    className="size-7 shrink-0"
                    logoStrategy={draft.logoStrategy}
                    resolvedMode={mode}
                    surfaceColor={tokens.sidebar}
                  />
                  <div className="min-w-0">
                    <div className="truncate text-xs font-semibold">Vewave</div>
                    <div className="truncate text-[0.62rem] text-sidebar-foreground/65">
                      Workspace
                    </div>
                  </div>
                </div>

                <div className="grid gap-1">
                  <PreviewNavItem
                    active
                    icon={<LayoutDashboard className="size-3.5" />}
                    label="Dashboard"
                  />
                  <PreviewNavItem icon={<FileVideo className="size-3.5" />} label="Uploads" />
                  <PreviewNavItem icon={<Radio className="size-3.5" />} label="Live rooms" />
                  <PreviewNavItem icon={<UsersRound className="size-3.5" />} label="Audience" />
                  <PreviewNavItem icon={<Settings2 className="size-3.5" />} label="Settings" />
                </div>

                <div className="mt-auto rounded-lg border border-sidebar-border bg-sidebar-accent/55 p-2 text-sidebar-accent-foreground">
                  <div className="flex items-center gap-1.5 text-[0.68rem] font-semibold">
                    <Sparkles className="size-3.5" />
                    Brand kit
                  </div>
                  <div className="mt-2 flex gap-1">
                    {[tokens.primary, tokens.accent, tokens.ring].map((value) => (
                      <span
                        key={value}
                        className="size-4 rounded-full border border-sidebar-border"
                        style={{ backgroundColor: value }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </PreviewHotspot>

            <div className="min-w-0 bg-background">
              <PreviewHotspot
                active={activeSurface === 'header'}
                label={previewSurfaces.header.label}
                onSelect={() => setActiveSurface('header')}
              >
                <div className="flex items-center justify-between gap-3 border-b border-header-border bg-header px-4 py-3 text-header-foreground">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">Workspace overview</div>
                    <div className="truncate text-xs text-muted-foreground">
                      Rooms, uploads, and moderation
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="outline" aria-label="Notifications">
                      <Bell className="size-4" />
                    </Button>
                    <Button size="sm">
                      <Upload className="size-4" />
                      Upload
                    </Button>
                  </div>
                </div>
              </PreviewHotspot>

              <div className="grid gap-3 p-4">
                <PreviewHotspot
                  active={activeSurface === 'actions'}
                  label={previewSurfaces.actions.label}
                  onSelect={() => setActiveSurface('actions')}
                >
                  <div className="flex items-center gap-2">
                    <div className="relative min-w-0 flex-1">
                      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value="Search rooms, uploads, playlists"
                        readOnly
                        className="h-9 pl-8 text-xs"
                      />
                    </div>
                    <Button size="sm" variant="outline">
                      <Filter className="size-4" />
                      Filter
                    </Button>
                  </div>
                </PreviewHotspot>

                <PreviewHotspot
                  active={activeSurface === 'metrics'}
                  label={previewSurfaces.metrics.label}
                  onSelect={() => setActiveSurface('metrics')}
                >
                  <div className="grid gap-2 md:grid-cols-3">
                    <PreviewMetric icon={<BarChart3 />} label="Views" value="128k" progress={74} />
                    <PreviewMetric
                      icon={<PlayCircle />}
                      label="Watch time"
                      value="421h"
                      progress={63}
                    />
                    <PreviewMetric
                      icon={<MessageSquareText />}
                      label="Reviews"
                      value="18"
                      progress={42}
                    />
                  </div>
                </PreviewHotspot>

                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_13rem]">
                  <div className="grid min-w-0 gap-3">
                    <PreviewHotspot
                      active={activeSurface === 'queue'}
                      label={previewSurfaces.queue.label}
                      onSelect={() => setActiveSurface('queue')}
                    >
                      <Card className="rounded-lg">
                        <CardHeader className="flex-row items-center justify-between gap-2 pb-3">
                          <div>
                            <CardTitle className="text-sm">Room Queue</CardTitle>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Upcoming room assets and playback checks.
                            </p>
                          </div>
                          <PreviewStatusBadge tone="success">Online</PreviewStatusBadge>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader className="text-[0.68rem] text-muted-foreground">
                              <TableCell className="basis-40 min-w-40 py-2">Asset</TableCell>
                              <TableCell className="basis-20 min-w-20 py-2">State</TableCell>
                              <TableCell className="basis-20 min-w-20 py-2">Owner</TableCell>
                            </TableHeader>
                            <PreviewContentRow
                              icon={<FileVideo />}
                              title="Launch recap"
                              meta="Scheduled in 42m"
                              state="Ready"
                              tone="success"
                              owner="Mira"
                            />
                            <PreviewContentRow
                              icon={<ImageIcon />}
                              title="Hero thumbnails"
                              meta="Needs crop review"
                              state="Review"
                              tone="warning"
                              owner="Egor"
                            />
                            <PreviewContentRow
                              icon={<Radio />}
                              title="Creator room"
                              meta="Live rehearsal"
                              state="Live"
                              tone="destructive"
                              owner="Nika"
                            />
                          </Table>
                        </CardContent>
                      </Card>
                    </PreviewHotspot>

                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="rounded-lg border bg-card p-3 text-card-foreground">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-semibold">Moderation</div>
                          <PreviewStatusBadge tone="warning">4 pending</PreviewStatusBadge>
                        </div>
                        <p className="mt-2 text-xs leading-5 text-muted-foreground">
                          Accent, warning, and destructive states resolve from the active draft.
                        </p>
                      </div>
                      <div className="rounded-lg border bg-card p-3 text-card-foreground">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-semibold">Campaign Tags</div>
                          <Tags className="size-4 text-primary" />
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          <span className="rounded-md bg-primary px-2 py-1 text-[0.68rem] font-medium text-primary-foreground">
                            Featured
                          </span>
                          <span className="rounded-md bg-accent px-2 py-1 text-[0.68rem] font-medium text-accent-foreground">
                            Premiere
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid content-start gap-3">
                    <div className="rounded-lg border bg-card p-3 text-card-foreground">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <PanelRightOpen className="size-4 text-primary" />
                          Inspector
                        </div>
                        <PreviewStatusBadge tone="muted">Draft</PreviewStatusBadge>
                      </div>

                      <div className="mt-3 grid gap-3">
                        <PreviewHotspot
                          active={activeSurface === 'media'}
                          label={previewSurfaces.media.label}
                          onSelect={() => setActiveSurface('media')}
                        >
                          <div className="mt-3 overflow-hidden rounded-md border bg-media-background text-media-foreground">
                            <div className="grid aspect-video place-items-center">
                              <PlayCircle className="size-8" />
                            </div>
                            <div className="flex items-center gap-2 border-t border-media-muted/60 bg-media-control px-2 py-1.5 text-[0.68rem]">
                              <span className="h-1 flex-1 rounded-full bg-media-muted">
                                <span className="block h-full w-7/12 rounded-full bg-media-foreground" />
                              </span>
                              <span>08:42</span>
                            </div>
                          </div>
                        </PreviewHotspot>

                        <PreviewHotspot
                          active={activeSurface === 'inspector'}
                          label={previewSurfaces.inspector.label}
                          onSelect={() => setActiveSurface('inspector')}
                        >
                          <div className="grid gap-2 rounded-md border bg-popover p-2 text-popover-foreground">
                            <Input value="Launch recap" readOnly className="h-8 text-xs" />
                            <div className="rounded-md border bg-muted/40 p-2">
                              <div className="mb-1 flex items-center justify-between text-[0.68rem]">
                                <span className="text-muted-foreground">Readiness</span>
                                <span className="font-medium">82%</span>
                              </div>
                              <Progress value={82} />
                            </div>
                            <Button size="sm" variant="outline">
                              <Wand2 className="size-4" />
                              Optimize
                            </Button>
                          </div>
                        </PreviewHotspot>
                      </div>
                    </div>

                    <div className="rounded-lg border bg-surface-elevated p-3">
                      <div className="flex items-center gap-2 text-xs font-semibold">
                        <CalendarClock className="size-4 text-primary" />
                        Release window
                      </div>
                      <div className="mt-2 text-lg font-semibold">18:30</div>
                      <div className="text-xs text-muted-foreground">Autosaves every 90 sec</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <SurfaceEditor
            definition={activeDefinition}
            hasUnsavedAccountChanges={hasUnsavedAccountChanges}
            mode={mode}
            onSaveAppearance={onSaveAppearance}
            settings={draft}
            saveTarget={saveTarget}
            saving={saving}
            tokens={tokens}
            onResetSurface={() => onResetSurface(activeDefinition.editableTokens)}
            onResetToken={onResetToken}
            onTokenChange={onTokenChange}
          />
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
  )
}

function SurfaceEditor({
  definition,
  hasUnsavedAccountChanges,
  mode,
  onResetSurface,
  onResetToken,
  onSaveAppearance,
  onTokenChange,
  saveTarget,
  saving,
  settings,
  tokens,
}: {
  definition: PreviewSurfaceDefinition
  hasUnsavedAccountChanges: boolean
  mode: ResolvedAppearanceMode
  onResetSurface: () => void
  onResetToken: (token: EditableThemeTokenName) => void
  onSaveAppearance: () => void
  onTokenChange: (token: EditableThemeTokenName, value: string) => void
  saveTarget: string
  saving: boolean
  settings: AppearanceSettings
  tokens: ThemeTokens
}) {
  const modeOverrides = settings.customTheme.overrides[mode] ?? {}
  const hasSurfaceOverrides = definition.editableTokens.some((tokenName) =>
    Boolean(modeOverrides[tokenName]),
  )

  return (
    <aside className="absolute bottom-3 right-3 top-3 z-30 grid w-80 content-start gap-4 overflow-y-auto rounded-xl border bg-card/95 p-4 text-card-foreground shadow-2xl backdrop-blur-xl">
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

        <div className="flex flex-wrap gap-2">
          {definition.tokens.map((tokenName) => (
            <span
              key={tokenName}
              className="inline-flex items-center gap-2 rounded-md border bg-background px-2 py-1 text-[0.68rem]"
            >
              <span
                className="size-3 rounded-full border"
                style={{ backgroundColor: tokens[tokenName] }}
                aria-hidden
              />
              {formatTokenLabel(tokenName)}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        {definition.editableTokens.map((tokenName) => (
          <SurfaceTokenControl
            key={tokenName}
            customValue={modeOverrides[tokenName]}
            mode={mode}
            tokenName={tokenName}
            tokens={tokens}
            onReset={() => onResetToken(tokenName)}
            onTokenChange={onTokenChange}
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

function SurfaceTokenControl({
  customValue,
  mode,
  onReset,
  onTokenChange,
  tokenName,
  tokens,
}: {
  customValue?: string
  mode: ResolvedAppearanceMode
  onReset: () => void
  onTokenChange: (token: EditableThemeTokenName, value: string) => void
  tokenName: EditableThemeTokenName
  tokens: ThemeTokens
}) {
  const resolvedValue = normalizeHexColor(tokens[tokenName]) ?? '#000000'
  const [inputValue, setInputValue] = useState(resolvedValue)
  const customized = Boolean(customValue)
  const contrastBackground = getLikelyBackground(tokenName, tokens)
  const contrastRatio = tokenName.endsWith('Foreground')
    ? getContrastRatio(resolvedValue, contrastBackground)
    : null
  const inputId = `surface-${mode}-${tokenName}`

  useEffect(() => {
    setInputValue(resolvedValue)
  }, [resolvedValue])

  function updateValue(nextValue: string) {
    setInputValue(nextValue)

    if (normalizeHexColor(nextValue)) {
      onTokenChange(tokenName, nextValue)
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
          <Label htmlFor={inputId} className="text-xs font-semibold">
            {formatTokenLabel(tokenName)}
          </Label>
          <div className="mt-1 truncate text-[0.68rem] text-muted-foreground">
            {customized ? 'Custom override' : 'Preset value'}
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
          aria-label={`${formatTokenLabel(tokenName)} color picker`}
        />
        <Input
          id={inputId}
          value={inputValue}
          onBlur={() => setInputValue(resolvedValue)}
          onChange={(event) => updateValue(event.target.value)}
          className="h-8 font-mono text-xs"
          aria-label={`${formatTokenLabel(tokenName)} hex value`}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={!customized}
          onClick={onReset}
          aria-label={`Reset ${formatTokenLabel(tokenName)}`}
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
          Contrast {contrastRatio.toFixed(2)}:1
        </div>
      ) : null}
    </div>
  )
}

function PreviewNavItem({
  active = false,
  icon,
  label,
}: {
  active?: boolean
  icon: ReactNode
  label: string
}) {
  return (
    <div
      className={cn(
        'flex min-w-0 items-center gap-2 rounded-md px-2 py-2 text-[0.72rem] text-sidebar-foreground/75',
        active && 'bg-sidebar-accent font-medium text-sidebar-accent-foreground',
      )}
    >
      <span className="shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </div>
  )
}

function PreviewHotspot({
  active,
  children,
  label,
  onSelect,
}: {
  active: boolean
  children: ReactNode
  label: string
  onSelect: () => void
}) {
  return (
    <div
      className={cn(
        'group relative min-w-0 overflow-hidden',
        active && 'ring-2 ring-primary/65 ring-offset-2 ring-offset-background',
      )}
    >
      {children}
      <Tooltip text={`Customize ${label}`}>
        <button
          type="button"
          className="absolute inset-0 z-10 cursor-pointer rounded-[inherit] outline-none focus-visible:ring-2 focus-visible:ring-ring/55"
          onClick={onSelect}
          aria-label={`Customize ${label}`}
        />
      </Tooltip>
      <div
        className={cn(
          'pointer-events-none absolute right-2 top-2 z-20 rounded-md border bg-background/92 px-2 py-1 text-[0.68rem] font-medium text-foreground opacity-0 shadow-sm backdrop-blur transition-opacity',
          active ? 'opacity-100' : 'group-hover:opacity-100',
        )}
      >
        {label}
      </div>
    </div>
  )
}

function PreviewMetric({
  icon,
  label,
  progress,
  value,
}: {
  icon: ReactNode
  label: string
  progress: number
  value: string
}) {
  return (
    <div className="rounded-lg border bg-card p-3 text-card-foreground">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-primary [&_svg]:size-4">{icon}</span>
      </div>
      <div className="mt-2 text-xl font-semibold">{value}</div>
      <Progress value={progress} className="mt-3 h-1.5" />
    </div>
  )
}

function PreviewContentRow({
  icon,
  meta,
  owner,
  state,
  title,
  tone,
}: {
  icon: ReactNode
  meta: string
  owner: string
  state: string
  title: string
  tone: PreviewStatusTone
}) {
  return (
    <TableRow className="text-xs">
      <TableCell className="min-w-40 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-primary [&_svg]:size-4">{icon}</span>
          <div className="min-w-0">
            <div className="truncate font-medium">{title}</div>
            <div className="truncate text-muted-foreground">{meta}</div>
          </div>
        </div>
      </TableCell>
      <TableCell className="min-w-20 py-2">
        <PreviewStatusBadge tone={tone}>{state}</PreviewStatusBadge>
      </TableCell>
      <TableCell className="min-w-20 py-2 text-muted-foreground">{owner}</TableCell>
    </TableRow>
  )
}

function formatTokenLabel(tokenName: keyof ThemeTokens) {
  return tokenName.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase())
}

function getLikelyBackground(tokenName: EditableThemeTokenName, tokens: ThemeTokens) {
  const foregroundBackgrounds: Partial<Record<EditableThemeTokenName, keyof ThemeTokens>> = {
    accentForeground: 'accent',
    cardForeground: 'card',
    destructiveForeground: 'destructive',
    headerForeground: 'header',
    mediaForeground: 'mediaBackground',
    mutedForeground: 'muted',
    popoverForeground: 'popover',
    primaryForeground: 'primary',
    secondaryForeground: 'secondary',
    sidebarAccentForeground: 'sidebarAccent',
    sidebarForeground: 'sidebar',
    sidebarPrimaryForeground: 'sidebarPrimary',
    successForeground: 'success',
    warningForeground: 'warning',
  }
  const backgroundToken = foregroundBackgrounds[tokenName]

  return backgroundToken ? tokens[backgroundToken] : tokens.background
}

function serializeSettings(settings: AppearanceSettings) {
  return JSON.stringify(settings)
}

function PreviewStatusBadge({ children, tone }: { children: ReactNode; tone: PreviewStatusTone }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-1 text-[0.66rem] font-semibold',
        tone === 'success' && 'bg-success text-success-foreground',
        tone === 'warning' && 'bg-warning text-warning-foreground',
        tone === 'destructive' && 'bg-destructive text-destructive-foreground',
        tone === 'muted' && 'bg-muted text-muted-foreground',
      )}
    >
      {children}
    </span>
  )
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
