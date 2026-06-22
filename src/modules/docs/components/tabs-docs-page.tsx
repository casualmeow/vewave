import { Activity, Bell, Settings2 } from 'lucide-react'

import { componentDocs } from '../content/component-docs-content'
import { ComponentDocPage } from './component-doc-page'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/tabs'

export function TabsDocsPage() {
  return <ComponentDocPage doc={componentDocs.tabs} showcase={<TabsDocsShowcase />} />
}

function TabsDocsShowcase() {
  return (
    <div className="grid gap-5 rounded-lg bg-[radial-gradient(circle_at_20%_8%,color-mix(in_srgb,var(--primary)_20%,transparent),transparent_28%),linear-gradient(135deg,var(--card),var(--muted))] p-5 lg:grid-cols-[0.9fr_1.1fr]">
      <Tabs defaultValue="activity" design="liquidGlass" motion="fluid" fluidPreset="balanced">
        <TabsList>
          <TabsTrigger value="activity" icon={<Activity className="size-4" />}>
            Activity
          </TabsTrigger>
          <TabsTrigger value="alerts" icon={<Bell className="size-4" />} badge="3">
            Alerts
          </TabsTrigger>
          <TabsTrigger value="settings" icon={<Settings2 className="size-4" />}>
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activity" inset>
          <Panel
            title="Activity"
            body="Liquid tabs use one moving active material behind sharp trigger content."
          />
        </TabsContent>
        <TabsContent value="alerts" inset>
          <Panel
            title="Alerts"
            body="Badges stay above the glass layer and move with the trigger shell."
          />
        </TabsContent>
        <TabsContent value="settings" inset>
          <Panel
            title="Settings"
            body="Use inset content when docs or settings panels need a framed reading area."
          />
        </TabsContent>
      </Tabs>

      <Tabs
        defaultValue="profile"
        design="telegramGlass"
        motion="soft"
        orientation="vertical"
        className="min-w-0"
      >
        <div className="grid gap-3 sm:grid-cols-[11rem_minmax(0,1fr)]">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>
          <div className="min-w-0">
            <TabsContent value="profile" inset>
              <Panel
                title="Vertical"
                body="Vertical orientation is useful for compact settings navigation."
              />
            </TabsContent>
            <TabsContent value="security" inset>
              <Panel
                title="Security"
                body="Telegram glass keeps the surface calmer than the full liquid variant."
              />
            </TabsContent>
            <TabsContent value="billing" inset>
              <Panel
                title="Billing"
                body="The public value/defaultValue API stays Radix-compatible."
              />
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  )
}

function Panel({ body, title }: { body: string; title: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/60 p-4 text-sm leading-6 text-muted-foreground shadow-sm backdrop-blur">
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="mt-1">{body}</p>
    </div>
  )
}
