import { motion } from 'motion/react'

import { componentDocs } from '../content/component-docs-content'
import { ComponentDocPage } from './component-doc-page'
import { GLASS_FLUID_PRESETS } from '@/components/glass'
import { cn } from '@/shared/lib/utils'

const presetOrder = ['subtle', 'balanced', 'expressive', 'extreme'] as const

export function GlassDocsPage() {
  return <ComponentDocPage doc={componentDocs.glass} showcase={<GlassPresetShowcase />} />
}

function GlassPresetShowcase() {
  return (
    <div className="relative overflow-hidden rounded-lg bg-[radial-gradient(circle_at_18%_12%,color-mix(in_srgb,var(--primary)_24%,transparent),transparent_30%),linear-gradient(135deg,var(--card),var(--muted)_45%,var(--accent))] p-5">
      <div className="grid gap-3 md:grid-cols-4">
        {presetOrder.map((preset) => {
          const config = GLASS_FLUID_PRESETS[preset]

          return (
            <motion.div
              key={preset}
              whileHover={{ scale: config.hoverScale, y: -config.hoverSize / 3 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              className={cn(
                'relative isolate overflow-hidden rounded-2xl border border-border/60 bg-card/45 p-4 shadow-[0_18px_50px_color-mix(in_srgb,var(--foreground)_12%,transparent)] backdrop-blur-xl',
                preset === 'extreme' && 'bg-card/55',
              )}
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,color-mix(in_srgb,var(--card)_92%,transparent),transparent_34%),linear-gradient(135deg,color-mix(in_srgb,var(--card)_55%,transparent),color-mix(in_srgb,var(--primary)_22%,transparent))]"
              />
              <h3 className="text-sm font-semibold capitalize text-foreground">{preset}</h3>
              <dl className="mt-3 grid gap-2 text-xs text-muted-foreground">
                <div className="flex justify-between gap-3">
                  <dt>hoverScale</dt>
                  <dd className="font-mono text-foreground">{config.hoverScale}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>hoverSize</dt>
                  <dd className="font-mono text-foreground">{config.hoverSize}px</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>dragMode</dt>
                  <dd className="font-mono text-foreground">{config.dragMode}</dd>
                </div>
              </dl>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
