import { Check, Copy, Facebook, Mail, MessageCircle, Send, UserPlus } from 'lucide-react'
import { Popover as PopoverPrimitive } from 'radix-ui'
import { useState } from 'react'
import { toast } from 'sonner'
import type { GetApiRoomsByCode200 } from '@/core/api/generated/model'
import { apiUrl } from '@/shared/config/env'
import { cn } from '@/shared/lib/utils'
import { Button, glassSurfaceVariants } from '@/shared/ui'

type RoomInviteProps = {
  snapshot: GetApiRoomsByCode200
  /** 'media' renders the trigger as stage overlay chrome. */
  variant?: 'default' | 'media'
  onOpenChange?: (open: boolean) => void
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path
        d="M4 4l16 16M20 4L4 20"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

/**
 * The single invite/share action for a room. One popover gathers the copy
 * link, contact shortcuts, the join QR, and the current access rules.
 */
export function RoomInvite({ snapshot, variant = 'default', onOpenChange }: RoomInviteProps) {
  const [copied, setCopied] = useState(false)
  const code = snapshot.room.code
  const title = snapshot.room.title ?? snapshot.media.title ?? 'Room'
  const roomUrl = typeof window === 'undefined' ? '' : `${window.location.origin}/room/${code}`
  const qrCodeUrl = `${apiUrl}/api/rooms/${code}/share-qr`
  const shareText = `Join ${title} on Vewave`

  const networks = [
    {
      name: 'X',
      icon: XIcon,
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(roomUrl)}&text=${encodeURIComponent(shareText)}`,
      className: 'text-foreground',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(roomUrl)}`,
      className: 'text-[#1877F2]',
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${roomUrl}`)}`,
      className: 'text-[#25D366]',
    },
    {
      name: 'Telegram',
      icon: Send,
      href: `https://t.me/share/url?url=${encodeURIComponent(roomUrl)}&text=${encodeURIComponent(shareText)}`,
      className: 'text-[#26A5E4]',
    },
    {
      name: 'Email',
      icon: Mail,
      href: `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(roomUrl)}`,
      className: 'text-muted-foreground',
    },
  ]

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(roomUrl)
      setCopied(true)
      toast.success('Room link copied')
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Unable to copy link')
    }
  }

  return (
    <PopoverPrimitive.Root onOpenChange={onOpenChange}>
      <PopoverPrimitive.Trigger asChild>
        <Button
          type="button"
          size="sm"
          variant={variant === 'media' ? 'ghost' : 'default'}
          className={cn(
            variant === 'media' &&
              'text-media-foreground hover:bg-media-control hover:text-media-foreground',
          )}
        >
          <UserPlus className="size-4" />
          Invite
        </Button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="end"
          sideOffset={8}
          className={cn(
            glassSurfaceVariants({ role: 'menu', thickness: 'thin' }),
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 z-50 w-80 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 text-popover-foreground',
          )}
        >
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-sm font-medium">Invite to {title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Anyone with the link joins as a viewer
                {snapshot.room.visibility === 'private' ? ' of this private room' : ''}.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              <span className="min-w-0 flex-1 truncate">{roomUrl}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 shrink-0"
                onClick={() => void copyLink()}
              >
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                <span className="sr-only">Copy link</span>
              </Button>
            </div>

            <div className="grid grid-cols-5 gap-1">
              {networks.map((network) => (
                <a
                  key={network.name}
                  href={network.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col items-center gap-1.5 rounded-md p-2 text-xs text-muted-foreground transition-colors hover:bg-accent motion-reduce:transition-none"
                >
                  <network.icon className={cn('size-5', network.className)} />
                  {network.name}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3 rounded-md bg-muted/30 p-3">
              <img
                src={qrCodeUrl}
                alt={`QR code for room ${code}`}
                className="size-20 shrink-0 rounded-md bg-white p-1"
                width={80}
                height={80}
              />
              <p className="text-xs text-muted-foreground">
                Scan to join on another device. Room code{' '}
                <span className="font-mono text-foreground">{code}</span>.
              </p>
            </div>
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
