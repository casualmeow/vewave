import type {
  ResizableCardAnimationFamily,
  ResizableCardAnimationPresetDefinition,
  ResizableCardPresenceConfig,
  ResizableCardPresetRecommendation,
  ResizableCardSharedLayoutConfig,
} from './types'
import type { Transition } from 'motion/react'

const allSharedLayout: ResizableCardSharedLayoutConfig = {
  card: true,
  media: true,
  title: true,
  description: true,
  action: true,
}

const noSharedLayout: ResizableCardSharedLayoutConfig = {
  card: false,
  media: false,
  title: false,
  description: false,
  action: false,
}

const containerOnlyLayout: ResizableCardSharedLayoutConfig = {
  card: true,
  media: false,
  title: false,
  description: false,
  action: false,
}

const mediaContinuityLayout: ResizableCardSharedLayoutConfig = {
  card: true,
  media: true,
  title: false,
  description: false,
  action: false,
}

const textContinuityLayout: ResizableCardSharedLayoutConfig = {
  card: true,
  media: false,
  title: true,
  description: true,
  action: false,
}

const contentContinuityLayout: ResizableCardSharedLayoutConfig = {
  card: true,
  media: true,
  title: true,
  description: true,
  action: false,
}

const instantTransition: Transition = { duration: 0 }
const fadeFast: Transition = { duration: 0.14, ease: 'easeOut' }
const fadeStandard: Transition = { duration: 0.2, ease: 'easeOut' }
const fadeSlow: Transition = { duration: 0.28, ease: 'easeInOut' }
const standardSpring: Transition = { type: 'spring', stiffness: 260, damping: 28, mass: 0.8 }
const softSpring: Transition = { type: 'spring', stiffness: 180, damping: 32, mass: 0.9 }
const mediaSpring: Transition = { type: 'spring', stiffness: 210, damping: 30, mass: 0.86 }
const popSpring: Transition = { type: 'spring', stiffness: 360, damping: 24, mass: 0.72 }
const elasticSpring: Transition = { type: 'spring', stiffness: 240, damping: 17, mass: 0.8 }
const gentleTween: Transition = { duration: 0.26, ease: [0.22, 1, 0.36, 1] }

const basePresence: Record<
  'dialog' | 'backdrop' | 'action' | 'content',
  ResizableCardPresenceConfig
> = {
  dialog: {
    initial: { opacity: 1 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  backdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  action: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 8 },
  },
  content: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 12 },
  },
}

type PresetInput = {
  id: ResizableCardAnimationPresetDefinition['id']
  label: string
  family: ResizableCardAnimationFamily
  description: string
  recommendedPresentation: ResizableCardPresetRecommendation
  sharedLayout: ResizableCardSharedLayoutConfig
  container: Transition
  backdrop?: Transition
  media?: Transition
  text?: Transition
  action?: Transition
  content?: Transition
  presence?: Partial<typeof basePresence>
  layout?: Partial<ResizableCardAnimationPresetDefinition['layout']>
  backdropClassName?: string
  dialogClassName?: string
  contentClassName?: string
}

function definePreset({
  id,
  label,
  family,
  description,
  recommendedPresentation,
  sharedLayout,
  container,
  backdrop = fadeStandard,
  media = container,
  text = softSpring,
  action = fadeStandard,
  content = fadeStandard,
  presence,
  layout,
  backdropClassName,
  dialogClassName,
  contentClassName,
}: PresetInput): ResizableCardAnimationPresetDefinition {
  return {
    id,
    label,
    family,
    description,
    recommendedPresentation,
    sharedLayout,
    container,
    backdrop,
    media,
    text,
    action,
    content,
    presence: {
      dialog: { ...basePresence.dialog, ...presence?.dialog },
      backdrop: { ...basePresence.backdrop, ...presence?.backdrop },
      action: { ...basePresence.action, ...presence?.action },
      content: { ...basePresence.content, ...presence?.content },
    },
    layout: {
      action: true,
      content: true,
      ...layout,
    },
    backdropClassName,
    dialogClassName,
    contentClassName,
  }
}

export const RESIZABLE_CARD_ANIMATION_PRESET_DEFINITIONS = [
  definePreset({
    id: 'container-morph',
    label: 'Container Morph',
    family: 'morph',
    description: 'Classic shared card-to-dialog transform with all stable visual anchors linked.',
    recommendedPresentation: 'media',
    sharedLayout: allSharedLayout,
    container: standardSpring,
    media: mediaSpring,
  }),
  definePreset({
    id: 'soft-container-morph',
    label: 'Soft Container Morph',
    family: 'morph',
    description: 'A calmer container transform that keeps continuity while reducing hard scaling.',
    recommendedPresentation: 'both',
    sharedLayout: contentContinuityLayout,
    container: softSpring,
    media: softSpring,
  }),
  definePreset({
    id: 'media-led-morph',
    label: 'Media-led Morph',
    family: 'morph',
    description:
      'Lets the image establish continuity first while text and details reveal after it.',
    recommendedPresentation: 'media',
    sharedLayout: mediaContinuityLayout,
    container: softSpring,
    media: { type: 'spring', stiffness: 250, damping: 29, mass: 0.75 },
    text: fadeFast,
    presence: {
      action: { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } },
      content: { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 } },
    },
  }),
  definePreset({
    id: 'content-led-morph',
    label: 'Content-led Morph',
    family: 'morph',
    description: 'Keeps title and description stable while the container expands more quietly.',
    recommendedPresentation: 'inline',
    sharedLayout: textContinuityLayout,
    container: { type: 'spring', stiffness: 170, damping: 34, mass: 1 },
    text: { type: 'spring', stiffness: 280, damping: 30, mass: 0.7 },
    media: fadeFast,
  }),
  definePreset({
    id: 'shape-shift',
    label: 'Shape Shift',
    family: 'morph',
    description: 'Emphasizes the surface changing shape while inner content crossfades safely.',
    recommendedPresentation: 'both',
    sharedLayout: containerOnlyLayout,
    container: { type: 'spring', stiffness: 220, damping: 26, mass: 0.85 },
    media: fadeStandard,
    text: fadeStandard,
    dialogClassName: 'shadow-2xl ring-1 ring-black/5',
  }),
  definePreset({
    id: 'elevation-lift',
    label: 'Elevation Lift',
    family: 'morph',
    description: 'A container transform with stronger elevation and a focused backdrop.',
    recommendedPresentation: 'both',
    sharedLayout: contentContinuityLayout,
    container: { type: 'spring', stiffness: 230, damping: 27, mass: 0.8 },
    backdrop: { duration: 0.22, ease: 'easeOut' },
    backdropClassName: 'bg-black/45 backdrop-blur-sm',
    dialogClassName: 'shadow-[0_32px_100px_rgba(15,23,42,0.32)]',
  }),
  definePreset({
    id: 'slide-up-expand',
    label: 'Slide Up Expand',
    family: 'axis',
    description: 'Fades the dialog upward into place for cards lower on the page.',
    recommendedPresentation: 'inline',
    sharedLayout: containerOnlyLayout,
    container: gentleTween,
    presence: {
      dialog: {
        initial: { opacity: 0, y: 44, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 28, scale: 0.99 },
      },
    },
  }),
  definePreset({
    id: 'slide-down-expand',
    label: 'Slide Down Expand',
    family: 'axis',
    description: 'Drops the expanded surface into place for cards near the top of a layout.',
    recommendedPresentation: 'inline',
    sharedLayout: containerOnlyLayout,
    container: gentleTween,
    presence: {
      dialog: {
        initial: { opacity: 0, y: -44, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -28, scale: 0.99 },
      },
    },
  }),
  definePreset({
    id: 'slide-left-expand',
    label: 'Slide Left Expand',
    family: 'axis',
    description: 'Uses a leftward spatial handoff with low shared geometry coupling.',
    recommendedPresentation: 'inline',
    sharedLayout: containerOnlyLayout,
    container: gentleTween,
    presence: {
      dialog: {
        initial: { opacity: 0, x: 56, scale: 0.98 },
        animate: { opacity: 1, x: 0, scale: 1 },
        exit: { opacity: 0, x: 32, scale: 0.99 },
      },
    },
  }),
  definePreset({
    id: 'slide-right-expand',
    label: 'Slide Right Expand',
    family: 'axis',
    description: 'Uses a rightward spatial handoff with low shared geometry coupling.',
    recommendedPresentation: 'inline',
    sharedLayout: containerOnlyLayout,
    container: gentleTween,
    presence: {
      dialog: {
        initial: { opacity: 0, x: -56, scale: 0.98 },
        animate: { opacity: 1, x: 0, scale: 1 },
        exit: { opacity: 0, x: -32, scale: 0.99 },
      },
    },
  }),
  definePreset({
    id: 'shared-axis-x',
    label: 'Shared Axis X',
    family: 'axis',
    description: 'Panel-like horizontal continuity inspired by shared-axis spatial transitions.',
    recommendedPresentation: 'inline',
    sharedLayout: noSharedLayout,
    container: { duration: 0.24, ease: [0.2, 0, 0, 1] },
    presence: {
      dialog: {
        initial: { opacity: 0, x: 40 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -24 },
      },
      content: {
        initial: { opacity: 0, x: 18 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -12 },
      },
    },
    layout: { action: false, content: false },
  }),
  definePreset({
    id: 'shared-axis-y',
    label: 'Shared Axis Y',
    family: 'axis',
    description: 'Panel-like vertical continuity inspired by shared-axis spatial transitions.',
    recommendedPresentation: 'inline',
    sharedLayout: noSharedLayout,
    container: { duration: 0.24, ease: [0.2, 0, 0, 1] },
    presence: {
      dialog: {
        initial: { opacity: 0, y: 36 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -22 },
      },
      content: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
      },
    },
    layout: { action: false, content: false },
  }),
  definePreset({
    id: 'fade-scale',
    label: 'Fade Scale',
    family: 'fade',
    description: 'A safe non-morph dialog entrance that avoids geometry stretching.',
    recommendedPresentation: 'inline',
    sharedLayout: noSharedLayout,
    container: gentleTween,
    presence: {
      dialog: {
        initial: { opacity: 0, scale: 0.96, y: 12 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.98, y: 8 },
      },
      action: {
        initial: { opacity: 0, y: 4 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 4 },
      },
      content: {
        initial: { opacity: 0, y: 6 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 6 },
      },
    },
    layout: { action: false, content: false },
  }),
  definePreset({
    id: 'container-fade',
    label: 'Container Fade',
    family: 'fade',
    description: 'A pure fade for structurally incompatible compact and expanded layouts.',
    recommendedPresentation: 'inline',
    sharedLayout: noSharedLayout,
    container: fadeStandard,
    presence: {
      dialog: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      },
    },
    layout: { action: false, content: false },
  }),
  definePreset({
    id: 'crossfade-details',
    label: 'Crossfade Details',
    family: 'fade',
    description:
      'Preserves a calm surface while action and content crossfade as independent layers.',
    recommendedPresentation: 'both',
    sharedLayout: containerOnlyLayout,
    container: fadeSlow,
    media: fadeStandard,
    text: fadeFast,
    presence: {
      action: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
      content: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
    },
    layout: { action: false, content: false },
  }),
  definePreset({
    id: 'fade-through',
    label: 'Fade Through',
    family: 'fade',
    description: 'Separates outgoing compact recognition from incoming expanded content reveal.',
    recommendedPresentation: 'inline',
    sharedLayout: noSharedLayout,
    container: { duration: 0.18, ease: 'easeOut' },
    content: { duration: 0.22, delay: 0.08, ease: 'easeOut' },
    action: { duration: 0.2, delay: 0.06, ease: 'easeOut' },
    presence: {
      dialog: {
        initial: { opacity: 0, scale: 0.985 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.985 },
      },
      content: {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0 },
      },
    },
    layout: { action: false, content: false },
  }),
  definePreset({
    id: 'spring-pop',
    label: 'Spring Pop',
    family: 'expressive',
    description: 'A controlled pop with quick recognition and a crisp settle.',
    recommendedPresentation: 'media',
    sharedLayout: contentContinuityLayout,
    container: popSpring,
    media: popSpring,
    presence: {
      dialog: {
        initial: { opacity: 0, scale: 0.94 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.97 },
      },
    },
  }),
  definePreset({
    id: 'elastic-settle',
    label: 'Elastic Settle',
    family: 'expressive',
    description: 'A stronger rebound for media-heavy cards that still keeps content staged.',
    recommendedPresentation: 'media',
    sharedLayout: mediaContinuityLayout,
    container: elasticSpring,
    media: elasticSpring,
    text: fadeStandard,
  }),
  definePreset({
    id: 'squash-lift',
    label: 'Squash Lift',
    family: 'expressive',
    description: 'Subtle anticipation: the surface compresses before lifting into the dialog.',
    recommendedPresentation: 'inline',
    sharedLayout: containerOnlyLayout,
    container: { type: 'spring', stiffness: 280, damping: 25, mass: 0.75 },
    presence: {
      dialog: {
        initial: { opacity: 0, scaleX: 1.02, scaleY: 0.94, y: 18 },
        animate: { opacity: 1, scaleX: 1, scaleY: 1, y: 0 },
        exit: { opacity: 0, scaleX: 1.01, scaleY: 0.96, y: 10 },
      },
    },
  }),
  definePreset({
    id: 'overshoot-settle',
    label: 'Overshoot Settle',
    family: 'expressive',
    description: 'Expands with a deliberate overshoot before settling into final focus.',
    recommendedPresentation: 'media',
    sharedLayout: contentContinuityLayout,
    container: { type: 'spring', stiffness: 230, damping: 20, mass: 0.78 },
    media: { type: 'spring', stiffness: 240, damping: 22, mass: 0.78 },
  }),
  definePreset({
    id: 'tilt-unfold',
    label: 'Tilt Unfold',
    family: 'expressive',
    description: 'A light perspective unfold that avoids a full 3D flip.',
    recommendedPresentation: 'inline',
    sharedLayout: containerOnlyLayout,
    container: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
    presence: {
      dialog: {
        initial: { opacity: 0, rotateX: -8, y: 18, transformPerspective: 1200 },
        animate: { opacity: 1, rotateX: 0, y: 0, transformPerspective: 1200 },
        exit: { opacity: 0, rotateX: -5, y: 10, transformPerspective: 1200 },
      },
    },
  }),
  definePreset({
    id: 'flip-lite',
    label: 'Flip Lite',
    family: 'expressive',
    description: 'A restrained plane flip reference for compact cards with stable media.',
    recommendedPresentation: 'media',
    sharedLayout: mediaContinuityLayout,
    container: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
    presence: {
      dialog: {
        initial: { opacity: 0, rotateY: -7, scale: 0.98, transformPerspective: 1200 },
        animate: { opacity: 1, rotateY: 0, scale: 1, transformPerspective: 1200 },
        exit: { opacity: 0, rotateY: 5, scale: 0.98, transformPerspective: 1200 },
      },
    },
  }),
  definePreset({
    id: 'media-spotlight',
    label: 'Media Spotlight',
    family: 'content',
    description:
      'Uses media continuity and a stronger backdrop to make the image feel intentional.',
    recommendedPresentation: 'media',
    sharedLayout: mediaContinuityLayout,
    container: softSpring,
    media: { type: 'spring', stiffness: 260, damping: 26, mass: 0.8 },
    backdrop: { duration: 0.24, ease: 'easeOut' },
    backdropClassName: 'bg-black/55 backdrop-blur-md',
    dialogClassName: 'shadow-[0_34px_120px_rgba(0,0,0,0.38)]',
  }),
  definePreset({
    id: 'blur-reveal',
    label: 'Blur Reveal',
    family: 'content',
    description: 'Avoids heavy morphing and brings details from soft blur into crisp focus.',
    recommendedPresentation: 'both',
    sharedLayout: containerOnlyLayout,
    container: gentleTween,
    content: { duration: 0.26, ease: 'easeOut' },
    action: { duration: 0.22, ease: 'easeOut' },
    presence: {
      dialog: {
        initial: { opacity: 0, scale: 0.98, filter: 'blur(8px)' },
        animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
        exit: { opacity: 0, scale: 0.99, filter: 'blur(6px)' },
      },
      content: {
        initial: { opacity: 0, y: 10, filter: 'blur(6px)' },
        animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
        exit: { opacity: 0, filter: 'blur(4px)' },
      },
    },
  }),
  definePreset({
    id: 'shimmer-handoff',
    label: 'Shimmer Handoff',
    family: 'content',
    description: 'A polished handoff with a brighter surface and delayed detail reveal.',
    recommendedPresentation: 'media',
    sharedLayout: contentContinuityLayout,
    container: softSpring,
    action: { duration: 0.18, delay: 0.06, ease: 'easeOut' },
    content: { duration: 0.24, delay: 0.1, ease: 'easeOut' },
    dialogClassName:
      'before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:z-10 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/70 before:to-transparent',
  }),
  definePreset({
    id: 'staggered-details',
    label: 'Staggered Details',
    family: 'content',
    description: 'Container and media move first, then action and content settle in sequence.',
    recommendedPresentation: 'media',
    sharedLayout: contentContinuityLayout,
    container: softSpring,
    media: mediaSpring,
    action: { duration: 0.18, delay: 0.08, ease: 'easeOut' },
    content: { duration: 0.22, delay: 0.14, ease: 'easeOut' },
    presence: {
      action: {
        initial: { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 8 },
      },
      content: {
        initial: { opacity: 0, y: 18 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 10 },
      },
    },
  }),
  definePreset({
    id: 'instant',
    label: 'Instant',
    family: 'fade',
    description: 'Near-zero motion for debugging and reduced-motion environments.',
    recommendedPresentation: 'both',
    sharedLayout: noSharedLayout,
    container: instantTransition,
    backdrop: instantTransition,
    media: instantTransition,
    text: instantTransition,
    action: instantTransition,
    content: instantTransition,
    presence: {
      dialog: {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      },
      action: {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      },
      content: {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      },
    },
    layout: { action: false, content: false },
  }),
] as const

export const RESIZABLE_CARD_ANIMATION_PRESETS = RESIZABLE_CARD_ANIMATION_PRESET_DEFINITIONS.map(
  (preset) => preset.id,
)

export const RESIZABLE_CARD_ANIMATION_PRESET_MAP = new Map(
  RESIZABLE_CARD_ANIMATION_PRESET_DEFINITIONS.map((preset) => [preset.id, preset]),
)
