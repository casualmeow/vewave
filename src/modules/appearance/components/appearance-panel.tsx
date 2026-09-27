import { ArrowUpRight, Check, ChevronDown, MoreHorizontal, RotateCcw } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

import { BackgroundSettingsControls } from './background-settings-controls'
import { WhiteGlassLook } from './white-glass-look'
import {
  appearanceModes,
  getAppearanceSettingsFromAppConfig,
  getThemeTokenStyle,
  glassIntensities,
  glassMotions,
  surfaceStyles,
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
  type GlassMotion,
  type LogoStrategy,
  type ResolvedAppearanceMode,
  type ThemeTokens,
} from '@/shared/theme'
import { getContrastRatio, normalizeHexColor } from '@/shared/theme/validators'
import {
  getGetApiProfileMeQueryKey,
  usePatchApiProfileMe,
  type PatchApiProfileMeMutationBody,
} from '@/core/api/generated/profile/profile'
import { getApiErrorMessage } from '@/core/api/http/errors'
import { useAuthStore } from '@/modules/auth'
import {
  Button,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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

const glassMotionLabels = {
  off: 'Off',
  subtle: 'Subtle',
  fluid: 'Fluid',
} satisfies Record<GlassMotion, string>

const tokenSections = [
  {
    id: 'foundation',
    title: 'Basics',
    description: 'Page, surface, text, and field colors.',
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
    title: 'Actions',
    description: 'Buttons, selections, and secondary text.',
    tokens: [
      token('primary', 'Primary', 'Main action background'),
      token('primaryForeground', 'Button text', 'Text on primary action'),
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
    title: 'Status',
    description: 'Success, warning, error, and player colors.',
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
    title: 'App chrome',
    description: 'Navigation, header, tabs, and the Vewave mark.',
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
      token('logoAccent', 'Logo accent', 'Secondary brand fill inside the W mark'),
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
  const { accountId } = useAppearance()
  return <ColorStudio key={accountId ?? 'device'} />
}

function ColorStudio() {
  const id = useId()
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const accessToken = useAuthStore((state) => state.accessToken)
  const updateProfileMutation = usePatchApiProfileMe()
  const { resolvedMode, setAppearanceSettings, settings: draft } = useAppearance()
  const [savedSnapshot, setSavedSnapshot] = useState<AppearanceSettings>(
    () =>
      getAppearanceSettingsFromAppConfig(user?.appConfig) ??
      (user ? defaultAppearanceSettings : draft),
  )
  const [editorMode, setEditorMode] = useState<ResolvedAppearanceMode>(resolvedMode)
  const [backgroundOpen, setBackgroundOpen] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [colorRevision, setColorRevision] = useState(0)
  const mounted = useRef(true)
  const saving = useRef(false)
  const hasUnsavedChanges = JSON.stringify(draft) !== JSON.stringify(savedSnapshot)
  const draftTokens = useMemo(() => resolveThemeTokens(draft, editorMode), [draft, editorMode])
  const saveTarget = user ? 'your account' : 'this device'
  const customCount = Object.keys(draft.customTheme.overrides[editorMode] ?? {}).length

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  useEffect(() => {
    const saved = getAppearanceSettingsFromAppConfig(user?.appConfig)
    if (saved) setSavedSnapshot(saved)
  }, [user?.appConfig])

  function updateDraft(updater: (current: AppearanceSettings) => AppearanceSettings) {
    setAppearanceSettings(sanitizeAppearanceSettings(updater(draft)))
  }

  function updateDraftToken(
    targetMode: ResolvedAppearanceMode,
    tokenName: EditableThemeTokenName,
    value: string,
  ) {
    const normalized = normalizeHexColor(value)
    if (!normalized) return

    updateDraft((current) => ({
      ...current,
      customTheme: {
        enabled: true,
        overrides: {
          ...current.customTheme.overrides,
          [targetMode]: {
            ...current.customTheme.overrides[targetMode],
            [tokenName]: normalized,
          },
        },
      },
    }))
  }

  function resetDraftToken(targetMode: ResolvedAppearanceMode, tokenName: EditableThemeTokenName) {
    updateDraft((current) => {
      const nextModeOverrides = { ...current.customTheme.overrides[targetMode] }
      delete nextModeOverrides[tokenName]
      return {
        ...current,
        customTheme: {
          ...current.customTheme,
          overrides: { ...current.customTheme.overrides, [targetMode]: nextModeOverrides },
        },
      }
    })
  }

  function resetDraftMode() {
    setColorRevision((revision) => revision + 1)
    updateDraft((current) => ({
      ...current,
      customTheme: {
        ...current.customTheme,
        overrides: { ...current.customTheme.overrides, [editorMode]: {} },
      },
    }))
  }

  async function saveAppearance() {
    if (saving.current || !hasUnsavedChanges) return
    saving.current = true
    setSaveError(null)
    const submitted = sanitizeAppearanceSettings(draft)
    const owner = user?.id ?? null

    try {
      if (user && !accessToken) throw new Error('Sign in again to save your appearance.')
      if (user && accessToken) {
        const nextAppConfig = withAppearanceSettingsInAppConfig(user.appConfig, submitted)
        const payload = { appConfig: nextAppConfig } satisfies PatchApiProfileMeMutationBody
        const response = await updateProfileMutation.mutateAsync({ data: payload })
        const auth = useAuthStore.getState()
        if (auth.user?.id !== owner || !auth.accessToken) return

        auth.setAuthenticated(
          { ...auth.user, appConfig: response.profile.appConfig ?? nextAppConfig },
          auth.accessToken,
        )
        void queryClient.invalidateQueries({ queryKey: getGetApiProfileMeQueryKey() })
      }

      if (!mounted.current || (useAuthStore.getState().user?.id ?? null) !== owner) return

      setSavedSnapshot(submitted)
      toast.success(`Appearance saved to ${saveTarget}.`)
    } catch (error) {
      if (mounted.current && (useAuthStore.getState().user?.id ?? null) === owner) {
        setSaveError(getApiErrorMessage(error, 'Unable to save. Your changes are still here.'))
      }
    } finally {
      saving.current = false
    }
  }

  function revertDraft() {
    setAppearanceSettings(savedSnapshot)
    setSaveError(null)
    setColorRevision((revision) => revision + 1)
  }

  return (
    <form
      className="flex min-h-full w-full min-w-0 flex-col"
      onSubmit={(event) => {
        event.preventDefault()
        void saveAppearance()
      }}
    >
      <header className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-b border-border/50 px-5 py-5 sm:px-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Color studio</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Changes appear live. Save to keep them on {saveTarget}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SaveStatus
            dirty={hasUnsavedChanges}
            saving={updateProfileMutation.isPending}
            error={saveError}
          />
          <Button
            type="button"
            variant="ghost"
            disabled={!hasUnsavedChanges || updateProfileMutation.isPending}
            onClick={revertDraft}
          >
            Revert
          </Button>
          <Button type="submit" disabled={!hasUnsavedChanges || updateProfileMutation.isPending}>
            {updateProfileMutation.isPending
              ? 'Saving…'
              : saveError
                ? 'Retry save'
                : 'Save changes'}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label="More appearance actions"
              >
                <MoreHorizontal aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled={!customCount} onSelect={resetDraftMode}>
                Reset {editorMode} colors
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={
                  !Object.keys(draft.customTheme.overrides.light ?? {}).length &&
                  !Object.keys(draft.customTheme.overrides.dark ?? {}).length
                }
                onSelect={() => {
                  setColorRevision((revision) => revision + 1)
                  updateDraft((current) => ({
                    ...current,
                    customTheme: { enabled: false, overrides: { light: {}, dark: {} } },
                  }))
                }}
              >
                Clear all custom colors
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => {
                  setColorRevision((revision) => revision + 1)
                  updateDraft(() => defaultAppearanceSettings)
                }}
              >
                Restore default appearance
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex-1 space-y-8 px-5 py-6 sm:px-8">
        <WhiteGlassLook
          settings={draft}
          onApply={(next) => {
            setColorRevision((revision) => revision + 1)
            setEditorMode('light')
            setAppearanceSettings(next)
          }}
        />
        <section aria-labelledby={`${id}-presets`} className="space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id={`${id}-presets`} className="text-sm font-medium">
              Theme
            </h2>
            <span className="text-xs text-muted-foreground">
              Each theme includes light and dark colors
            </span>
          </div>
          <div
            role="group"
            aria-label="Theme preset"
            className="grid grid-cols-2 gap-1 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7"
          >
            {themePresets.map((preset) => (
              <PresetOption
                key={preset.id}
                preset={preset}
                mode={resolvedMode}
                selected={draft.preset === preset.id}
                onSelect={() => updateDraft((current) => ({ ...current, preset: preset.id }))}
              />
            ))}
          </div>
        </section>

        <section aria-label="Display settings" className="space-y-5">
          <div
            className={cn(
              'grid gap-x-6 gap-y-5 sm:grid-cols-2',
              draft.surfaceStyle === 'glass' ? 'xl:grid-cols-5' : 'xl:grid-cols-3',
            )}
          >
            <StudioSelect
              label="Interface mode"
              value={draft.mode}
              options={appearanceModes.map((value) => ({ value, label: modeLabels[value] }))}
              onChange={(mode) => updateDraft((current) => ({ ...current, mode }))}
            />
            <StudioSelect
              label="Surface style"
              value={draft.surfaceStyle}
              options={surfaceStyles.map((value) => ({
                value,
                label: value === 'glass' ? 'Glass' : 'Solid',
              }))}
              onChange={(surfaceStyle) => updateDraft((current) => ({ ...current, surfaceStyle }))}
            />
            {draft.surfaceStyle === 'glass' && (
              <>
                <StudioSelect
                  label="Glass intensity"
                  value={draft.glassIntensity}
                  options={glassIntensities.map((value) => ({
                    value,
                    label: glassIntensityLabels[value],
                  }))}
                  onChange={(glassIntensity) =>
                    updateDraft((current) => ({ ...current, glassIntensity }))
                  }
                />
                <StudioSelect
                  label="Glass motion"
                  value={draft.glassMotion}
                  description="Respects reduced motion."
                  options={glassMotions.map((value) => ({
                    value,
                    label: glassMotionLabels[value],
                  }))}
                  onChange={(glassMotion) =>
                    updateDraft((current) => ({ ...current, glassMotion }))
                  }
                />
              </>
            )}
            <StudioSelect
              label="Logo variant"
              value={draft.logoStrategy}
              options={logoStrategies.map((value) => ({ value, label: logoStrategyLabels[value] }))}
              onChange={(logoStrategy) => updateDraft((current) => ({ ...current, logoStrategy }))}
            />
          </div>
          <div>
            <button
              type="button"
              aria-expanded={backgroundOpen}
              aria-controls={`${id}-background`}
              onClick={() => setBackgroundOpen((open) => !open)}
              className="flex min-h-10 w-full items-center justify-between gap-4 rounded-sm text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="font-medium">Background</span>
              <span className="flex items-center gap-3 text-muted-foreground">
                <span>
                  {draft.surfaceStyle === 'solid'
                    ? 'Visible with Glass'
                    : backgroundLabels[draft.background.preset]}
                </span>
                <ChevronDown
                  aria-hidden="true"
                  className={cn('size-4', backgroundOpen && 'rotate-180')}
                />
              </span>
            </button>
            <div id={`${id}-background`}>
              {backgroundOpen && (
                <div className="pb-3 pt-4">
                  {draft.surfaceStyle === 'solid' && (
                    <p className="mb-4 text-sm text-muted-foreground">
                      Choose Glass surface style to see this background in your workspace.
                    </p>
                  )}
                  <BackgroundSettingsControls
                    value={draft.background}
                    onChange={(background) =>
                      updateDraft((current) => ({
                        ...current,
                        background: { ...current.background, ...background },
                      }))
                    }
                    tokens={resolveThemeTokens(draft, resolvedMode)}
                    mode={resolvedMode}
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        <section aria-labelledby={`${id}-colors`} className="border-t border-border/50 pt-6">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 id={`${id}-colors`} className="text-base font-semibold">
                Custom colors
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {draft.customTheme.enabled
                  ? 'Your edits are applied over the selected theme.'
                  : 'Edit any color to customize this theme.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-5">
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`${id}-custom`}
                  checked={draft.customTheme.enabled}
                  onCheckedChange={(checked) =>
                    updateDraft((current) => ({
                      ...current,
                      customTheme: { ...current.customTheme, enabled: checked === true },
                    }))
                  }
                />
                <Label htmlFor={`${id}-custom`}>Use custom colors</Label>
              </div>
              <StudioSelect
                label="Editing"
                inline
                value={editorMode}
                options={resolvedAppearanceModes.map((value) => ({
                  value,
                  label: modeLabels[value],
                }))}
                onChange={setEditorMode}
              />
            </div>
          </div>
          <div className="grid min-w-0 items-start gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(17rem,0.4fr)]">
            <Tabs defaultValue="foundation" className="min-w-0 gap-5">
              <div className="min-w-0 overflow-x-auto p-1 -m-1">
                <TabsList
                  aria-label="Color groups"
                  className="h-auto justify-start gap-5 rounded-none bg-transparent p-0"
                >
                  {tokenSections.map((section) => (
                    <TabsTrigger
                      key={section.id}
                      value={section.id}
                      className="h-10 flex-none rounded-none border-0 border-b-2 border-transparent px-0 pb-2 pt-1 text-muted-foreground shadow-none transition-none data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none dark:data-[state=active]:border-foreground dark:data-[state=active]:bg-transparent"
                    >
                      {section.title}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              {tokenSections.map((section) => (
                <TabsContent key={section.id} value={section.id} className="space-y-4">
                  <p className="text-xs text-muted-foreground">{section.description}</p>
                  <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 2xl:grid-cols-3">
                    {section.tokens.map((definition) => (
                      <ColorControl
                        key={`${editorMode}-${draft.preset}-${colorRevision}-${definition.token}`}
                        definition={definition}
                        mode={editorMode}
                        settings={draft}
                        tokens={draftTokens}
                        onChange={updateDraftToken}
                        onReset={resetDraftToken}
                      />
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
            <ColorPreview tokens={draftTokens} mode={editorMode} />
          </div>
        </section>
      </div>
    </form>
  )
}

const backgroundLabels = { none: 'None', ribbons: 'Ribbons', silk: 'Silk', contours: 'Contours' }

function StudioSelect<T extends string>({
  description,
  inline = false,
  label,
  onChange,
  options,
  value,
}: {
  description?: string
  inline?: boolean
  label: string
  onChange: (value: T) => void
  options: ReadonlyArray<{ value: T; label: string }>
  value: T
}) {
  const id = useId()
  return (
    <div className={cn('min-w-0', inline ? 'flex items-center gap-3' : 'space-y-2')}>
      <Label htmlFor={id} className="text-sm font-normal text-muted-foreground">
        {label}
      </Label>
      <Select value={value} onValueChange={(next) => onChange(next as T)}>
        <SelectTrigger
          id={id}
          aria-describedby={description ? `${id}-hint` : undefined}
          className={cn(
            'bg-transparent shadow-none dark:bg-transparent',
            inline ? 'w-28' : 'w-full',
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description && (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  )
}

function SaveStatus({
  dirty,
  saving,
  error,
}: {
  dirty: boolean
  saving: boolean
  error: string | null
}) {
  return (
    <span
      role={error ? 'alert' : 'status'}
      className="mr-2 flex max-w-xs items-center gap-2 text-xs text-muted-foreground"
    >
      {saving && <SpinIcon size="sm" label="Saving appearance" />}
      {error ?? (saving ? 'Saving…' : dirty ? 'Unsaved changes' : 'All changes saved')}
    </span>
  )
}

function PresetOption({
  onSelect,
  preset,
  mode,
  selected,
}: {
  onSelect: () => void
  preset: (typeof themePresets)[number]
  mode: ResolvedAppearanceMode
  selected: boolean
}) {
  const tokens = preset[mode]
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        'min-w-0 rounded-md p-3 text-left outline-none hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring',
        selected && 'bg-accent/60',
      )}
    >
      <span
        aria-hidden="true"
        className="mb-2.5 grid h-7 grid-cols-4 overflow-hidden rounded-sm ring-1 ring-inset ring-foreground/10"
      >
        {[tokens.background, tokens.card, tokens.primary, tokens.accent].map((color, index) => (
          <span key={index} style={{ backgroundColor: color }} />
        ))}
      </span>
      <span className="flex items-center justify-between gap-2 text-sm">
        <span>{preset.label}</span>
        <Check aria-hidden="true" className={cn('size-3.5 shrink-0', !selected && 'invisible')} />
      </span>
    </button>
  )
}

function ColorControl({
  definition,
  mode,
  onChange,
  onReset,
  settings,
  tokens,
}: {
  definition: TokenDefinition
  mode: ResolvedAppearanceMode
  onChange: (mode: ResolvedAppearanceMode, token: EditableThemeTokenName, value: string) => void
  onReset: (mode: ResolvedAppearanceMode, token: EditableThemeTokenName) => void
  settings: AppearanceSettings
  tokens: ThemeTokens
}) {
  const id = useId()
  const value = normalizeHexColor(tokens[definition.token]) ?? '#000000'
  const customized = Boolean(settings.customTheme.overrides[mode]?.[definition.token])
  const [inputValue, setInputValue] = useState(value)
  const [invalid, setInvalid] = useState(false)
  const editing = useRef(false)
  const presetValue = getPresetTokenValue(settings.preset, mode, definition.token)

  useEffect(() => {
    if (!editing.current) {
      setInputValue(value)
      setInvalid(false)
    }
  }, [value])

  function commitValue() {
    const normalized = normalizeHexColor(inputValue)
    setInvalid(!normalized)
    if (normalized) {
      setInputValue(normalized)
      if (normalized !== value) onChange(mode, definition.token, normalized)
    }
  }

  return (
    <div className="min-w-0 space-y-2 py-1">
      <div>
        <Label htmlFor={id} className="text-sm">
          {definition.label}
        </Label>
        <p id={`${id}-hint`} className="mt-1 text-xs leading-4 text-muted-foreground">
          {definition.description}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(event) => {
            setInputValue(event.target.value.toUpperCase())
            setInvalid(false)
            onChange(mode, definition.token, event.target.value)
          }}
          className="size-9 shrink-0 cursor-pointer overflow-hidden rounded-md border border-input bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-moz-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-0"
          aria-label={`${definition.label} color`}
        />
        <Input
          id={id}
          value={inputValue}
          required
          pattern="#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          onInvalid={() => setInvalid(true)}
          onBlur={() => {
            editing.current = false
            commitValue()
          }}
          onChange={(event) => {
            const nextValue = event.target.value
            editing.current = true
            setInputValue(nextValue)
            setInvalid(false)
            const normalized = normalizeHexColor(nextValue)
            if (normalized) onChange(mode, definition.token, normalized)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              commitValue()
            }
            if (event.key === 'Escape') {
              setInputValue(value)
              setInvalid(false)
            }
          }}
          className="h-9 min-w-0 max-w-32 bg-transparent font-mono text-xs shadow-none dark:bg-transparent"
          aria-label={`${definition.label} hex value`}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? `${id}-error` : `${id}-hint`}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={!customized}
          onClick={() => {
            onReset(mode, definition.token)
            setInputValue(presetValue)
            setInvalid(false)
          }}
          aria-label={`Reset ${definition.label}`}
          title={`Reset to ${presetValue}`}
          className={cn('shrink-0', !customized && 'invisible')}
        >
          <RotateCcw className="size-3.5" aria-hidden="true" />
        </Button>
      </div>
      {invalid && (
        <p id={`${id}-error`} role="alert" className="text-xs text-destructive">
          Enter a hex color, such as #AABBCC.
        </p>
      )}
    </div>
  )
}

function ColorPreview({ tokens, mode }: { tokens: ThemeTokens; mode: ResolvedAppearanceMode }) {
  return (
    <aside aria-label="Color preview" className="min-w-0 space-y-5">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-sm font-medium">{modeLabels[mode]} preview</h3>
        <Link
          to="/appearance/preview"
          className="inline-flex items-center gap-1 rounded-sm text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-ring"
        >
          Full preview <ArrowUpRight className="size-3" aria-hidden="true" />
        </Link>
      </div>
      <div
        style={getThemeTokenStyle(tokens)}
        className="space-y-6 rounded-lg bg-background p-6 text-foreground"
      >
        <div>
          <span aria-hidden="true" className="text-5xl font-medium tracking-tight">
            Aa
          </span>
          <p className="mt-3 text-sm font-medium">Primary text on your canvas</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Secondary text stays a little quieter.
          </p>
        </div>
        <div className="space-y-4 rounded-md bg-card p-4 text-card-foreground">
          <p className="text-sm">Text on a raised surface</p>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-md bg-primary px-3 py-2 text-primary-foreground">
              Primary action
            </span>
            <span className="rounded-md bg-accent px-3 py-2 text-accent-foreground">Selection</span>
          </div>
        </div>
      </div>
      <div>
        <h4 className="text-xs font-medium">Text contrast</h4>
        <p className="mt-1 text-xs text-muted-foreground">4.5:1 or higher for small text.</p>
        <dl className="mt-3 space-y-2 text-xs">
          <ContrastRow
            label="Canvas text"
            foreground={tokens.foreground}
            background={tokens.background}
          />
          <ContrastRow
            label="Secondary text"
            foreground={tokens.mutedForeground}
            background={tokens.background}
          />
          <ContrastRow
            label="Surface text"
            foreground={tokens.cardForeground}
            background={tokens.card}
          />
          <ContrastRow
            label="Action text"
            foreground={tokens.primaryForeground}
            background={tokens.primary}
          />
          <ContrastRow
            label="Selection text"
            foreground={tokens.accentForeground}
            background={tokens.accent}
          />
        </dl>
      </div>
    </aside>
  )
}

function ContrastRow({
  label,
  foreground,
  background,
}: {
  label: string
  foreground: string
  background: string
}) {
  const ratio = getContrastRatio(foreground, background)
  const passes = ratio !== null && ratio >= 4.5
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="flex gap-2 tabular-nums">
        <span>{ratio === null ? '—' : `${ratio.toFixed(2)}:1`}</span>
        <span className="w-12 text-right text-muted-foreground">{passes ? 'Pass' : 'Low'}</span>
      </dd>
    </div>
  )
}

export function AppearanceColorStudioPage() {
  return <AppearancePanel />
}

function token(
  tokenName: EditableThemeTokenName,
  label: string,
  description: string,
): TokenDefinition {
  return { token: tokenName, label, description }
}

function getPresetTokenValue(
  presetId: AppearancePresetId,
  mode: ResolvedAppearanceMode,
  tokenName: EditableThemeTokenName,
) {
  const preset = themePresets.find((item) => item.id === presetId) ?? themePresets[0]
  return preset[mode][tokenName]
}
