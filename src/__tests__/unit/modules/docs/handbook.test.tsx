import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import type * as Router from '@tanstack/react-router'
import {
  getHandbookDocument,
  handbookDocuments,
  handbookSearchRecords,
} from '@/modules/docs/content/handbook-content'
import {
  handbookHref,
  handbookManifest,
  resolveHandbookLink,
} from '@/modules/docs/content/handbook-manifest'
import { parseHandbook } from '@/modules/docs/lib/handbook-markdown'
import { HandbookMarkdown } from '@/modules/docs/components/handbook-page'

vi.mock('@tanstack/react-router', async (original) => ({
  ...(await original<typeof Router>()),
  Link: ({ to, hash, children, ...props }: { to: string; hash?: string; children: ReactNode }) => (
    <a href={`${to}${hash ? `#${hash}` : ''}`} {...props}>
      {children}
    </a>
  ),
}))
vi.mock('@/shared/theme', () => ({ useAppearance: () => ({ resolvedMode: 'light' }) }))
vi.mock('fumadocs-ui/components/dynamic-codeblock.core', () => ({
  DynamicCodeBlock: ({ code, lang }: { code: string; lang: string }) => (
    <pre data-language={lang}>{code}</pre>
  ),
}))

afterEach(() => vi.clearAllMocks())

describe('Markdown handbook', () => {
  it('registers unique pages with matching Markdown titles and source files', () => {
    expect(new Set(handbookManifest.map((entry) => entry.slug)).size).toBe(handbookManifest.length)
    expect(new Set(handbookManifest.map((entry) => entry.order)).size).toBe(handbookManifest.length)
    for (const doc of handbookDocuments) {
      expect(doc.markdown.trim().length).toBeGreaterThan(100)
      expect(doc.headingTitle).toBe(doc.title)
      expect(doc.sourcePath).toBe(`docs/${doc.slug}.md`)
    }
  })

  it('resolves all relative handbook links and anchors to existing content', () => {
    for (const doc of handbookDocuments) {
      for (const href of doc.links.filter((link) => !link.startsWith('/'))) {
        const [file, anchor] = href.split('#')
        const target = getHandbookDocument(file.replace(/^\.\//, '').replace(/\.md$/, ''))
        expect(resolveHandbookLink(href)).toBe(
          `${handbookHref(target.slug)}${anchor ? `#${anchor}` : ''}`,
        )
        if (anchor) expect(target.headings.map((heading) => heading.id)).toContain(anchor)
      }
    }
  })

  it('produces a route not-found result for an unknown slug', () => {
    expect(() => getHandbookDocument('missing-page')).toThrow(
      expect.objectContaining({ isNotFound: true }),
    )
  })

  it('uses the same unique heading anchors for rendering and metadata', () => {
    const source = '# Example\n\n## Account saves\n\nFirst.\n\n## Account saves\n\nSecond.'
    const { headings } = parseHandbook(source)
    render(<HandbookMarkdown source={source} />)
    expect(headings.map((heading) => heading.id)).toEqual(['account-saves', 'account-saves-1'])
    expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.id)).toEqual(
      headings.map((heading) => heading.id),
    )
  })

  it('indexes section text and targets the matching heading', () => {
    const record = handbookSearchRecords.find(
      (entry) => entry.id === 'handbook:appearance:account-saves',
    )
    expect(record?.url).toBe('/admin/docs/handbook/appearance#account-saves')
    expect(record?.keywords.join(' ')).toContain('Switching accounts')
  })

  it('renders GFM tables, code, and app links without executing raw HTML', () => {
    const source =
      '# Reference\n\n| Folder | Owner |\n| --- | --- |\n| routes | Router |\n\n```bash\nnpm run dev\n```\n\n[Account saves](appearance.md#account-saves)\n\n<script>window.handbookExecuted = true</script>\n\n<div>hidden raw HTML</div>'
    const { container } = render(<HandbookMarkdown source={source} />)
    expect(screen.getByRole('table')).toBeTruthy()
    expect(screen.getByRole('region', { name: 'Scrollable reference table' }).tabIndex).toBe(0)
    expect(screen.getByText('npm run dev').getAttribute('data-language')).toBe('bash')
    expect(screen.getByRole('link', { name: 'Account saves' }).getAttribute('href')).toBe(
      '/admin/docs/handbook/appearance#account-saves',
    )
    expect(container.querySelector('script')).toBeNull()
    expect(screen.queryByText('hidden raw HTML')).toBeNull()
  })
})
