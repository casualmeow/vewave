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
    <div className="relative overflow-hidden rounded-lg bg-[radial-gradient(circle_at_18%_12%,rgba(45,212,191,0.24),transparent_30%),linear-gradient(135deg,#eefcf8,#f8fbff_45%,#eef2ff)] p-5">
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
                'relative isolate overflow-hidden rounded-2xl border border-white/60 bg-white/40 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.12)] backdrop-blur-xl',
                preset === 'extreme' && 'bg-white/48',
              )}
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.92),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.55),rgba(153,246,228,0.22))]"
              />
              <h3 className="text-sm font-semibold capitalize text-zinc-950">{preset}</h3>
              <dl className="mt-3 grid gap-2 text-xs text-zinc-600">
                <div className="flex justify-between gap-3">
                  <dt>hoverScale</dt>
                  <dd className="font-mono text-zinc-950">{config.hoverScale}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>hoverSize</dt>
                  <dd className="font-mono text-zinc-950">{config.hoverSize}px</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>dragMode</dt>
                  <dd className="font-mono text-zinc-950">{config.dragMode}</dd>
                </div>
              </dl>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
