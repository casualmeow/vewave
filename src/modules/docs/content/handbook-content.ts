import { notFound } from '@tanstack/react-router'
import { parseHandbook } from '../lib/handbook-markdown'
import { handbookHref, handbookManifest } from './handbook-manifest'

const sources = import.meta.glob<string>('/docs/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

export const handbookDocuments = handbookManifest.map((entry) => {
  const markdown = sources[`/${entry.sourcePath}`]
  if (markdown === undefined) throw new Error(`Missing handbook source: ${entry.sourcePath}`)
  return { ...entry, markdown, ...parseHandbook(markdown) }
})

export function getHandbookDocument(slug: string) {
  const document = handbookDocuments.find((entry) => entry.slug === slug)
  if (!document) throw notFound()
  return document
}

export const handbookSearchRecords = handbookDocuments.flatMap((doc) => [
  {
    id: `handbook:${doc.slug}`,
    title: doc.title,
    description: doc.description,
    url: handbookHref(doc.slug),
    breadcrumbs: ['Handbook', doc.group],
    keywords: [doc.text, doc.sourcePath],
  },
  ...doc.sections.map((section) => ({
    id: `handbook:${doc.slug}:${section.id}`,
    title: section.title,
    description: section.text.trim().slice(0, 200),
    url: `${handbookHref(doc.slug)}#${section.id}`,
    breadcrumbs: ['Handbook', doc.title],
    keywords: [section.text],
  })),
])
