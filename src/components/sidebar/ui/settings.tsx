import { Bell, Bot, Home, Settings, User } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useId, useState } from 'react'
import { SIDEBAR_FLUID_TRANSITION } from '../constants'
import { useFinePointer, useFluidTransform, useRafCssVariables } from '../hooks'
import { getPointerProgress } from '../helpers'
import type { PointerEvent as ReactPointerEvent } from 'react'

import { cn } from '@/shared/lib/utils'

const tabs = [
  {
    name: 'Home',
    value: 'home',
    icon: Home,
    description: 'Studio defaults and quick-access settings.',
  },
  {
    name: 'Profile',
    value: 'profile',
    icon: User,
    description: 'Channel identity, avatar, and public profile details.',
  },
  {
    name: 'Messages',
    value: 'messages',
    icon: Bot,
    description: 'Automation, moderation, and comment assistant settings.',
  },
  {
    name: 'Alerts',
    value: 'alerts',
    icon: Bell,
    description: 'Notifications for rooms, uploads, and community activity.',
  },
  {
    name: 'Settings',
    value: 'settings',
    icon: Settings,
    description: 'Advanced studio preferences and account controls.',
  },
]

function FluidSettingsTab({
  active,
  focused,
  deemphasized,
  layoutId,
  gooFilterId,
  tab,
  onFocusTab,
  onReleaseFocus,
  onSelect,
}: {
  active: boolean
  focused: boolean
  deemphasized: boolean
  layoutId: string
  gooFilterId: string
  tab: (typeof tabs)[number]
  onFocusTab: () => void
  onReleaseFocus: () => void
  onSelect: () => void
}) {
  const prefersReducedMotion = useReducedMotion()
  const finePointer = useFinePointer()
  const canUsePointerMotion = !prefersReducedMotion && finePointer
  const setCssVariables = useRafCssVariables()
  const { fluidTransformStyle, updateFluidTransform, resetFluidTransform } = useFluidTransform({
    enabled: canUsePointerMotion,
    magneticStrength: 16,
    magneticVerticalStrength: 9,
    tiltStrength: 5.2,
    perspective: 700,
  })
  const Icon = tab.icon

  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!canUsePointerMotion) return

    const progress = getPointerProgress({
      clientX: event.clientX,
      clientY: event.clientY,
      rect: event.currentTarget.getBoundingClientRect(),
    })

    setCssVariables(event.currentTarget, {
      '--tab-pointer-x': `${progress.percentX}%`,
      '--tab-pointer-y': `${progress.percentY}%`,
    })

    updateFluidTransform(progress.normalizedX, progress.normalizedY)
  }

  return (
    <motion.button
      type="button"
      role="tab"
      aria-selected={active}
      data-focused={focused ? 'true' : 'false'}
      data-deemphasized={deemphasized ? 'true' : 'false'}
      className={cn(
        'group relative isolate flex w-full items-center gap-2 overflow-hidden rounded-2xl px-3 py-2 text-left text-sm font-medium outline-none [--tab-pointer-x:50%] [--tab-pointer-y:50%]',
        'focus-visible:ring-2 focus-visible:ring-ring/50',
        active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
      )}
      style={!canUsePointerMotion ? undefined : fluidTransformStyle}
      animate={
        prefersReducedMotion
          ? undefined
          : {
              filter: deemphasized ? 'blur(4px) saturate(0.72)' : 'blur(0px) saturate(1)',
              opacity: deemphasized ? 0.4 : 1,
            }
      }
      drag={canUsePointerMotion}
      dragConstraints={{ left: -15, right: 15, top: -10, bottom: 10 }}
      dragElastic={0.42}
      dragMomentum={false}
      dragSnapToOrigin
      whileHover={canUsePointerMotion ? { scale: active ? 1.055 : 1.09 } : undefined}
      whileTap={canUsePointerMotion ? { scale: 0.94 } : undefined}
      whileDrag={canUsePointerMotion ? { scale: 1.16, zIndex: 30 } : undefined}
      transition={SIDEBAR_FLUID_TRANSITION}
      onPointerEnter={onFocusTab}
      onPointerMove={handlePointerMove}
      onPointerLeave={(event) => {
        setCssVariables(event.currentTarget, {
          '--tab-pointer-x': '50%',
          '--tab-pointer-y': '50%',
        })
        resetFluidTransform()
        onReleaseFocus()
      }}
      onFocus={onFocusTab}
      onBlur={onReleaseFocus}
      onClick={onSelect}
    >
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute rounded-[1.6rem] border border-transparent bg-[radial-gradient(circle_at_var(--tab-pointer-x)_var(--tab-pointer-y),var(--glass-highlight),color-mix(in_srgb,var(--glass-highlight)_34%,transparent)_42%,transparent_64%)] shadow-[inset_0_1px_0_var(--glass-highlight)] backdrop-blur-sm"
        initial={false}
        animate={{
          opacity: focused ? 0.76 : 0,
          top: focused ? -12 : 0,
          right: focused ? -12 : 0,
          bottom: focused ? -12 : 0,
          left: focused ? -12 : 0,
        }}
        transition={SIDEBAR_FLUID_TRANSITION}
      />
      {active ? (
        <motion.span
          layoutId={layoutId}
          className="pointer-events-none absolute overflow-hidden rounded-2xl border border-[color:var(--glass-border)] bg-[linear-gradient(135deg,var(--tabs-active),var(--glass-background),color-mix(in_srgb,var(--accent)_28%,transparent))] shadow-[0_16px_36px_color-mix(in_srgb,var(--accent)_18%,transparent),inset_0_1px_0_var(--glass-highlight)] backdrop-blur-xl"
          animate={{
            top: focused ? -10 : 0,
            right: focused ? -10 : 0,
            bottom: focused ? -10 : 0,
            left: focused ? -10 : 0,
          }}
          transition={SIDEBAR_FLUID_TRANSITION}
        >
          <span className="absolute inset-0" style={{ filter: `url(#${gooFilterId})` }}>
            <motion.span
              className="absolute -left-5 top-1/2 size-16 -translate-y-1/2 rounded-full bg-[color-mix(in_srgb,var(--accent)_32%,transparent)]"
              animate={
                prefersReducedMotion ? undefined : { x: [0, 10, -3, 0], scale: [1, 1.22, 0.94, 1] }
              }
              transition={
                prefersReducedMotion
                  ? undefined
                  : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
              }
            />
            <motion.span
              className="absolute left-[var(--tab-pointer-x)] top-[var(--tab-pointer-y)] size-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[color-mix(in_srgb,var(--glass-highlight)_48%,transparent)]"
              animate={prefersReducedMotion ? undefined : { scale: [0.72, 1.34, 0.9] }}
              transition={
                prefersReducedMotion
                  ? undefined
                  : { duration: 0.95, repeat: Infinity, ease: 'easeInOut' }
              }
            />
            <motion.span
              className="absolute -right-5 bottom-0 size-16 rounded-full bg-[color-mix(in_srgb,var(--primary)_30%,transparent)]"
              animate={
                prefersReducedMotion ? undefined : { x: [0, -8, 3, 0], scale: [1, 0.88, 1.16, 1] }
              }
              transition={
                prefersReducedMotion
                  ? undefined
                  : { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }
              }
            />
          </span>
        </motion.span>
      ) : null}
      <Icon className="relative z-10 size-4 shrink-0" />
      <span className="relative z-10">{tab.name}</span>
    </motion.button>
  )
}

export function SidebarSettingsDialog() {
  const [activeTab, setActiveTab] = useState(tabs[0].value)
  const [focusedTab, setFocusedTab] = useState<string | null>(null)
  const scopeId = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const layoutId = `${scopeId}-settings-fluid-tab`
  const gooFilterId = `${scopeId}-settings-goo`
  const selectedTab = tabs.find((tab) => tab.value === activeTab) ?? tabs[0]
  const effectiveFocusedTab = focusedTab ?? activeTab
  const Icon = selectedTab.icon

  return (
    <div className="flex w-full flex-col gap-4 md:flex-row md:items-start">
      <svg aria-hidden="true" className="pointer-events-none absolute size-0" focusable="false">
        <defs>
          <filter id={gooFilterId}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="11" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 28 -14"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div
        role="tablist"
        aria-label="Studio settings sections"
        className="grid h-auto shrink-0 grid-cols-1 gap-1 rounded-3xl border border-[color:var(--glass-border)] bg-[var(--glass-background)] p-1.5 shadow-[inset_0_1px_0_var(--glass-highlight)] backdrop-blur-2xl md:min-w-44"
        onPointerLeave={() => setFocusedTab(null)}
      >
        {tabs.map((tab) => (
          <FluidSettingsTab
            key={tab.value}
            active={activeTab === tab.value}
            focused={effectiveFocusedTab === tab.value}
            deemphasized={Boolean(effectiveFocusedTab && effectiveFocusedTab !== tab.value)}
            layoutId={layoutId}
            gooFilterId={gooFilterId}
            tab={tab}
            onFocusTab={() => setFocusedTab(tab.value)}
            onReleaseFocus={() => setFocusedTab(null)}
            onSelect={() => setActiveTab(tab.value)}
          />
        ))}
      </div>

      <motion.div
        key={selectedTab.value}
        role="tabpanel"
        className="min-h-64 w-full overflow-hidden rounded-3xl border border-[color:var(--glass-border)] bg-card p-5 shadow-[0_20px_60px_color-mix(in_srgb,var(--foreground)_12%,transparent),inset_0_1px_0_var(--glass-highlight)] backdrop-blur-2xl"
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={SIDEBAR_FLUID_TRANSITION}
      >
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[inset_0_1px_0_var(--glass-highlight)]">
            <Icon className="size-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{selectedTab.name}</h3>
            <p className="text-sm text-muted-foreground">{selectedTab.description}</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
