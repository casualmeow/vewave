import * as TabsPrimitive from '@radix-ui/react-tabs'
import { motion } from 'motion/react'
import { tabsListVariants } from '../constants'
import { useTabsContext } from '../hooks'
import { TabsSurfaceEffects } from './tabs-surface-effects'
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import type { TabsListProps } from '../types'
import { getPointerProgress, useFluidTransform, useRafCssVariables } from '@/components/glass'
import { cn } from '@/shared/lib/utils'

type TabsListStyle = CSSProperties & Record<`--${string}`, string | number>

export function TabsList({ ref, className, style, children, ...props }: TabsListProps) {
  const { design, size, orientation, fullWidth, interactiveGlass, fluidConfig, filterIds } =
    useTabsContext()
  const setCssVariables = useRafCssVariables()
  const canFluid = interactiveGlass && design !== 'solid'
  const { fluidTransformStyle, updateFluidTransform, resetFluidTransform } = useFluidTransform({
    enabled: canFluid,
    magneticStrength: 0,
    magneticVerticalStrength: 0,
    tiltStrength: Math.min(2.2, fluidConfig.tiltStrength),
    perspective: 1100,
    tiltSpring: { stiffness: 180, damping: 28, mass: 0.72 },
  })

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    props.onPointerMove?.(event)

    if (!canFluid) return

    const progress = getPointerProgress({
      clientX: event.clientX,
      clientY: event.clientY,
      rect: event.currentTarget.getBoundingClientRect(),
    })

    setCssVariables(event.currentTarget, {
      '--tabs-pointer-x': `${progress.localX}px`,
      '--tabs-pointer-y': `${progress.localY}px`,
      '--tabs-sheen-x': `${progress.percentX}%`,
      '--tabs-sheen-y': `${progress.percentY}%`,
      '--tabs-spot-opacity': design === 'telegramGlass' ? '0.58' : '0.72',
    })

    updateFluidTransform(progress.normalizedX, progress.normalizedY)
  }

  const handlePointerLeave = (event: ReactPointerEvent<HTMLDivElement>) => {
    props.onPointerLeave?.(event)

    if (!canFluid) return

    setCssVariables(event.currentTarget, {
      '--tabs-pointer-x': '50%',
      '--tabs-pointer-y': '12%',
      '--tabs-sheen-x': '18%',
      '--tabs-sheen-y': '10%',
      '--tabs-spot-opacity': design === 'telegramGlass' ? '0.16' : '0.22',
    })
    resetFluidTransform()
  }

  const listStyle = {
    ...style,
    '--tabs-pointer-x': '50%',
    '--tabs-pointer-y': '12%',
    '--tabs-sheen-x': '18%',
    '--tabs-sheen-y': '10%',
    '--tabs-spot-opacity': design === 'telegramGlass' ? 0.16 : 0.22,
  } satisfies TabsListStyle

  const { onPointerMove: _onPointerMove, onPointerLeave: _onPointerLeave, ...listProps } = props

  return (
    <motion.div
      data-slot="liquid-tabs-list-shell"
      className={cn('relative inline-flex min-w-0', fullWidth && 'w-full')}
      style={fluidTransformStyle}
    >
      <TabsPrimitive.List
        ref={ref}
        data-slot="liquid-tabs-list"
        className={cn(tabsListVariants({ design, size, orientation, fullWidth }), className)}
        style={listStyle}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        {...listProps}
      >
        <TabsSurfaceEffects design={design} filterIds={filterIds} />
        {children}
      </TabsPrimitive.List>
    </motion.div>
  )
}
