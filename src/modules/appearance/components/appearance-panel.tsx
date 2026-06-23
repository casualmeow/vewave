import {
  Check,
  Code2,
  ExternalLink,
  Eye,
  HardDrive,
  Monitor,
  Moon,
  Palette,
  RotateCcw,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Sun,
} from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

import {
  appearanceModes,
  getAppearanceSettingsFromAppConfig,
  glassIntensities,
  defaultAppearanceSettings,
  logoStrategies,
  resolvedAppearanceModes,
  resolveThemeTokens,
  sanitizeAppearanceSettings,
  themePresets,
  useAppearance,
  withAppearanceSettingsInAppConfig,
  type AppearanceMode,
  type AppearancePresetId,
  type AppearanceSettings,
  type EditableThemeTokenName,
  type GlassIntensity,
  type LogoStrategy,
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
  getGetApiProfileMeQueryKey,
  usePatchApiProfileMe,
  type PatchApiProfileMeMutationBody,
} from '@/core/api/generated/profile/profile'
import { getApiErrorMessage } from '@/core/api/http/errors'
import { useAuthStore } from '@/modules/auth'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SpinIcon,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/ui'
import { cn } from '@/shared/lib/utils'

type TokenDefinition = {
  description: string
  label: string
  token: EditableThemeTokenName
}

type TokenSection = {
  description: string
  id: string
  title: string
  tokens: Array<TokenDefinition>
}

const modeLabels = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
} satisfies Record<AppearanceMode, string>

const modeDescriptions = {
  light: 'Always render the light color scheme.',
  dark: 'Always render the dark color scheme.',
  system: 'Follow the operating system preference.',
} satisfies Record<AppearanceMode, string>

const logoStrategyLabels = {
  auto: 'Auto',
  light: 'Light mark',
  dark: 'Dark mark',
  mono: 'Mono mark',
} satisfies Record<LogoStrategy, string>

const glassIntensityLabels = {
  subtle: 'Subtle',
  balanced: 'Balanced',
  strong: 'Strong',
} satisfies Record<GlassIntensity, string>

const tokenSections = [
  {
    id: 'foundation',
    title: 'Foundation',
    description: 'Canvas, surfaces, default text, borders, inputs, and focus treatment.',
    tokens: [
      token('background', 'Canvas', 'Page and dashboard background'),
      token('foreground', 'Primary text', 'Default readable text'),
      token('card', 'Card surface', 'Cards, panels, dialogs, and sheets'),
      token('cardForeground', 'Card text', 'Text on card surfaces'),
      token('popover', 'Popover', 'Floating menus and overlays'),
      token('popoverForeground', 'Popover text', 'Text inside overlays'),
      token('surfaceElevated', 'Elevated surface', 'Raised or hovered areas'),
      token('border', 'Border', 'Default separators and outlines'),
      token('input', 'Input border', 'Fields and compact controls'),
      token('ring', 'Focus ring', 'Keyboard focus and active outlines'),
    ],
  },
  {
    id: 'brand',
    title: 'Brand and Actions',
    description: 'Primary action, secondary action, muted UI, and selected/active accent roles.',
    tokens: [
      token('primary', 'Primary', 'Main action background'),
      token('primaryForeground', 'Primary text', 'Text on primary action'),
      token('secondary', 'Secondary', 'Secondary button surface'),
      token('secondaryForeground', 'Secondary text', 'Text on secondary surface'),
      token('muted', 'Muted surface', 'Quiet fills and disabled regions'),
      token('mutedForeground', 'Muted text', 'Secondary labels and helper text'),
      token('accent', 'Accent', 'Selected states and soft emphasis'),
      token('accentForeground', 'Accent text', 'Text on accent surface'),
    ],
  },
  {
    id: 'states',
    title: 'States',
    description: 'System feedback colors and media chrome roles.',
    tokens: [
      token('destructive', 'Destructive', 'Dangerous action background'),
      token('destructiveForeground', 'Destructive text', 'Text on danger background'),
      token('success', 'Success', 'Success state background'),
      token('successForeground', 'Success text', 'Text on success background'),
      token('warning', 'Warning', 'Warning state background'),
      token('warningForeground', 'Warning text', 'Text on warning background'),
      token('mediaBackground', 'Media background', 'Player and preview canvas'),
      token('mediaForeground', 'Media text', 'Player icons and controls'),
    ],
  },
  {
    id: 'shell',
    title: 'Shell',
    description: 'Dashboard sidebar, header, tabs, and Vewave mark colors.',
    tokens: [
      token('sidebar', 'Sidebar', 'Sidebar surface'),
      token('sidebarForeground', 'Sidebar text', 'Text inside sidebar'),
      token('sidebarPrimary', 'Sidebar primary', 'Sidebar badges and emphasis'),
      token('sidebarPrimaryForeground', 'Sidebar primary text', 'Text on sidebar primary'),
      token('sidebarAccent', 'Sidebar accent', 'Active sidebar item'),
      token('sidebarAccentForeground', 'Sidebar accent text', 'Text on active sidebar item'),
      token('sidebarBorder', 'Sidebar border', 'Sidebar separators'),
      token('sidebarRing', 'Sidebar focus', 'Sidebar focus ring'),
      token('header', 'Header', 'Header surface'),
      token('headerForeground', 'Header text', 'Header navigation text'),
      token('headerBorder', 'Header border', 'Header separators'),
      token('tabsTrack', 'Tabs track', 'Tabs list surface'),
      token('tabsActive', 'Active tab', 'Selected tab surface'),
      token('logoDark', 'Logo base', 'Base fill for the W mark'),
      token('logoAccent', 'Logo accent', 'Secondary blue fill inside the W mark'),
      token('logoLight', 'Logo light', 'Light fill variant for dark surfaces'),
    ],
  },
  {
    id: 'charts',
    title: 'Charts',
    description: 'Data visualization series colors.',
    tokens: [
      token('chart1', 'Chart 1', 'Primary data series'),
      token('chart2', 'Chart 2', 'Secondary data series'),
      token('chart3', 'Chart 3', 'Tertiary data series'),
      token('chart4', 'Chart 4', 'Fourth data series'),
      token('chart5', 'Chart 5', 'Fifth data series'),
    ],
  },
] satisfies Array<TokenSection>

export function AppearancePanel() {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const accessToken = useAuthStore((state) => state.accessToken)
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated)
  const updateProfileMutation = usePatchApiProfileMe()
  const { resolvedMode, setAppearanceSettings, settings } = useAppearance()
  const [draft, setDraft] = useState<AppearanceSettings>(settings)
  const [savedSnapshot, setSavedSnapshot] = useState<AppearanceSettings>(settings)
  const [editorMode, setEditorMode] = useState<ResolvedAppearanceMode>(resolvedMode)
  const dirtyRef = useRef(false)
  const settingsSignature = useMemo(() => serializeSettings(settings), [settings])
  const draftSignature = useMemo(() => serializeSettings(draft), [draft])
  const savedSignature = useMemo(() => serializeSettings(savedSnapshot), [savedSnapshot])
  const hasUnsavedChanges = draftSignature !== savedSignature
  const draftTokens = useMemo(() => resolveThemeTokens(draft, editorMode), [draft, editorMode])
  const savedAccountAppearance = getAppearanceSettingsFromAppConfig(user?.appConfig)
  const saveTarget = user ? 'account' : 'this device'
  const configPreview = useMemo(
    () =>
      JSON.stringify(
        {
          appConfig: withAppearanceSettingsInAppConfig(user?.appConfig, draft),
        },
        null,
        2,
      ),
    [draft, user?.appConfig],
  )

  useEffect(() => {
    dirtyRef.current = hasUnsavedChanges
  }, [hasUnsavedChanges])

  useEffect(() => {
    if (!dirtyRef.current) {
      setDraft(settings)
      setSavedSnapshot(settings)
      setEditorMode(resolvedMode)
    }
  }, [resolvedMode, settings, settingsSignature])

  function updateDraft(updater: (current: AppearanceSettings) => AppearanceSettings) {
    const nextDraft = sanitizeAppearanceSettings(updater(draft))
    setDraft(nextDraft)
    setAppearanceSettings(nextDraft)
  }

  function updateDraftToken(
    targetMode: ResolvedAppearanceMode,
    tokenName: EditableThemeTokenName,
    value: string,
  ) {
    const normalized = normalizeHexColor(value)

    if (!normalized) {
      return
    }

    updateDraft((current) => ({
      ...current,
      customTheme: {
        enabled: true,
        overrides: {
          ...current.customTheme.overrides,
          [targetMode]: {
            ...(current.customTheme.overrides[targetMode] ?? {}),
            [tokenName]: normalized,
          },
        },
      },
    }))
  }

  function resetDraftToken(targetMode: ResolvedAppearanceMode, tokenName: EditableThemeTokenName) {
    updateDraft((current) => {
      const nextModeOverrides = { ...(current.customTheme.overrides[targetMode] ?? {}) }
      delete nextModeOverrides[tokenName]

      return {
        ...current,
        customTheme: {
          ...current.customTheme,
          overrides: {
            ...current.customTheme.overrides,
            [targetMode]: nextModeOverrides,
          },
        },
      }
    })
  }

  function resetDraftMode(targetMode: ResolvedAppearanceMode) {
    updateDraft((current) => ({
      ...current,
      customTheme: {
        ...current.customTheme,
        overrides: {
          ...current.customTheme.overrides,
          [targetMode]: {},
        },
      },
    }))
  }

  function clearCustomTheme() {
    updateDraft((current) => ({
      ...current,
      customTheme: {
        enabled: false,
        overrides: {
          light: {},
          dark: {},
        },
      },
    }))
  }

  async function saveAppearance() {
    const sanitizedDraft = sanitizeAppearanceSettings(draft)

    try {
      if (user && accessToken) {
        const nextAppConfig = withAppearanceSettingsInAppConfig(user.appConfig, sanitizedDraft)
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
      }

      setAppearanceSettings(sanitizedDraft)
      setDraft(sanitizedDraft)
      setSavedSnapshot(sanitizedDraft)
      toast.success(`Appearance saved to ${saveTarget}.`)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to save appearance settings.'))
    }
  }

  function applySavedAccountAppearance() {
    if (!savedAccountAppearance) {
      return
    }

    setDraft(savedAccountAppearance)
    setSavedSnapshot(savedAccountAppearance)
    setAppearanceSettings(savedAccountAppearance)
  }

  function revertDraft() {
    setDraft(savedSnapshot)
    setAppearanceSettings(savedSnapshot)
    setEditorMode(resolvedMode)
  }

  return (
    <div className="grid gap-5">
      <section className="grid gap-4">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <Card className="overflow-hidden">
            <CardHeader className="gap-4 lg:flex-row lg:items-start lg:justify-between lg:space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Palette className="size-4 text-primary" />
                  Theme Studio
                </CardTitle>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                  Configure the Vewave color scheme. Draft changes apply to the live app
                  immediately; saving writes them to {saveTarget}.
                </p>
              </div>
              <SaveStatus
                dirty={hasUnsavedChanges}
                saving={updateProfileMutation.isPending}
                target={saveTarget}
              />
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
                <StudioSelect
                  description={modeDescriptions[draft.mode]}
                  icon={
                    draft.mode === 'dark' ? (
                      <Moon />
                    ) : draft.mode === 'light' ? (
                      <Sun />
                    ) : (
                      <Monitor />
                    )
                  }
                  label="Mode"
                >
                  <Select
                    value={draft.mode}
                    onValueChange={(value) =>
                      updateDraft((current) => ({ ...current, mode: value as AppearanceMode }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {appearanceModes.map((option) => (
                        <SelectItem key={option} value={option}>
                          {modeLabels[option]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </StudioSelect>

                <StudioSelect
                  description="Choose the reference palette before editing overrides."
                  icon={<Palette />}
                  label="Preset"
                >
                  <Select
                    value={draft.preset}
                    onValueChange={(value) =>
                      updateDraft((current) => ({
                        ...current,
                        preset: value as AppearancePresetId,
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {themePresets.map((preset) => (
                        <SelectItem key={preset.id} value={preset.id}>
                          {preset.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </StudioSelect>

                <StudioSelect
                  description="Controls mark variant selection against surfaces."
                  icon={<ShieldCheck />}
                  label="Logo"
                >
                  <Select
                    value={draft.logoStrategy}
                    onValueChange={(value) =>
                      updateDraft((current) => ({
                        ...current,
                        logoStrategy: value as LogoStrategy,
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {logoStrategies.map((option) => (
                        <SelectItem key={option} value={option}>
                          {logoStrategyLabels[option]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </StudioSelect>

                <StudioSelect
                  description="Material strength without changing semantic colors."
                  icon={<Sparkles />}
                  label="Glass"
                >
                  <Select
                    value={draft.glassIntensity}
                    onValueChange={(value) =>
                      updateDraft((current) => ({
                        ...current,
                        glassIntensity: value as GlassIntensity,
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {glassIntensities.map((option) => (
                        <SelectItem key={option} value={option}>
                          {glassIntensityLabels[option]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </StudioSelect>
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                {themePresets.map((preset) => (
                  <PresetCard
                    key={preset.id}
                    preset={preset}
                    selected={draft.preset === preset.id}
                    onSelect={() => updateDraft((current) => ({ ...current, preset: preset.id }))}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <PreviewNavigationCard
            editorMode={editorMode}
            hasUnsavedChanges={hasUnsavedChanges}
            saveTarget={saveTarget}
            tokens={draftTokens}
          />
        </div>

        <Card>
          <CardHeader className="gap-4 lg:flex-row lg:items-start lg:justify-between lg:space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <SlidersHorizontal className="size-4 text-primary" />
                Color Scheme
              </CardTitle>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                Edit semantic roles by mode. These tokens are what shared UI, dashboard shell, docs,
                and previews consume.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
                <Checkbox
                  id="custom-theme-enabled"
                  checked={draft.customTheme.enabled}
                  onCheckedChange={(checked) =>
                    updateDraft((current) => ({
                      ...current,
                      customTheme: {
                        ...current.customTheme,
                        enabled: checked === true,
                      },
                    }))
                  }
                />
                <Label htmlFor="custom-theme-enabled" className="text-sm">
                  Custom palette
                </Label>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={clearCustomTheme}>
                <RotateCcw className="size-4" />
                Clear custom
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs
              value={editorMode}
              onValueChange={(value) => setEditorMode(value as ResolvedAppearanceMode)}
              className="gap-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <TabsList className="grid w-full grid-cols-2 sm:w-fit">
                  {resolvedAppearanceModes.map((targetMode) => (
                    <TabsTrigger key={targetMode} value={targetMode}>
                      {targetMode === 'dark' ? (
                        <Moon className="size-4" />
                      ) : (
                        <Sun className="size-4" />
                      )}
                      {targetMode}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => resetDraftMode(editorMode)}
                >
                  <RotateCcw className="size-4" />
                  Reset {editorMode}
                </Button>
              </div>

              {resolvedAppearanceModes.map((targetMode) => (
                <TabsContent key={targetMode} value={targetMode} className="space-y-4">
                  {tokenSections.map((section) => (
                    <TokenSectionCard
                      key={section.id}
                      customEnabled={draft.customTheme.enabled}
                      mode={targetMode}
                      section={section}
                      settings={draft}
                      tokens={
                        targetMode === editorMode
                          ? draftTokens
                          : resolveThemeTokens(draft, targetMode)
                      }
                      onChange={updateDraftToken}
                      onReset={resetDraftToken}
                    />
                  ))}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Code2 className="size-4 text-primary" />
              Account Config JSON
            </CardTitle>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              This is the exact account config shape saved into <code>user.appConfig</code>.
            </p>
          </CardHeader>
          <CardContent>
            <pre className="max-h-72 overflow-auto rounded-lg border bg-muted/40 p-4 text-xs leading-5 text-foreground">
              {configPreview}
            </pre>
          </CardContent>
        </Card>
      </section>

      <div className="sticky bottom-0 z-10 -mx-1 border-t bg-background/92 px-1 py-3 backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            {hasUnsavedChanges
              ? `Live draft has not been saved to ${saveTarget}.`
              : `Current appearance is saved on ${saveTarget}.`}
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            {savedAccountAppearance ? (
              <Button type="button" variant="outline" onClick={applySavedAccountAppearance}>
                <HardDrive className="size-4" />
                Load account
              </Button>
            ) : null}
            <Button type="button" variant="outline" onClick={revertDraft}>
              <RotateCcw className="size-4" />
              Revert
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                updateDraft(() => defaultAppearanceSettings)
                setEditorMode(resolvedMode)
              }}
            >
              <RotateCcw className="size-4" />
              Default draft
            </Button>
            <Button
              type="button"
              onClick={saveAppearance}
              disabled={!hasUnsavedChanges || updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? (
                <SpinIcon size="sm" label="Saving appearance" />
              ) : (
                <Save className="size-4" />
              )}
              Save appearance
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function PreviewNavigationCard({
  editorMode,
  hasUnsavedChanges,
  saveTarget,
  tokens,
}: {
  editorMode: ResolvedAppearanceMode
  hasUnsavedChanges: boolean
  saveTarget: string
  tokens: ThemeTokens
}) {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Eye className="size-4 text-primary" />
          Preview Workbench
        </CardTitle>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Review the current draft on a realistic workspace surface without mixing sample data into
          your actual profile.
        </p>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Button asChild>
          <Link to="/appearance/preview">
            <ExternalLink className="size-4" />
            Open preview
          </Link>
        </Button>
        <div className="grid gap-2 text-sm">
          <ContrastRow
            label={`${editorMode} primary`}
            passes={meetsNormalTextContrast(tokens.primaryForeground, tokens.primary)}
            ratio={getContrastRatio(tokens.primaryForeground, tokens.primary)}
          />
          <ContrastRow
            label={`${editorMode} accent`}
            passes={meetsNormalTextContrast(tokens.accentForeground, tokens.accent)}
            ratio={getContrastRatio(tokens.accentForeground, tokens.accent)}
          />
          <ContrastRow
            label={`${editorMode} card`}
            passes={meetsNormalTextContrast(tokens.cardForeground, tokens.card)}
            ratio={getContrastRatio(tokens.cardForeground, tokens.card)}
          />
        </div>
        <div className="rounded-lg border bg-muted/35 p-3 text-xs leading-5 text-muted-foreground">
          {hasUnsavedChanges
            ? `Draft changes are live on this device and still need saving to ${saveTarget}.`
            : `Saved appearance is active on ${saveTarget}.`}
        </div>
      </CardContent>
    </Card>
  )
}

function StudioSelect({
  children,
  description,
  icon,
  label,
}: {
  children: ReactNode
  description: string
  icon: ReactNode
  label: string
}) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
        <span className="text-primary [&_svg]:size-4">{icon}</span>
        {label}
      </div>
      {children}
      <p className="mt-2 text-xs leading-4 text-muted-foreground">{description}</p>
    </div>
  )
}

function SaveStatus({
  dirty,
  saving,
  target,
}: {
  dirty: boolean
  saving: boolean
  target: string
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm',
        dirty ? 'bg-warning/15 text-foreground' : 'bg-success/10 text-success',
      )}
    >
      {saving ? <SpinIcon size="sm" label="Saving appearance" /> : <Check className="size-4" />}
      {dirty ? `Unsaved changes for ${target}` : `Saved on ${target}`}
    </div>
  )
}

function PresetCard({
  onSelect,
  preset,
  selected,
}: {
  onSelect: () => void
  preset: (typeof themePresets)[number]
  selected: boolean
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'rounded-lg border bg-card p-4 text-left shadow-sm transition-[border-color,box-shadow,transform]',
        'hover:-translate-y-0.5 hover:border-primary/55 hover:shadow-md',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        selected &&
          'border-primary shadow-[0_16px_40px_color-mix(in_srgb,var(--primary)_14%,transparent)]',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-foreground">{preset.label}</div>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">{preset.description}</p>
        </div>
        {selected ? <Check className="size-4 shrink-0 text-primary" /> : null}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <PresetSwatches mode="light" tokens={preset.light} />
        <PresetSwatches mode="dark" tokens={preset.dark} />
      </div>
    </button>
  )
}

function PresetSwatches({ mode, tokens }: { mode: ResolvedAppearanceMode; tokens: ThemeTokens }) {
  const swatches = [tokens.background, tokens.card, tokens.primary, tokens.accent] as const

  return (
    <div className="rounded-md border bg-background p-2">
      <div className="mb-2 text-[0.64rem] font-semibold uppercase text-muted-foreground">
        {mode}
      </div>
      <div className="flex gap-1.5">
        {swatches.map((value) => (
          <span
            key={`${mode}-${value}`}
            className="size-5 rounded-full border border-border"
            style={{ backgroundColor: value }}
          />
        ))}
      </div>
    </div>
  )
}

function TokenSectionCard({
  customEnabled,
  mode,
  onChange,
  onReset,
  section,
  settings,
  tokens,
}: {
  customEnabled: boolean
  mode: ResolvedAppearanceMode
  onChange: (mode: ResolvedAppearanceMode, token: EditableThemeTokenName, value: string) => void
  onReset: (mode: ResolvedAppearanceMode, token: EditableThemeTokenName) => void
  section: TokenSection
  settings: AppearanceSettings
  tokens: ThemeTokens
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-4">
        <div className="font-semibold text-foreground">{section.title}</div>
        <p className="mt-1 text-sm leading-5 text-muted-foreground">{section.description}</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
        {section.tokens.map((definition) => (
          <ColorControl
            key={definition.token}
            customEnabled={customEnabled}
            definition={definition}
            mode={mode}
            settings={settings}
            tokens={tokens}
            onChange={onChange}
            onReset={onReset}
          />
        ))}
      </div>
    </div>
  )
}

function ColorControl({
  customEnabled,
  definition,
  mode,
  onChange,
  onReset,
  settings,
  tokens,
}: {
  customEnabled: boolean
  definition: TokenDefinition
  mode: ResolvedAppearanceMode
  onChange: (mode: ResolvedAppearanceMode, token: EditableThemeTokenName, value: string) => void
  onReset: (mode: ResolvedAppearanceMode, token: EditableThemeTokenName) => void
  settings: AppearanceSettings
  tokens: ThemeTokens
}) {
  const customValue = settings.customTheme.overrides[mode]?.[definition.token]
  const value = normalizeHexColor(customValue ?? tokens[definition.token]) ?? '#000000'
  const [inputValue, setInputValue] = useState(value)
  const customized = Boolean(customValue)
  const presetValue = getPresetTokenValue(settings.preset, mode, definition.token)
  const ratio =
    definition.token.endsWith('Foreground') && definition.token !== 'foreground'
      ? getContrastRatio(value, getLikelyBackground(definition.token, tokens))
      : null

  useEffect(() => {
    setInputValue(value)
  }, [value])

  function updateColorValue(nextValue: string) {
    setInputValue(nextValue)

    const normalized = normalizeHexColor(nextValue)

    if (normalized) {
      onChange(mode, definition.token, normalized)
    }
  }

  return (
    <div
      className={cn(
        'grid gap-3 rounded-lg border bg-background p-3',
        customized && 'border-primary/60 shadow-[inset_3px_0_0_var(--primary)]',
        !customEnabled && 'opacity-70',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-foreground">{definition.label}</div>
          <div className="mt-0.5 line-clamp-2 text-xs leading-4 text-muted-foreground">
            {definition.description}
          </div>
        </div>
        <span
          className="size-8 shrink-0 rounded-md border border-border"
          style={{ backgroundColor: value }}
          aria-hidden
        />
      </div>
      <div className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-2">
        <input
          type="color"
          value={value}
          disabled={!customEnabled}
          onChange={(event) => updateColorValue(event.target.value)}
          className="size-10 rounded-md border border-border bg-transparent disabled:pointer-events-none"
          aria-label={`${definition.label} color`}
        />
        <div className="min-w-0">
          <Input
            value={inputValue}
            disabled={!customEnabled}
            onBlur={() => setInputValue(value)}
            onChange={(event) => updateColorValue(event.target.value)}
            className="h-8 font-mono text-xs"
            aria-label={`${definition.label} hex value`}
          />
          <div className="mt-1 truncate text-[0.68rem] text-muted-foreground">
            Preset {presetValue}
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={!customized}
          onClick={() => onReset(mode, definition.token)}
          aria-label={`Reset ${definition.label}`}
        >
          <RotateCcw className="size-4" />
        </Button>
      </div>
      {ratio ? (
        <div
          className={cn(
            'rounded-md px-2 py-1 text-xs font-medium',
            ratio >= 4.5
              ? 'bg-success/15 text-success'
              : ratio >= 3
                ? 'bg-warning/20 text-warning-foreground'
                : 'bg-destructive/15 text-destructive',
          )}
        >
          Contrast {ratio.toFixed(2)}:1
        </div>
      ) : null}
    </div>
  )
}

export function AppearanceColorStudioPage() {
  return (
    <div className="min-h-[calc(100vh-2rem)] overflow-auto p-6">
      <div className="mx-auto grid w-full max-w-7xl gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Palette className="size-4" />
              Appearance
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">Color studio</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Tune the active Vewave theme and save it into your account configuration.
            </p>
          </div>
          <Button asChild variant="outline" className="w-full md:w-auto">
            <Link to="/appearance/preview">
              <Eye className="size-4" />
              Open preview
            </Link>
          </Button>
        </div>

        <AppearancePanel />
      </div>
    </div>
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

function token(
  tokenName: EditableThemeTokenName,
  label: string,
  description: string,
): TokenDefinition {
  return { token: tokenName, label, description }
}

function serializeSettings(settings: AppearanceSettings) {
  return JSON.stringify(settings)
}

function getPresetTokenValue(
  presetId: AppearancePresetId,
  mode: ResolvedAppearanceMode,
  tokenName: EditableThemeTokenName,
) {
  const preset = themePresets.find((item) => item.id === presetId) ?? themePresets[0]
  return preset[mode][tokenName]
}

function getLikelyBackground(tokenName: EditableThemeTokenName, tokens: ThemeTokens) {
  const foregroundBackgrounds: Partial<Record<EditableThemeTokenName, keyof ThemeTokens>> = {
    accentForeground: 'accent',
    cardForeground: 'card',
    destructiveForeground: 'destructive',
    headerForeground: 'header',
    logoDarkForeground: 'logoDark',
    logoLightForeground: 'logoLight',
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
