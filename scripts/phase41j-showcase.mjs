import { readFileSync, writeFileSync } from 'node:fs'

const showcase = 'src/modules/ui-showcase/components/fluid-glass-showcase.tsx'
const tabs = 'src/modules/ui-showcase/components/fluid-glass-tab-comparison.tsx'

const edits = [
  {
    file: showcase,
    from: "} from '@/components/fluid-glass'",
    to:
      "} from '@/components/fluid-glass'\n" +
      '// Lab-only deep imports: the scope boundary and pane-debug snapshot are\n' +
      '// deliberately not part of the public barrel. The one-active-WebGL-scope limit\n' +
      '// is production pilot policy, not a documented component API.\n' +
      "import { LensLaboratoryScopeProvider } from '@/components/fluid-glass/lens/scope-context'\n" +
      "import { formatLensPaneDebug, useLensPaneDebug } from '@/components/fluid-glass/lens/pane-debug'",
  },
  {
    file: showcase,
    from:
      'function BackendBadge({ backend }: { backend: FluidGlassBackend }) {\n' +
      '  return (\n' +
      '    <span\n' +
      '      className={cn(\n' +
      "        'inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold',\n" +
      "        backend === 'transmission'\n" +
      "          ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'\n" +
      "          : backend === 'sdf'\n" +
      "            ? 'border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300'\n" +
      "            : 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300',\n" +
      '      )}\n' +
      '    >\n' +
      '      <span className="size-1.5 rounded-full bg-current" />\n' +
      "      {backend === 'transmission' ? 'Transmission' : backend === 'sdf' ? 'SDF' : 'CSS'}\n" +
      '    </span>\n' +
      '  )\n' +
      '}',
    to:
      '/**\n' +
      ' * Truthful pane status.\n' +
      ' *\n' +
      ' * A pane titled "Custom SDF lens" must never read as a valid SDF comparison\n' +
      ' * while its resolved backend is CSS. The badge therefore reports what the group\n' +
      ' * actually resolved, and when that differs from what the pane exists to\n' +
      ' * demonstrate it also shows why — requested, resolved, reason, scope and source\n' +
      ' * readability. Outside a group it falls back to the passed backend.\n' +
      ' */\n' +
      'function BackendBadge({\n' +
      '  backend,\n' +
      '  expects,\n' +
      '}: {\n' +
      '  backend: FluidGlassBackend\n' +
      '  /** The backend this pane exists to demonstrate, when it demonstrates one. */\n' +
      '  expects?: FluidGlassBackend\n' +
      '}) {\n' +
      '  const debug = useLensPaneDebug()\n' +
      '  const resolved = debug?.legacyBackend ?? backend\n' +
      '  const fellBack = expects !== undefined && resolved !== expects\n' +
      '\n' +
      '  return (\n' +
      '    <div\n' +
      '      className="flex flex-col items-start gap-1"\n' +
      '      data-fluid-glass-pane-status={resolved}\n' +
      '      data-fluid-glass-pane-expected={expects}\n' +
      '      data-fluid-glass-pane-fallback={fellBack || undefined}\n' +
      '    >\n' +
      '      <span\n' +
      '        className={cn(\n' +
      "          'inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold',\n" +
      '          fellBack\n' +
      "            ? 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300'\n" +
      "            : resolved === 'transmission'\n" +
      "              ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'\n" +
      "              : resolved === 'sdf'\n" +
      "                ? 'border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300'\n" +
      "                : 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300',\n" +
      '        )}\n' +
      '      >\n' +
      '        <span className="size-1.5 rounded-full bg-current" />\n' +
      "        {resolved === 'transmission' ? 'Transmission' : resolved === 'sdf' ? 'SDF' : 'CSS'}\n" +
      '        {fellBack ? ` \\u2014 expected ${expects}` : null}\n' +
      '      </span>\n' +
      '      {debug && (fellBack || debug.degraded) ? (\n' +
      '        <pre\n' +
      '          data-fluid-glass-pane-debug\n' +
      '          className="whitespace-pre rounded-md border border-border/60 bg-background/80 px-2 py-1 font-mono text-[0.6rem] leading-tight text-muted-foreground"\n' +
      '        >\n' +
      '          {formatLensPaneDebug(debug)}\n' +
      '        </pre>\n' +
      '      ) : null}\n' +
      '    </div>\n' +
      '  )\n' +
      '}',
  },
  {
    file: showcase,
    from: '          <BackendBadge backend={backend} />\n',
    to: '          <BackendBadge backend={backend} expects="transmission" />\n',
  },
  {
    file: showcase,
    from: '            <BackendBadge backend={sdfBackend} />',
    to: '            <BackendBadge backend={sdfBackend} expects="sdf" />',
  },
  {
    file: showcase,
    from: '            <BackendBadge backend={sdfDarkBackend} />',
    to: '            <BackendBadge backend={sdfDarkBackend} expects="sdf" />',
  },
  {
    file: showcase,
    from: 'export function FluidGlassShowcase() {',
    to:
      '/**\n' +
      ' * The showcase renders four comparison groups at once (the tab-material pane\n' +
      ' * plus the three tone-scenario panes). Under the production one-slot pilot guard\n' +
      ' * the first pane would take the only slot and every later pane would resolve to\n' +
      ' * CSS with `scope-limit-reached`, which is precisely what made the laboratory\n' +
      ' * unable to compare the renderers it demonstrates.\n' +
      ' *\n' +
      ' * The laboratory therefore owns an isolated guard sized to exactly the number of\n' +
      ' * simultaneous renderers it needs. The production singleton keeps its limit of\n' +
      ' * one, and leaving this route cannot affect production scope ownership.\n' +
      ' */\n' +
      'const showcaseSimultaneousRenderers = 4\n' +
      '\n' +
      'export function FluidGlassShowcase() {\n' +
      '  return (\n' +
      '    <LensLaboratoryScopeProvider simultaneousRenderers={showcaseSimultaneousRenderers}>\n' +
      '      <FluidGlassShowcaseContent />\n' +
      '    </LensLaboratoryScopeProvider>\n' +
      '  )\n' +
      '}\n' +
      '\n' +
      'function FluidGlassShowcaseContent() {',
  },

  {
    file: tabs,
    from: "} from '@/components/fluid-glass'\nimport { cn } from '@/shared/lib/utils'",
    to:
      "} from '@/components/fluid-glass'\n" +
      "import { LensLaboratoryScopeProvider } from '@/components/fluid-glass/lens/scope-context'\n" +
      "import { cn } from '@/shared/lib/utils'",
  },
  {
    file: tabs,
    from:
      'export function FluidGlassTabComparison({\n' +
      '  lightDirection,\n' +
      '  material,\n' +
      '  transmissionMaterial,\n' +
      '}: {\n' +
      '  lightDirection: readonly [number, number]\n' +
      '  material: FluidGlassMaterial\n' +
      '  transmissionMaterial: FluidTransmissionMaterial\n' +
      '}) {',
    to:
      'type FluidGlassTabComparisonProps = {\n' +
      '  lightDirection: readonly [number, number]\n' +
      '  material: FluidGlassMaterial\n' +
      '  transmissionMaterial: FluidTransmissionMaterial\n' +
      '}\n' +
      '\n' +
      '/**\n' +
      ' * Both panes must render at once for the comparison to mean anything, so the\n' +
      ' * comparison owns an isolated two-slot guard. The production pilot guard keeps\n' +
      ' * its single slot.\n' +
      ' */\n' +
      'export function FluidGlassTabComparison(props: FluidGlassTabComparisonProps) {\n' +
      '  return (\n' +
      '    <LensLaboratoryScopeProvider simultaneousRenderers={2}>\n' +
      '      <FluidGlassTabComparisonContent {...props} />\n' +
      '    </LensLaboratoryScopeProvider>\n' +
      '  )\n' +
      '}\n' +
      '\n' +
      'function FluidGlassTabComparisonContent({\n' +
      '  lightDirection,\n' +
      '  material,\n' +
      '  transmissionMaterial,\n' +
      '}: FluidGlassTabComparisonProps) {',
  },
]

let failed = false
for (const edit of edits) {
  const contents = readFileSync(edit.file, 'utf8')
  const occurrences = contents.split(edit.from).length - 1
  if (occurrences !== 1) {
    console.error(
      `FAIL ${edit.file}: ${occurrences} matches for ${JSON.stringify(edit.from.slice(0, 70))}`,
    )
    failed = true
    continue
  }
  writeFileSync(edit.file, contents.replace(edit.from, edit.to))
  console.log(`ok ${edit.file}`)
}
process.exit(failed ? 1 : 0)
