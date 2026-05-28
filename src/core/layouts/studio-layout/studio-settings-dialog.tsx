import { Bot, Home, Settings, User } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'

const settingsTabs = [
  { name: 'Home', value: 'home', icon: Home },
  { name: 'Profile', value: 'profile', icon: User },
  { name: 'Messages', value: 'messages', icon: Bot },
  { name: 'Settings', value: 'settings', icon: Settings },
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
      <TabsList className="grid min-w-32 shrink-0 grid-cols-1 gap-1 bg-transparent p-0">
        {settingsTabs.map((tab) => {
          const Icon = tab.icon
          const active = tab.value === activeTab

          return (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="relative justify-start overflow-hidden rounded-2xl border border-transparent px-3 py-2 data-[state=active]:border-white/55 data-[state=active]:bg-white/45 data-[state=active]:shadow-none"
            >
              {active ? (
                <motion.span
                  layoutId="studio-settings-active-tab"
                  className="absolute inset-0 -z-10 rounded-2xl bg-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]"
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 520, damping: 36 }
                  }
                />
              ) : null}
              <Icon className="me-2 size-5" />
              {tab.name}
            </TabsTrigger>
          )
        })}
      </TabsList>

      <div className="flex min-h-72 w-full items-center justify-center rounded-2xl border bg-background/70 font-medium text-muted-foreground">
        {settingsTabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            {tab.name} Content
          </TabsContent>
        ))}
      </div>
    </Tabs>
  )
}
