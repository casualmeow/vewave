import type { HeaderPlaygroundState } from '../types'

export const presets: Array<{
  name: string
  description: string
  state: Partial<HeaderPlaygroundState>
}> = [
  {
    name: 'Landing Glass',
    description: 'Large glass shell with scroll collapse and glow.',
    state: {
      variant: 'glassDark',
      size: 'lg',
      blurIntensity: 'xl',
      showGlow: true,
      glowColor: '#2dd4bf',
      initialWidth: 92,
      collapsedWidth: 58,
      topOffset: 16,
      collapseBehavior: 'scroll',
      hideOnScrollDown: true,
      hideNavOnCollapse: true,
      motionPreset: 'spring',
      smoothScrollMotion: true,
      primaryActionVariant: 'default',
    },
  },
  {
    name: 'Compact Dark',
    description: 'Manual compact header for dense product surfaces.',
    state: {
      variant: 'glassDark',
      size: 'sm',
      blurIntensity: 'lg',
      showGlow: false,
      initialWidth: 78,
      collapsedWidth: 46,
      topOffset: 10,
      collapseBehavior: 'manual',
      collapsed: true,
      hideOnScrollDown: false,
      hideNavOnCollapse: true,
      primaryActionVariant: 'soft',
    },
  },
  {
    name: 'Glow Promo',
    description: 'Expressive glow variant with bouncy motion.',
    state: {
      variant: 'glow',
      size: 'lg',
      blurIntensity: 'xl',
      showGlow: true,
      glowColor: '#a3e635',
      initialWidth: 94,
      collapsedWidth: 64,
      topOffset: 20,
      collapseBehavior: 'scroll',
      hideOnScrollDown: false,
      motionPreset: 'bouncy',
      primaryActionVariant: 'soft',
    },
  },
  {
    name: 'No Collapse',
    description: 'Stable solid header for non-scroll-reactive layouts.',
    state: {
      variant: 'solid',
      size: 'md',
      blurIntensity: 'none',
      showGlow: false,
      initialWidth: 90,
      collapsedWidth: 90,
      topOffset: 12,
      collapseBehavior: 'none',
      collapsed: false,
      hideNavOnCollapse: false,
      hideOnScrollDown: false,
      motionPreset: 'smooth',
      primaryActionVariant: 'outline',
    },
  },
]
