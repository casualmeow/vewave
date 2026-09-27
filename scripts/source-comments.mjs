import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import ts from 'typescript'

export function stripSourceComments(source, filename) {
  const tree = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true)
  const ranges = new Map()
  const notices = new Map()
  const jsx = []
  const collect = (position) => {
    const comments = [
      ...(ts.getLeadingCommentRanges(source, position) ?? []),
      ...(ts.getTrailingCommentRanges(source, position) ?? []),
    ]
    for (const range of comments) {
      if (
        /@license\b|\bcopyright\b|SPDX-License-Identifier|@preserve\b/i.test(
          source.slice(range.pos, range.end),
        )
      ) {
        notices.set(`${range.pos}:${range.end}`, range)
        continue
      }
      ranges.set(`${range.pos}:${range.end}`, { start: range.pos, end: range.end, jsx: false })
    }
  }
  const visit = (node) => {
    collect(node.getFullStart())
    collect(node.end)
    if (ts.isJsxExpression(node) && !node.expression) jsx.push(node)
    node.getChildren(tree).forEach(visit)
  }
  visit(tree)
  for (const node of jsx) {
    if ([...notices.values()].some((range) => range.pos >= node.pos && range.end <= node.end))
      continue
    const inside = [...ranges.entries()].filter(
      ([, range]) => range.start >= node.pos && range.end <= node.end,
    )
    if (!inside.length) continue
    inside.forEach(([key]) => ranges.delete(key))
    ranges.set(`${node.getStart(tree)}:${node.end}`, {
      start: node.getStart(tree),
      end: node.end,
      jsx: true,
    })
  }
  let result = source
  for (const range of [...ranges.values()].sort((a, b) => b.start - a.start)) {
    const lineStart = source.lastIndexOf('\n', range.start - 1) + 1
    const newline = source.indexOf('\n', range.end)
    const lineEnd = newline < 0 ? source.length : newline + 1
    const wholeLine =
      !source.slice(lineStart, range.start).trim() && !source.slice(range.end, lineEnd).trim()
    const start = wholeLine ? lineStart : range.start
    const end = wholeLine ? lineEnd : range.end
    const replacement =
      wholeLine || range.jsx ? '' : source.slice(start, end).replace(/[^\r\n]/g, ' ')
    result = result.slice(0, start) + replacement + result.slice(end)
  }
  return result
}

export function cleanSourceComments(paths) {
  let changed = 0
  const visit = (filename) => {
    if (!existsSync(filename)) return
    if (statSync(filename).isDirectory()) {
      readdirSync(filename).forEach((entry) => visit(join(filename, entry)))
      return
    }
    if (!/\.[cm]?[jt]sx?$/.test(filename)) return
    const source = readFileSync(filename, 'utf8')
    const result = stripSourceComments(source, filename)
    if (result === source) return
    writeFileSync(filename, result)
    changed++
  }
  paths.forEach(visit)
  return changed
}
