import { useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'

import type { PostApiServers200Server } from '@/core/api/generated/model'
import {
  getGetApiServersCommunityQueryKey,
  getGetApiServersQueryKey,
  usePostApiServers,
} from '@/core/api/generated/servers/servers'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@/shared/ui'
import { cn } from '@/shared/lib/utils'

type ServerVisibility = 'private' | 'invite' | 'community'

type CreateServerFormProps = {
  className?: string
  onCreated?: (server: PostApiServers200Server) => void
  variant?: 'card' | 'compact' | 'plain'
}

const visibilityOptions: Array<{
  label: string
  value: ServerVisibility
  description: string
}> = [
  {
    label: 'Private',
    value: 'private',
    description: 'Invite teammates manually and keep the server off community lists.',
  },
  {
    label: 'Invite link',
    value: 'invite',
    description: 'Prepare a shareable server space for rooms and watch sessions.',
  },
  {
    label: 'Community',
    value: 'community',
    description: 'List this server in Community discovery for other users to join.',
  },
]

export function CreateServerForm({
  className,
  onCreated,
  variant = 'plain',
}: CreateServerFormProps) {
  const queryClient = useQueryClient()
  const createServerMutation = usePostApiServers()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState<ServerVisibility>('private')
  const [error, setError] = useState<string | null>(null)
  const compact = variant === 'compact'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedName = name.trim()

    if (!trimmedName) {
      setError('Add a server name.')
      return
    }

    try {
      const response = await createServerMutation.mutateAsync({
        data: {
          name: trimmedName,
          description: description.trim() || undefined,
          visibility,
        },
      })

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: getGetApiServersQueryKey() }),
        queryClient.invalidateQueries({ queryKey: getGetApiServersCommunityQueryKey() }),
      ])
      setName('')
      setDescription('')
      setVisibility('private')
      setError(null)
      toast.success('Server created')
      onCreated?.(response.server)
    } catch {
      setError('Unable to create server.')
    }
  }

  const form = (
    <form className={cn(compact ? 'space-y-4' : 'space-y-5', className)} onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="server-name">Server name</Label>
        <Input
          id="server-name"
          value={name}
          placeholder="Cinema circle"
          onChange={(event) => {
            setName(event.currentTarget.value)
            setError(null)
          }}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="server-description">Description</Label>
        <textarea
          id="server-description"
          value={description}
          className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 min-h-20 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="A server for weekly watch rooms."
          rows={compact ? 2 : 3}
          onChange={(event) => setDescription(event.currentTarget.value)}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="server-visibility">Server access</Label>
        <select
          id="server-visibility"
          value={visibility}
          className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border px-3 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px]"
          onChange={(event) => setVisibility(event.currentTarget.value as ServerVisibility)}
        >
          {visibilityOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {compact ? null : (
          <p className="text-xs leading-5 text-muted-foreground">
            {visibilityOptions.find((option) => option.value === visibility)?.description}
          </p>
        )}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button
        type="submit"
        className={cn(compact ? 'w-full' : 'w-fit')}
        disabled={createServerMutation.isPending}
      >
        {createServerMutation.isPending ? 'Creating server...' : 'Create server'}
      </Button>
    </form>
  )

  if (variant === 'card') {
    return (
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Server details</CardTitle>
          <CardDescription>Create a server on the Vewave backend.</CardDescription>
        </CardHeader>
        <CardContent>{form}</CardContent>
      </Card>
    )
  }

  return form
}
