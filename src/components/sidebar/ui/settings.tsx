import { Bell, Bot, Home, Settings, User } from 'lucide-react'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'
import { useId, useState } from 'react'
import { SIDEBAR_FLUID_TRANSITION, SIDEBAR_MAGNETIC_TRANSITION } from '../constants'
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
  tab,
  onFocusTab,
  onReleaseFocus,
  onSelect,
}: {
  active: boolean
  focused: boolean
  deemphasized: boolean
  layoutId: string
  tab: (typeof tabs)[number]
  onFocusTab: () => void
  onReleaseFocus: () => void
  onSelect: () => void
}) {
  const prefersReducedMotion = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const tiltX = useMotionValue(0)
  const tiltY = useMotionValue(0)
  const springX = useSpring(x, SIDEBAR_MAGNETIC_TRANSITION)
  const springY = useSpring(y, SIDEBAR_MAGNETIC_TRANSITION)
  const rotateX = useTransform(
    useSpring(tiltY, SIDEBAR_MAGNETIC_TRANSITION),
    [-1, 1],
    ['4.8deg', '-4.8deg'],
  )
  const rotateY = useTransform(
    useSpring(tiltX, SIDEBAR_MAGNETIC_TRANSITION),
    [-1, 1],
    ['-5.2deg', '5.2deg'],
  )
  const Icon = tab.icon

  const reset = () => {
    x.set(0)
    y.set(0)
    tiltX.set(0)
    tiltY.set(0)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (prefersReducedMotion) return

    const rect = event.currentTarget.getBoundingClientRect()
    const localX = event.clientX - rect.left
    const localY = event.clientY - rect.top
    const normalizedX = (localX / rect.width - 0.5) * 2
    const normalizedY = (localY / rect.height - 0.5) * 2

    event.currentTarget.style.setProperty(
      '--tab-pointer-x',
      `${Math.max(0, Math.min(100, (localX / rect.width) * 100))}%`,
    )
    event.currentTarget.style.setProperty(
      '--tab-pointer-y',
      `${Math.max(0, Math.min(100, (localY / rect.height) * 100))}%`,
    )

    x.set(normalizedX * 16)
    y.set(normalizedY * 9)
    tiltX.set(normalizedX)
    tiltY.set(normalizedY)
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
        'focus-visible:ring-2 focus-visible:ring-teal-300/60',
        active ? 'text-zinc-950' : 'text-zinc-600 hover:text-zinc-950',
      )}
      style={
        prefersReducedMotion
          ? undefined
          : {
              x: springX,
              y: springY,
              rotateX,
              rotateY,
              transformPerspective: 700,
            }
      }
      animate={
        prefersReducedMotion
          ? undefined
          : {
              filter: deemphasized ? 'blur(4px) saturate(0.72)' : 'blur(0px) saturate(1)',
              opacity: deemphasized ? 0.4 : 1,
            }
      }
      drag={!prefersReducedMotion}
      dragConstraints={{ left: -15, right: 15, top: -10, bottom: 10 }}
      dragElastic={0.42}
      dragMomentum={false}
      dragSnapToOrigin
      whileHover={prefersReducedMotion ? undefined : { scale: active ? 1.055 : 1.09 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.94 }}
      whileDrag={prefersReducedMotion ? undefined : { scale: 1.16, zIndex: 30 }}
      transition={SIDEBAR_FLUID_TRANSITION}
      onPointerEnter={onFocusTab}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        reset()
        onReleaseFocus()
      }}
      onFocus={onFocusTab}
      onBlur={onReleaseFocus}
      onClick={onSelect}
    >
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute rounded-[1.6rem] border border-white/0 bg-[radial-gradient(circle_at_var(--tab-pointer-x)_var(--tab-pointer-y),rgba(255,255,255,0.76),rgba(255,255,255,0.14)_42%,transparent_64%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.58)] backdrop-blur-sm"
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
          className="pointer-events-none absolute overflow-hidden rounded-2xl border border-white/65 bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(255,255,255,0.30),rgba(153,246,228,0.40))] shadow-[0_16px_36px_rgba(15,118,110,0.18),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl"
          animate={{
            top: focused ? -10 : 0,
            right: focused ? -10 : 0,
            bottom: focused ? -10 : 0,
            left: focused ? -10 : 0,
          }}
          transition={SIDEBAR_FLUID_TRANSITION}
        >
          <span className="absolute inset-0 [filter:url(#vewave-sidebar-goo-strong)]">
            <motion.span
              className="absolute -left-5 top-1/2 size-16 -translate-y-1/2 rounded-full bg-teal-100/40"
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
              className="absolute left-[var(--tab-pointer-x)] top-[var(--tab-pointer-y)] size-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/48"
              animate={prefersReducedMotion ? undefined : { scale: [0.72, 1.34, 0.9] }}
              transition={
                prefersReducedMotion
                  ? undefined
                  : { duration: 0.95, repeat: Infinity, ease: 'easeInOut' }
              }
            />
            <motion.span
              className="absolute -right-5 bottom-0 size-16 rounded-full bg-sky-100/34"
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
  const layoutId = `${useId().replace(/[^a-zA-Z0-9_-]/g, '')}-settings-fluid-tab`
  const selectedTab = tabs.find((tab) => tab.value === activeTab) ?? tabs[0]
  const effectiveFocusedTab = focusedTab ?? activeTab
  const Icon = selectedTab.icon

  return (
    <div className="flex w-full flex-col gap-4 md:flex-row md:items-start">
      <div
        role="tablist"
        aria-label="Studio settings sections"
        className="grid h-auto shrink-0 grid-cols-1 gap-1 rounded-3xl border border-white/45 bg-white/30 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] backdrop-blur-2xl md:min-w-44"
        onPointerLeave={() => setFocusedTab(null)}
      >
        {tabs.map((tab) => (
          <FluidSettingsTab
            key={tab.value}
            active={activeTab === tab.value}
            focused={effectiveFocusedTab === tab.value}
            deemphasized={Boolean(effectiveFocusedTab && effectiveFocusedTab !== tab.value)}
            layoutId={layoutId}
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
        className="min-h-64 w-full overflow-hidden rounded-3xl border border-white/45 bg-white/62 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.12),inset_0_1px_0_rgba(255,255,255,0.86)] backdrop-blur-2xl"
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={SIDEBAR_FLUID_TRANSITION}
      >
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-zinc-950 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
            <Icon className="size-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-950">{selectedTab.name}</h3>
            <p className="text-sm text-zinc-600">{selectedTab.description}</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
