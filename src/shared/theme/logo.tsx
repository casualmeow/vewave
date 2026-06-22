import { useAppearance } from './provider'
import { getReadableForeground, normalizeHexColor } from './validators'
import type { HTMLAttributes } from 'react'
import type { LogoStrategy, ThemeTokenName, ThemeTokens } from './contract'
import { cn } from '@/shared/lib/utils'

type LogoTone = 'dark' | 'light' | 'mono'

type LogoSurfaceToken = Extract<
  ThemeTokenName,
  'background' | 'card' | 'foreground' | 'header' | 'primary' | 'sidebar'
>

type VewaveLogoMarkProps = HTMLAttributes<HTMLSpanElement> & {
  label?: string
  surfaceColor?: string
  surfaceToken?: LogoSurfaceToken
}

const logoToneClasses = {
  dark: 'border-[color:var(--logo-border)] bg-[var(--logo-dark)] text-[var(--logo-dark-foreground)]',
  light:
    'border-[color:var(--logo-border)] bg-[var(--logo-light)] text-[var(--logo-light-foreground)]',
  mono: 'border-current/35 bg-transparent text-current',
} satisfies Record<LogoTone, string>

export function VewaveLogoMark({
  className,
  label = 'V',
  surfaceColor,
  surfaceToken = 'header',
  ...props
}: VewaveLogoMarkProps) {
  const { resolvedMode, settings, tokens } = useAppearance()
  const surface = surfaceColor ?? tokens[surfaceToken]
  const tone = resolveLogoTone(settings.logoStrategy, surface, resolvedMode)

  return (
    <span
      data-vewave-logo-mark=""
      data-logo-tone={tone}
      className={cn(
        'grid size-8 place-items-center rounded-full border text-sm font-black shadow-sm',
        logoToneClasses[tone],
        className,
      )}
      {...props}
    >
      {label}
    </span>
  )
}

export function resolveLogoTone(
  strategy: LogoStrategy,
  surfaceColor: string,
  fallbackMode: 'dark' | 'light',
): LogoTone {
  if (strategy === 'light' || strategy === 'dark' || strategy === 'mono') {
    return strategy
  }

  const normalizedSurface = normalizeHexColor(surfaceColor)

  if (!normalizedSurface) {
    return fallbackMode === 'dark' ? 'light' : 'dark'
  }

  return getReadableForeground(normalizedSurface) === '#FFFFFF' ? 'light' : 'dark'
}

export function getLogoSurfaceColor(tokens: ThemeTokens, surfaceToken: LogoSurfaceToken) {
  return tokens[surfaceToken]
}
