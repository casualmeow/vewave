import { AnimatePresence, motion } from 'motion/react'

type HeaderGlowProps = {
  showGlow: boolean
  prefersReducedMotion: boolean
}

export function HeaderGlow({ showGlow, prefersReducedMotion }: HeaderGlowProps) {
  return (
    <AnimatePresence initial={false}>
      {showGlow ? (
        <motion.span
          key="premium-header-glow"
          aria-hidden="true"
          className="pointer-events-none absolute -inset-0.5 -z-10"
          style={{
            borderRadius: 'inherit',
            background:
              'linear-gradient(135deg, var(--header-glow), transparent 48%, var(--header-glow))',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.68 }}
          exit={{ opacity: 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2 }}
        />
      ) : null}
    </AnimatePresence>
  )
}
