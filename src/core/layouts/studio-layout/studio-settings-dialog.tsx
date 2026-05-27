import { Bot, Home, Settings, User } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'

const settingsTabs = [
  {
    name: 'Home',
    value: 'home',
    icon: Home,
  },
  {
    name: 'Profile',
    value: 'profile',
    icon: User,
  },
  {
    name: 'Messages',
    value: 'messages',
    icon: Bot,
  },
  {
    name: 'Settings',
    value: 'settings',
    icon: Settings,
  },
] as const

type SettingsTabValue = (typeof settingsTabs)[number]['value']

export function StudioSettingsDialog() {
  const [activeTab, setActiveTab] = useState<SettingsTabValue>(settingsTabs[0].value)
  const shouldReduceMotion = useReducedMotion()

  return (
    <Tabs
      orientation="vertical"
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as SettingsTabValue)}
      className="flex w-full flex-row items-start justify-center gap-4"
    >
      <TabsList className="grid min-w-36 shrink-0 grid-cols-1 gap-1 rounded-2xl border border-border/70 bg-muted/45 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
        {settingsTabs.map((tab) => {
          const active = tab.value === activeTab

          return (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="relative justify-start overflow-hidden rounded-xl border-0 bg-transparent px-3 py-2 text-muted-foreground shadow-none transition-colors data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              {active ? (
                <motion.span
                  layoutId="studio-settings-active-tab"
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 420, damping: 34, mass: 0.8 }
                  }
                  className="absolute inset-0 rounded-xl border border-primary/15 bg-background shadow-[0_10px_28px_rgba(15,23,42,0.08),inset_3px_0_0_rgba(20,184,166,0.82)]"
                />
              ) : null}
              <span className="relative z-10 inline-flex items-center gap-2">
                <tab.icon className="size-4" />
                {tab.name}
              </span>
            </TabsTrigger>
          )
        })}
      </TabsList>

      <div className="flex h-full w-full items-center justify-center rounded-2xl border bg-background p-6 font-medium text-muted-foreground shadow-sm">
        {settingsTabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            {tab.name} Content
          </TabsContent>
        ))}
      </div>
    </Tabs>
  )
}
