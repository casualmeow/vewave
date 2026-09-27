import { Link } from '@tanstack/react-router'
import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock.core'
import { isValidElement } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getHandbookDocument } from '../content/handbook-content'
import { handbookManifest, resolveHandbookLink } from '../content/handbook-manifest'
import { remarkHandbook } from '../lib/handbook-markdown'
import { docsShiki } from '../lib/shiki'
import type { Components } from 'react-markdown'
import type { ReactNode } from 'react'
import { useAppearance } from '@/shared/theme'
import './handbook.css'

function HandbookCode({ children }: { children: ReactNode }) {
  const { resolvedMode } = useAppearance()
  if (!isValidElement<{ className?: string; children?: ReactNode }>(children)) {
    return <pre>{children}</pre>
  }
  const requestedLanguage = /language-([^\s]+)/.exec(children.props.className ?? '')?.[1] ?? 'text'
  const language = ['tsx', 'typescript', 'javascript', 'bash', 'json'].includes(requestedLanguage)
    ? requestedLanguage
    : 'text'
  const code = String(children.props.children ?? '').replace(/\n$/, '')
  return (
    <DynamicCodeBlock
      highlighter={() => docsShiki.getOrInit()}
      lang={language}
      code={code}
      options={{ theme: resolvedMode === 'dark' ? 'github-dark' : 'github-light' }}
      codeblock={{
        title: requestedLanguage === 'text' ? 'Reference' : requestedLanguage,
        className: 'handbook-code',
        viewportProps: { className: 'max-h-[32rem] overflow-auto' },
      }}
    />
  )
}

const markdownComponents: Components = {
  h2: ({ id, children }) => (
    <h2 id={id}>
      <a href={`#${id}`}>{children}</a>
    </h2>
  ),
  h3: ({ id, children }) => (
    <h3 id={id}>
      <a href={`#${id}`}>{children}</a>
    </h3>
  ),
  a: ({ href = '', children, title }) => {
    const destination = resolveHandbookLink(href)
    const [pathname, hash] = destination.split('#')
    return destination.startsWith('/admin/docs') ? (
      <Link to={pathname} hash={hash} title={title}>
        {children}
      </Link>
    ) : (
      <a href={destination} title={title}>
        {children}
      </a>
    )
  },
  table: ({ children }) => (
    <div
      className="handbook-table"
      tabIndex={0}
      role="region"
      aria-label="Scrollable reference table"
    >
      <table>{children}</table>
    </div>
  ),
  pre: ({ children }) => <HandbookCode>{children}</HandbookCode>,
}

export function HandbookMarkdown({ source }: { source: string }) {
  return (
    <Markdown skipHtml remarkPlugins={[remarkGfm, remarkHandbook]} components={markdownComponents}>
      {source}
    </Markdown>
  )
}

export function HandbookPage({ slug }: { slug: string }) {
  const doc = getHandbookDocument(slug)
  const position = handbookManifest.findIndex((entry) => entry.slug === slug)
  const previous = handbookManifest[position - 1]
  const next = handbookManifest[position + 1]
  return (
    <div className="grid min-w-0 gap-12 xl:grid-cols-[minmax(0,1fr)_12rem]">
      <article className="min-w-0 max-w-[76ch] pb-12">
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex flex-wrap items-center gap-2 text-xs text-muted-foreground"
        >
          <Link to="/admin/docs" className="hover:text-foreground">
            Handbook
          </Link>
          <span aria-hidden>/</span>
          <span aria-current="page">{slug === 'index' ? 'Introduction' : doc.title}</span>
        </nav>
        <div className="handbook-prose">
          <HandbookMarkdown source={doc.markdown} />
        </div>
        <footer className="mt-12 border-t border-border pt-5">
          <p className="text-xs text-muted-foreground">
            Markdown source: <code className="select-all">client/{doc.sourcePath}</code>
          </p>
          <div className="mt-6 flex flex-wrap justify-between gap-5 text-sm">
            {previous ? (
              <Link
                to={previous.slug === 'index' ? '/admin/docs' : '/admin/docs/handbook/$slug'}
                params={{ slug: previous.slug }}
                className="hover:underline"
              >
                <span className="mb-1 block text-xs text-muted-foreground">Previous</span>
                {previous.title}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                to="/admin/docs/handbook/$slug"
                params={{ slug: next.slug }}
                className="text-right hover:underline"
              >
                <span className="mb-1 block text-xs text-muted-foreground">Next</span>
                {next.title}
              </Link>
            ) : null}
          </div>
        </footer>
      </article>
      <aside className="hidden xl:block">
        <nav
          aria-label="On this page"
          className="sticky top-24 space-y-3 border-l border-border pl-5 text-xs"
        >
          <p className="mb-4 font-medium text-foreground">On this page</p>
          {doc.headings.map((heading) => (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              className={`block leading-5 text-muted-foreground hover:text-foreground ${heading.depth === 3 ? 'pl-3' : ''}`}
            >
              {heading.title}
            </a>
          ))}
        </nav>
      </aside>
    </div>
  )
}
