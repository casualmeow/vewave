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

export function definePreset({
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

export {
  allSharedLayout,
  noSharedLayout,
  containerOnlyLayout,
  mediaContinuityLayout,
  textContinuityLayout,
  contentContinuityLayout,
  instantTransition,
  fadeFast,
  fadeStandard,
  fadeSlow,
  standardSpring,
  softSpring,
  mediaSpring,
  popSpring,
  elasticSpring,
  gentleTween,
}
