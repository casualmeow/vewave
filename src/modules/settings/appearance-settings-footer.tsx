import { MoreHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import { useAccountAppearanceSave } from '@/modules/appearance/use-account-appearance-save'
import { useAppearance } from '@/shared/theme'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui'

export function AppearanceSettingsFooter() {
  const { accountId, status, retry } = useAccountAppearanceSave()
  const { resetAppearance } = useAppearance()
  const message = !accountId
    ? 'Appearance saved on this device'
    : status === 'error'
      ? 'Account sync failed. Your changes are kept on this device.'
      : status === 'saved'
        ? 'Appearance saved to your account'
        : 'Saving appearance…'

  return (
    <div className="flex min-h-8 items-center justify-between gap-3">
      <p
        role="status"
        aria-label="Appearance sync"
        className="text-xs leading-5 text-muted-foreground"
      >
        {message}
      </p>
      <div className="flex shrink-0 items-center gap-1">
        {status === 'error' && (
          <Button type="button" size="sm" variant="ghost" onClick={retry}>
            Retry
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="icon" aria-label="More appearance actions">
              <MoreHorizontal aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={() => {
                resetAppearance()
                toast.success('Theme, glass, and background restored to defaults')
              }}
            >
              Restore all appearance defaults
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
