import { useState } from 'react'
import { Plus, Radio, Server } from 'lucide-react'
import { SidebarItem } from '@/components/sidebar'
import { CreateRoomForm } from '@/modules/watch-together/create-room'
import { CreateServerForm } from '@/modules/servers'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui'

type NewSidebarDialogKind = 'room' | 'server'

export function NewSidebarMenu({
  onOpenChange,
  open,
}: {
  onOpenChange: (open: boolean) => void
  open: boolean
}) {
  const [dialogKind, setDialogKind] = useState<NewSidebarDialogKind | null>(null)

  function chooseKind(kind: NewSidebarDialogKind) {
    setDialogKind(kind)
  }

  return (
    <>
      <DropdownMenu open={open} onOpenChange={onOpenChange}>
        <DropdownMenuTrigger asChild>
          <SidebarItem type="button" icon={<Plus />} value="new" aria-expanded={open}>
            New
          </SidebarItem>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          side="right"
          sideOffset={12}
          className="w-44 rounded-xl border-sidebar-border bg-popover p-1.5 shadow-lg"
        >
          <DropdownMenuItem
            onSelect={() => chooseKind('room')}
            className="gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium"
          >
            <Radio className="size-4 text-muted-foreground" aria-hidden />
            Room
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => chooseKind('server')}
            className="gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium"
          >
            <Server className="size-4 text-muted-foreground" aria-hidden />
            Server
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={dialogKind !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setDialogKind(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          {dialogKind === 'room' ? (
            <>
              <DialogHeader>
                <DialogTitle>New room</DialogTitle>
                <DialogDescription>Add a room name and video link, then open it.</DialogDescription>
              </DialogHeader>
              <CreateRoomForm variant="plain" onCreated={() => setDialogKind(null)} />
            </>
          ) : dialogKind === 'server' ? (
            <>
              <DialogHeader>
                <DialogTitle>New server</DialogTitle>
                <DialogDescription>Create a workspace for rooms on the backend.</DialogDescription>
              </DialogHeader>
              <CreateServerForm variant="plain" onCreated={() => setDialogKind(null)} />
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}
