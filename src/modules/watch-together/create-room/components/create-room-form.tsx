import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { createRoomSchema, type CreateRoomFields } from '../schema'
import type { PostApiMediaParseUrl200 } from '@/core/api/generated/model'
import { usePostApiMediaParseUrl } from '@/core/api/generated/media/media'
import { usePostApiRooms } from '@/core/api/generated/rooms/rooms'
import { getApiErrorMessage } from '@/core/api/http/errors'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@/shared/ui'

export function CreateRoomForm() {
  const navigate = useNavigate()
  const [parsedMedia, setParsedMedia] = useState<PostApiMediaParseUrl200 | null>(null)
  const parseMutation = usePostApiMediaParseUrl()
  const createMutation = usePostApiRooms()
  const form = useForm<CreateRoomFields>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      url: '',
      title: '',
    },
  })

  async function parseUrl() {
    const valid = await form.trigger('url')

    if (!valid) {
      return
    }

    try {
      const url = form.getValues('url')
      const media = await parseMutation.mutateAsync({ data: { url } })
      setParsedMedia(media)
      toast.success('Video link recognized')
    } catch (error) {
      setParsedMedia(null)
      form.setError('url', {
        message: getApiErrorMessage(error, 'This video URL is not supported yet.'),
      })
    }
  }

  async function onSubmit(values: CreateRoomFields) {
    try {
      const response = await createMutation.mutateAsync({
        data: {
          url: values.url,
          title: values.title?.trim() || undefined,
        },
      })
      toast.success('Room created')
      await navigate({
        to: '/room/$id',
        params: {
          id: response.room.code,
        },
      })
    } catch (error) {
      form.setError('root', {
        message: getApiErrorMessage(error, 'Unable to create the room.'),
      })
    }
  }

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Create a watch room</CardTitle>
        <CardDescription>
          Paste a supported video link, preview the parsed media, then create a room to watch
          together.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video URL</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                      type="url"
                    />
                  </FormControl>
                  <FormDescription>YouTube, Vimeo, and TikTok links are supported.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Friday premiere night" />
                  </FormControl>
                  <FormDescription>Optional. You can leave this blank.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {parsedMedia ? <ParsedMediaPreview media={parsedMedia} /> : null}
            {form.formState.errors.root ? (
              <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
            ) : null}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                disabled={parseMutation.isPending}
                onClick={() => void parseUrl()}
              >
                {parseMutation.isPending ? 'Checking...' : 'Check link'}
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || createMutation.isPending}
              >
                {createMutation.isPending ? 'Creating...' : 'Create room'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

type ParsedMediaPreviewProps = {
  media: PostApiMediaParseUrl200
}

function ParsedMediaPreview({ media }: ParsedMediaPreviewProps) {
  return (
    <div className="rounded-lg border bg-muted/40 p-4 text-sm">
      <div className="font-medium text-foreground">Parsed media</div>
      <dl className="mt-3 grid gap-2 sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Provider</dt>
          <dd className="capitalize">{media.provider}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">External ID</dt>
          <dd className="break-all">{media.externalId}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-muted-foreground">Canonical URL</dt>
          <dd className="break-all">{media.canonicalUrl}</dd>
        </div>
      </dl>
    </div>
  )
}
