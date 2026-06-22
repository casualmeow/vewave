import { componentDocs } from './component-docs-content'
import {
  architectureRows,
  docsNavItems,
  overviewCards,
  uiComponentDocs,
  uiPrinciples,
} from './docs-content'
import { sharedUiCategories, sharedUiDocNavItems } from './shared-ui-docs-nav'

export type DocsSearchRecord = {
  id: string
  title: string
  description: string
  url: string
  breadcrumbs: Array<string>
  keywords: Array<string>
}

function createComponentRecords() {
  return Object.values(componentDocs).flatMap((doc) => [
    {
      id: `component:${doc.slug}`,
      title: doc.title,
      description: doc.description,
      url: doc.to,
      breadcrumbs: ['Docs', 'UI components'],
      keywords: [doc.eyebrow, doc.importSnippet, doc.usageSnippet],
    },
    ...doc.sections.map((section) => ({
      id: `component:${doc.slug}:section:${section.title}`,
      title: section.title,
      description: section.body,
      url: doc.to,
      breadcrumbs: ['Docs', 'UI components', doc.title],
      keywords: [section.code ?? ''],
    })),
    ...doc.apiRows.map((row) => ({
      id: `component:${doc.slug}:api:${row.name}`,
      title: row.name,
      description: row.description,
      url: doc.to,
      breadcrumbs: ['Docs', 'UI components', doc.title, 'API'],
      keywords: [row.type],
    })),
  ])
}

function createSharedUiRecords() {
  const categoryTitleById = new Map(
    sharedUiCategories.map((category) => [category.id, category.title]),
  )

  return sharedUiDocNavItems.map((doc) => ({
    id: `shared:${doc.slug}`,
    title: doc.title,
    description: doc.description,
    url: doc.to,
    breadcrumbs: ['Docs', 'Shared UI', categoryTitleById.get(doc.category) ?? doc.category],
    keywords: [doc.file, doc.category],
  }))
}

function createOverviewRecords() {
  return [
    ...docsNavItems.map((item) => ({
      id: `nav:${item.to}`,
      title: item.title,
      description: item.description,
      url: item.to,
      breadcrumbs: ['Docs'],
      keywords: [item.to],
    })),
    ...overviewCards.map((item) => ({
      id: `overview:${item.title}`,
      title: item.title,
      description: item.description,
      url: '/admin/docs',
      breadcrumbs: ['Docs', 'Overview'],
      keywords: [],
    })),
    ...architectureRows.map((row) => ({
      id: `architecture:${row.path}`,
      title: row.path,
      description: row.purpose,
      url: '/admin/docs',
      breadcrumbs: ['Docs', 'Architecture'],
      keywords: [],
    })),
    ...uiPrinciples.map((item) => ({
      id: `ui-principle:${item.title}`,
      title: item.title,
      description: item.description,
      url: '/admin/docs/ui',
      breadcrumbs: ['Docs', 'UI'],
      keywords: [],
    })),
    ...uiComponentDocs.map((item) => ({
      id: `ui-component:${item.title}`,
      title: item.title,
      description: item.description,
      url: 'to' in item ? item.to : '/admin/docs/ui/components',
      breadcrumbs: ['Docs', 'UI components'],
      keywords: [item.status, ...item.notes],
    })),
  ]
}

export const docsSearchRecords: Array<DocsSearchRecord> = [
  ...createOverviewRecords(),
  ...createComponentRecords(),
  ...createSharedUiRecords(),
]
