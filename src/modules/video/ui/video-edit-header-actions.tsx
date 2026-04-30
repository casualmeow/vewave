import { EllipsisVertical } from 'lucide-react'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui'

interface VideoEditHeaderActionsProps {
  isSubmitting: boolean
  onUndo: () => void
  onDownload: () => void
  onShare: () => void
}

export const VideoEditHeaderActions = ({
  isSubmitting,
  onUndo,
  onDownload,
  onShare,
}: VideoEditHeaderActionsProps) => {
  return (
    <div className="flex flex-row gap-1 self-end">
      <Button type="button" variant="secondary" onClick={onUndo}>
        Undo changes
      </Button>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Submit'}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <EllipsisVertical />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuItem onClick={onShare}>Share</DropdownMenuItem>
          <DropdownMenuItem onClick={onDownload}>Download</DropdownMenuItem>
          <DropdownMenuItem>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
