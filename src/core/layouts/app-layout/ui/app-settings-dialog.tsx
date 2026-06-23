import { Palette, Settings2, SlidersHorizontal } from 'lucide-react'

import { AppearanceSettingsEntry } from '@/modules/appearance'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/ui'

const workspaceSettings = [
  ['History retention', 'Keep recent room visits visible in the app sidebar.'],
  ['Room defaults', 'New rooms start private until you share the invite code.'],
  ['Server preference', 'Use the closest sync relay unless a room requires another hub.'],
] as const

export function AppSettingsDialog() {
  return (
    <DialogContent className="max-h-[calc(100svh-2rem)] overflow-hidden p-0 sm:max-w-[min(72rem,calc(100vw-2rem))]">
      <DialogHeader className="px-6 pt-6">
        <DialogTitle>Dashboard settings</DialogTitle>
        <DialogDescription>
          Configure workspace behavior and the visual system used across Vewave.
        </DialogDescription>
      </DialogHeader>

      <Tabs defaultValue="theme" className="min-h-0 gap-0 px-6 pb-6">
        <TabsList className="grid w-full grid-cols-2 sm:w-fit">
          <TabsTrigger value="workspace">
            <Settings2 className="size-4" />
            Workspace
          </TabsTrigger>
          <TabsTrigger value="theme">
            <Palette className="size-4" />
            Theme Studio
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="workspace"
          className="mt-4 max-h-[min(70svh,42rem)] overflow-y-auto pr-1"
        >
          <div className="grid gap-4 md:grid-cols-3">
            {workspaceSettings.map(([title, description]) => (
              <Card key={title}>
                <CardHeader>
                  <SlidersHorizontal className="size-5 text-primary" />
                  <CardTitle className="text-base">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="theme" className="mt-4 max-h-[min(70svh,42rem)] overflow-y-auto pr-1">
          <AppearanceSettingsEntry closeOnNavigate />
        </TabsContent>
      </Tabs>
    </DialogContent>
  )
}
