import { render, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DocsCodeBlock } from '@/modules/docs/components/component-doc-primitives'

describe('DocsCodeBlock', () => {
  it('renders Shiki token colors instead of plain code text', async () => {
    const { container } = render(
      <DocsCodeBlock title="Highlight test">
        {
          'const variant = "liquidGlass"\nfunction render() {\n  return <Sidebar design={variant} />\n}'
        }
      </DocsCodeBlock>,
    )

    await waitFor(
      () => {
        const coloredTokens = container.querySelectorAll('.shiki code span[style*="color"]')

        expect(coloredTokens.length).toBeGreaterThan(4)
      },
      { timeout: 5000 },
    )

    const tokenStyles = Array.from(
      container.querySelectorAll<HTMLSpanElement>('.shiki code span[style*="color"]'),
      (token) => token.getAttribute('style') ?? '',
    )
    const tokenColors = new Set(
      tokenStyles
        .map((style) => style.match(/color:\s*([^;]+)/)?.[1])
        .filter((color): color is string => Boolean(color)),
    )

    expect(tokenColors.size).toBeGreaterThan(2)
    expect(tokenStyles.every((style) => !style.includes('--shiki-light'))).toBe(true)
    expect(container.querySelector('.shiki')?.getAttribute('style')).toContain('background-color:')
  }, 15000)
})
