import { useAppearance } from './hooks'
import { getReadableForeground, normalizeHexColor } from './validators'
import type { HTMLAttributes } from 'react'
import type { LogoStrategy, ResolvedAppearanceMode, ThemeTokenName, ThemeTokens } from './contract'
import { cn } from '@/shared/lib/utils'

export type LogoTone = 'dark' | 'light' | 'mono'

export type LogoSurfaceToken = Extract<
  ThemeTokenName,
  'background' | 'card' | 'foreground' | 'header' | 'primary' | 'sidebar'
>

type VewaveLogoMarkProps = HTMLAttributes<HTMLSpanElement> & {
  decorative?: boolean
  label?: string
  logoStrategy?: LogoStrategy
  resolvedMode?: ResolvedAppearanceMode
  surfaceColor?: string
  surfaceToken?: LogoSurfaceToken
}

const logoToneClasses = {
  dark: 'border-transparent bg-transparent',
  light: 'border-transparent bg-transparent',
  mono: 'border-transparent bg-transparent text-current',
} satisfies Record<LogoTone, string>

const logoPathColors = {
  dark: {
    base: 'var(--logo-dark)',
    accent: 'var(--logo-accent)',
  },
  light: {
    base: 'var(--logo-light)',
    accent: 'var(--logo-accent)',
  },
  mono: {
    base: 'currentColor',
    accent: 'currentColor',
  },
} satisfies Record<LogoTone, { accent: string; base: string }>

const logoPathData = {
  base: 'M 184.500 322.669 C 178.390 320.633 174.804 318.494 171.367 314.835 C 169.645 313.001 157.313 295.075 143.964 275.000 C 130.616 254.925 111.878 226.924 102.325 212.775 C 92.772 198.626 84.693 186.364 84.371 185.525 C 83.856 184.181 86.982 184.001 110.643 184.012 L 137.500 184.024 L 148.084 199.762 C 153.905 208.418 168.670 230.492 180.895 248.816 L 203.123 282.133 L 216.355 261.816 C 231.997 237.800 237.918 231.243 246.364 228.587 C 253.283 226.410 261.203 226.960 267.625 230.064 C 274.184 233.234 281.863 242.294 292.428 259.328 C 297.827 268.033 302.584 274.783 302.998 274.328 C 303.412 273.872 317.100 253.363 333.416 228.750 L 363.080 184.000 L 389.540 184.000 C 404.093 184.000 416.000 184.353 416.000 184.784 C 416.000 185.216 413.678 188.928 410.840 193.034 C 408.002 197.140 388.686 225.925 367.916 257.000 C 347.145 288.075 328.880 314.713 327.326 316.196 C 325.772 317.679 322.250 319.929 319.500 321.196 C 315.221 323.168 312.914 323.495 303.500 323.466 C 284.822 323.409 280.396 319.950 265.035 293.402 C 259.338 283.556 254.474 275.123 254.226 274.663 C 253.612 273.524 256.739 266.619 260.753 260.250 C 262.573 257.363 263.821 255.000 263.528 255.000 C 262.939 255.000 250.475 273.623 236.089 296.000 C 220.732 319.887 216.534 323.017 199.025 323.631 C 192.002 323.878 187.169 323.558 184.500 322.669 Z',
  accent:
    'M 293.500 323.059 C 288.776 321.933 282.930 318.861 281.670 316.844 C 281.037 315.830 279.996 315.000 279.357 315.000 C 278.057 315.000 272.820 307.347 268.407 299.000 C 266.808 295.975 265.245 293.275 264.932 293.000 C 264.620 292.725 261.970 288.325 259.042 283.223 L 253.720 273.946 L 255.473 270.060 C 256.437 267.923 256.916 265.673 256.538 265.062 C 256.161 264.451 256.312 264.074 256.876 264.225 C 257.439 264.376 259.835 261.602 262.200 258.059 C 267.843 249.607 270.513 247.749 277.486 247.424 C 283.778 247.130 285.689 248.355 290.058 255.486 C 291.401 257.678 292.950 260.205 293.500 261.100 C 294.050 261.996 295.497 264.477 296.716 266.614 C 297.935 268.751 299.756 271.538 300.763 272.806 L 302.594 275.113 L 317.898 252.056 C 326.315 239.375 333.531 229.000 333.934 229.000 C 334.337 229.000 334.669 228.438 334.671 227.750 C 334.676 226.402 341.013 216.716 342.250 216.167 C 342.663 215.983 343.000 215.433 343.000 214.944 C 343.000 214.455 347.536 207.292 353.080 199.027 L 363.160 184.000 L 389.580 184.000 C 404.111 184.000 416.000 184.327 416.000 184.726 C 416.000 186.138 402.677 205.000 401.680 205.000 C 401.122 205.000 400.941 205.274 401.275 205.609 C 401.610 205.943 396.848 213.663 390.692 222.764 C 384.536 231.865 378.825 240.314 378.000 241.539 C 377.175 242.765 375.405 245.620 374.066 247.884 C 372.727 250.148 371.265 252.000 370.816 252.000 C 370.367 252.000 370.000 252.567 370.000 253.260 C 370.000 253.953 368.857 255.753 367.460 257.260 C 366.062 258.767 365.193 260.000 365.528 260.000 C 365.862 260.000 365.093 261.390 363.818 263.090 C 362.543 264.789 361.050 266.926 360.500 267.840 C 359.950 268.753 353.223 278.950 345.551 290.500 C 331.135 312.204 326.356 318.338 324.671 317.297 C 324.132 316.964 323.979 317.158 324.332 317.728 C 324.696 318.317 322.710 319.754 319.736 321.054 C 315.758 322.792 312.338 323.394 305.500 323.558 C 300.550 323.677 295.150 323.453 293.500 323.059 Z',
} as const

export function VewaveLogoMark({
  className,
  decorative = false,
  label = 'Vewave',
  logoStrategy,
  resolvedMode: resolvedModeOverride,
  surfaceColor,
  surfaceToken = 'header',
  ...props
}: VewaveLogoMarkProps) {
  const { resolvedMode, settings, tokens } = useAppearance()
  const surface = surfaceColor ?? tokens[surfaceToken]
  const tone = resolveLogoTone(
    logoStrategy ?? settings.logoStrategy,
    surface,
    resolvedModeOverride ?? resolvedMode,
  )
  const { 'aria-hidden': ariaHidden, 'aria-label': ariaLabel, role, ...spanProps } = props

  return (
    <span
      {...spanProps}
      data-vewave-logo-mark=""
      data-logo-tone={tone}
      role={decorative ? undefined : (role ?? 'img')}
      aria-label={decorative ? undefined : (ariaLabel ?? label)}
      aria-hidden={decorative ? true : ariaHidden}
      className={cn('grid size-8 place-items-center border', logoToneClasses[tone], className)}
    >
      <VewaveLogoGlyph tone={tone} className="h-[72%] w-[92%]" />
    </span>
  )
}

function VewaveLogoGlyph({ className, tone }: { className?: string; tone: LogoTone }) {
  const colors = logoPathColors[tone]

  return (
    <svg
      viewBox="80 176 340 156"
      aria-hidden="true"
      focusable="false"
      className={cn('overflow-visible', className)}
    >
      <path fill={colors.base} d={logoPathData.base} />
      <path fill={colors.accent} d={logoPathData.accent} />
    </svg>
  )
}

export function getLogoColorsForTone(tone: LogoTone, tokens: ThemeTokens) {
  if (tone === 'mono') {
    return {
      base: tokens.foreground,
      accent: tokens.foreground,
    }
  }

  if (tone === 'light') {
    return {
      base: tokens.logoLight,
      accent: tokens.logoAccent,
    }
  }

  return {
    base: tokens.logoDark,
    accent: tokens.logoAccent,
  }
}

export function getVewaveLogoFaviconHref({
  logoStrategy,
  resolvedMode,
  surfaceColor,
  tokens,
}: {
  logoStrategy: LogoStrategy
  resolvedMode: ResolvedAppearanceMode
  surfaceColor?: string
  tokens: ThemeTokens
}) {
  const tone = resolveLogoTone(logoStrategy, surfaceColor ?? tokens.background, resolvedMode)

  return createVewaveLogoSvgDataUrl(getLogoColorsForTone(tone, tokens))
}

export function createVewaveLogoSvgDataUrl(colors: { accent: string; base: string }) {
  return `data:image/svg+xml,${encodeURIComponent(createVewaveLogoSvg(colors))}`
}

function createVewaveLogoSvg({ accent, base }: { accent: string; base: string }) {
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="80 176 340 156">',
    `<path fill="${base}" d="${logoPathData.base}"/>`,
    `<path fill="${accent}" d="${logoPathData.accent}"/>`,
    '</svg>',
  ].join('')
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
