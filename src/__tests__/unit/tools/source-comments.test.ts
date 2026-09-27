import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { cleanSourceComments, stripSourceComments } from '../../../../scripts/source-comments.mjs'
import { generatedSourcePlugins } from '../../../../scripts/generated-source-plugin'

describe('source comment cleanup', () => {
  it('preserves URL strings, regexes, and template contents', () => {
    const code =
      'const url = "https://example.com"\nconst pattern = /https?:\\/\\//\nconst text = `literal /* text */ and // text`\n'
    expect(stripSourceComments(code, 'sample.ts')).toBe(code)
  })

  it('removes generator headers, directives, and descriptions without changing declarations', () => {
    const code =
      '/** Generated output */\n// @ts-nocheck\n/** Description */\nexport type Result = { value: string }\n'
    expect(stripSourceComments(code, 'generated.ts')).toBe(
      'export type Result = { value: string }\n',
    )
  })

  it('keeps line breaks that affect automatic semicolon insertion', () => {
    const code = 'function example() { return /* first\nsecond */ 1 }'
    const result = stripSourceComments(code, 'sample.ts')
    expect(result).not.toContain('first')
    expect(result.split('\n')).toHaveLength(2)
    expect(result).toMatch(/return\s+\n\s+1/)
  })

  it('removes JSX comments without introducing visible text or spaces', () => {
    const code = 'const node = <span>one{/* explanation */}two</span>'
    expect(stripSourceComments(code, 'sample.tsx')).toBe('const node = <span>onetwo</span>')
  })

  it('retains required license notices, including inside JSX', () => {
    const code =
      '/** @license MIT */\nconst node = <span>{/* Copyright Example */ /* explanation */}</span>'
    const result = stripSourceComments(code, 'sample.tsx')
    expect(result).toContain('@license MIT')
    expect(result).toContain('Copyright Example')
    expect(result).not.toContain('explanation')
  })

  it('is idempotent for regenerated files and leaves other file types alone', () => {
    const directory = mkdtempSync(join(tmpdir(), 'vewave-generated-comments-'))
    mkdirSync(join(directory, 'model'))
    const target = join(directory, 'model', 'result.ts')
    writeFileSync(target, '/** Generated */\nexport type Result = string\n')
    writeFileSync(join(directory, 'LICENSE.md'), 'Keep this notice')
    expect(cleanSourceComments([directory])).toBe(1)
    expect(cleanSourceComments([directory])).toBe(0)
    expect(readFileSync(target, 'utf8')).toBe('export type Result = string\n')
    expect(readFileSync(join(directory, 'LICENSE.md'), 'utf8')).toBe('Keep this notice')
  })

  it('ignores generated route-tree writes while forwarding route-source changes', async () => {
    const watchChange = vi.fn()
    const plugins = generatedSourcePlugins({ name: 'tanstack:router-generator', watchChange })
    const hook = plugins[0].watchChange
    if (!hook || typeof hook === 'function') throw new Error('Expected wrapped watcher')
    const context = { marker: 'original context' }
    await hook.handler.call(context as never, join(process.cwd(), 'src/routeTree.gen.ts'), {
      event: 'update',
    })
    expect(watchChange).not.toHaveBeenCalled()
    const source = join(process.cwd(), 'src/routes/index.tsx')
    await hook.handler.call(context as never, source, { event: 'update' })
    expect(watchChange).toHaveBeenCalledExactlyOnceWith(source, { event: 'update' })
    expect(watchChange.mock.contexts[0]).toBe(context)
    expect(plugins[1].buildStart).toMatchObject({ sequential: true })
  })
})
