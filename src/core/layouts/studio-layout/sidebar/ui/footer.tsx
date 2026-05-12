import { SidebarSettingsDialog } from './settings'
import {
  Button,
  Sheet,
  SheetTrigger,
  SheetContent,
  Dialog,
  DialogTrigger,
  DialogTitle,
  DialogContent,
} from '@/shared/ui'
import { cn } from '@/shared/lib/utils'

export function SidebarFooter({ ...props }) {
  return (
    <div className={cn('space-y-2 p-2')} {...props}>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" className="w-full flex justify-start">
            Settings
          </Button>
        </DialogTrigger>
        <DialogContent className="min-w-[60vw] min-h-[80vh]">
          <DialogTitle>Settings</DialogTitle>
          <SidebarSettingsDialog />
        </DialogContent>
      </Dialog>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" className="w-full flex justify-start">
            Feedback
          </Button>
        </SheetTrigger>
        <SheetContent side="right"></SheetContent>
      </Sheet>
    </div>
  )
}
