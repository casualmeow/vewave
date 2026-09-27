export const handbookGroups = ['Start here', 'Architecture and systems', 'Contributing'] as const

export type HandbookEntry = {
  slug: string
  title: string
  description: string
  group: (typeof handbookGroups)[number]
  order: number
  sourcePath: string
}

export const handbookManifest: ReadonlyArray<HandbookEntry> = [
  {
    slug: 'index',
    title: 'Developer handbook',
    description: 'Find your way around Vewave and make your first change.',
    group: 'Start here',
    order: 0,
    sourcePath: 'docs/index.md',
  },
  {
    slug: 'getting-started',
    title: 'Local setup',
    description: 'Run the client, API, and database with the right tools.',
    group: 'Start here',
    order: 1,
    sourcePath: 'docs/getting-started.md',
  },
  {
    slug: 'repository-map',
    title: 'Repository map',
    description: 'Folder ownership, entrypoints, and where new code belongs.',
    group: 'Start here',
    order: 2,
    sourcePath: 'docs/repository-map.md',
  },
  {
    slug: 'architecture',
    title: 'Application architecture',
    description: 'Follow a request through the browser, API, and database.',
    group: 'Architecture and systems',
    order: 3,
    sourcePath: 'docs/architecture.md',
  },
  {
    slug: 'contracts',
    title: 'API and realtime contracts',
    description: 'Generated REST clients, sessions, errors, and room events.',
    group: 'Architecture and systems',
    order: 4,
    sourcePath: 'docs/contracts.md',
  },
  {
    slug: 'glass-motion',
    title: 'Glass and motion',
    description: 'Material ownership, rendering backends, lifecycle, and fallbacks.',
    group: 'Architecture and systems',
    order: 5,
    sourcePath: 'docs/glass-motion.md',
  },
  {
    slug: 'appearance',
    title: 'Appearance preferences',
    description: 'Theme resolution, account persistence, and background settings.',
    group: 'Architecture and systems',
    order: 6,
    sourcePath: 'docs/appearance.md',
  },
  {
    slug: 'authentication',
    title: 'Authentication',
    description: 'Sign-in, registration, session bootstrap, and shared artwork.',
    group: 'Architecture and systems',
    order: 7,
    sourcePath: 'docs/authentication.md',
  },
  {
    slug: 'client-maintenance',
    title: 'Client maintenance notes',
    description: 'Startup, resizing, uploads, changelog parsing, storage, and generated source.',
    group: 'Architecture and systems',
    order: 8,
    sourcePath: 'docs/client-maintenance.md',
  },
  {
    slug: 'testing',
    title: 'Testing and troubleshooting',
    description: 'Choose checks that prove the change and diagnose failures.',
    group: 'Contributing',
    order: 9,
    sourcePath: 'docs/testing.md',
  },
  {
    slug: 'contributing',
    title: 'Making and documenting changes',
    description: 'Code conventions, documentation ownership, and review handoff.',
    group: 'Contributing',
    order: 10,
    sourcePath: 'docs/contributing.md',
  },
]

export function handbookHref(slug: string) {
  return slug === 'index' ? '/admin/docs' : `/admin/docs/handbook/${slug}`
}

export function resolveHandbookLink(href: string) {
  const match = /^(?:\.\/)?([a-z0-9-]+)\.md(#[^\s]*)?$/.exec(href)
  if (!match) return href
  const entry = handbookManifest.find((item) => item.slug === match[1])
  return entry ? `${handbookHref(entry.slug)}${match[2] ?? ''}` : href
}
