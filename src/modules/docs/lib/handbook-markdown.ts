import GithubSlugger from 'github-slugger'
import { toString } from 'mdast-util-to-string'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import type { Root, RootContent } from 'mdast'

export type HandbookHeading = { id: string; title: string; depth: number }
export type HandbookSection = HandbookHeading & { text: string }

export function annotateHandbook(tree: Root) {
  const slugger = new GithubSlugger()
  const headings: Array<HandbookHeading> = []
  for (const node of tree.children) {
    if (node.type !== 'heading') continue
    const title = toString(node)
    const id = slugger.slug(title)
    node.data = { ...node.data, hProperties: { ...node.data?.hProperties, id } }
    if (node.depth > 1 && node.depth <= 3) headings.push({ id, title, depth: node.depth })
  }
  return headings
}

export function remarkHandbook() {
  return (tree: Root) => {
    annotateHandbook(tree)
  }
}

export function parseHandbook(markdown: string) {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown)
  const headings = annotateHandbook(tree)
  const sections: Array<HandbookSection> = []
  const links: Array<string> = []
  let section: HandbookSection | undefined
  const collectLinks = (node: RootContent) => {
    if (node.type === 'link' || node.type === 'definition') links.push(node.url)
    if ('children' in node) node.children.forEach(collectLinks)
  }
  for (const node of tree.children) {
    collectLinks(node)
    const heading =
      node.type === 'heading'
        ? headings.find((item) => item.id === node.data?.hProperties?.id)
        : undefined
    if (heading) {
      section = { ...heading, text: '' }
      sections.push(section)
    } else if (section) {
      section.text += `${toString(node)}\n`
    }
  }
  return {
    headings,
    sections,
    links,
    text: toString(tree),
    headingTitle: toString(
      tree.children.find((node) => node.type === 'heading' && node.depth === 1) ?? tree,
    ),
  }
}
