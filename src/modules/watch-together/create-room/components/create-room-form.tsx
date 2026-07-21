import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { createRoomSchema, getCreateRoomVideoLinks, type CreateRoomFields } from '../schema'
import type { PostApiMediaParseUrl200, PostApiRooms200 } from '@/core/api/generated/model'
import { usePostApiMediaParseUrl } from '@/core/api/generated/media/media'
import { usePostApiRooms } from '@/core/api/generated/rooms/rooms'
import { getApiErrorMessage } from '@/core/api/http/errors'
import { useAuthStore } from '@/modules/auth'
import { rememberCreatedRoom } from '@/modules/watch-together/room'
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

type CreateRoomFormProps = {
  onCreated?: (room: PostApiRooms200) => void
  variant?: 'card' | 'compact' | 'firstRun' | 'plain'
}

export function CreateRoomForm({ onCreated, variant = 'card' }: CreateRoomFormProps) {
  const navigate = useNavigate()
  const compact = variant === 'compact'
  const userId = useAuthStore((state) => state.user?.id ?? null)
  const [parsedMedia, setParsedMedia] = useState<Array<PostApiMediaParseUrl200>>([])
  const [validatedUrl, setValidatedUrl] = useState<string | null>(null)
  const parseMutation = usePostApiMediaParseUrl()
  const createMutation = usePostApiRooms()
  const form = useForm<CreateRoomFields>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      url: '',
      title: '',
    },
  })

  function resetParsedMedia() {
    setParsedMedia([])
    setValidatedUrl(null)
  }

  async function validateVideoLink() {
    const valid = await form.trigger('url')

    if (!valid) {
      resetParsedMedia()
      return false
    }

    const videoLinks = getCreateRoomVideoLinks(form.getValues('url'))
    const validationKey = videoLinks.join('\n')

    if (parsedMedia.length === videoLinks.length && validatedUrl === validationKey) {
      return true
    }

    try {
      const mediaItems: Array<PostApiMediaParseUrl200> = []

      for (const url of videoLinks) {
        mediaItems.push(await parseMutation.mutateAsync({ data: { url } }))
      }

      if (getCreateRoomVideoLinks(form.getValues('url')).join('\n') !== validationKey) {
        return false
      }

      setParsedMedia(mediaItems)
      setValidatedUrl(validationKey)
      form.clearErrors('url')

      return true
    } catch (error) {
      resetParsedMedia()
      form.setError('url', {
        message: getApiErrorMessage(error, 'Unsupported link.'),
      })

      return false
    }
  }

  async function onSubmit(values: CreateRoomFields) {
    const linkIsSupported = await validateVideoLink()

    if (!linkIsSupported) {
      return
    }

    try {
      const videoLinks = getCreateRoomVideoLinks(values.url)
      const response = await createMutation.mutateAsync({
        data: {
          url: videoLinks[0],
          urls: videoLinks,
          title: values.title?.trim() || 'Untitled room',
        },
      })
      rememberCreatedRoom(response, userId)
      toast.success('Room created')
      onCreated?.(response)
      await navigate({
        to: '/room/$code',
        params: {
          code: response.room.code,
        },
      })
    } catch (error) {
      form.setError('root', {
        message: getApiErrorMessage(error, 'Unable to create and open the room.'),
      })
    }
  }

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={compact ? 'space-y-4' : 'space-y-6'}>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Room name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Friday movie night" />
              </FormControl>
              {compact ? null : (
                <FormDescription>This name will be shown to invited viewers.</FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video link</FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive min-h-24 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  placeholder="https://youtube.com/watch?v=...\nhttps://youtu.be/..."
                  rows={compact ? 2 : 3}
                  onBlur={(event) => {
                    field.onBlur()

                    if (event.currentTarget.value.trim()) {
                      void validateVideoLink()
                    }
                  }}
                  onChange={(event) => {
                    field.onChange(event)
                    resetParsedMedia()
                  }}
                />
              </FormControl>
              <VideoLinkDescription isValidating={parseMutation.isPending} media={parsedMedia} />
              <FormMessage />
            </FormItem>
          )}
        />
        {form.formState.errors.root ? (
          <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
        ) : null}
        <div className="grid gap-2">
          <Button
            type="submit"
            className={compact ? 'w-full' : 'w-full sm:w-fit'}
            disabled={
              form.formState.isSubmitting || parseMutation.isPending || createMutation.isPending
            }
          >
            {parseMutation.isPending
              ? 'Validating link…'
              : createMutation.isPending
                ? 'Creating room…'
                : 'Create and open room'}
          </Button>
          {compact ? null : (
            <p className="text-xs leading-5 text-muted-foreground">
              After creation, the room opens with the video source, invite link, and synced playback
              controls.
            </p>
          )}
        </div>
      </form>
    </Form>
  )

  if (variant === 'plain' || variant === 'compact') {
    return formContent
  }

  if (variant === 'firstRun') {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">{formContent}</CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Room details</CardTitle>
        <CardDescription>Add a room name and video link.</CardDescription>
      </CardHeader>
      <CardContent>{formContent}</CardContent>
    </Card>
  )
}

type VideoLinkDescriptionProps = {
  isValidating: boolean
  media: Array<PostApiMediaParseUrl200>
}

function VideoLinkDescription({ isValidating, media }: VideoLinkDescriptionProps) {
  if (isValidating) {
    return <FormDescription>Validating link…</FormDescription>
  }

  if (media.length > 1) {
    return (
      <FormDescription>
        {media.length} videos found. They will be saved as a room playlist.
      </FormDescription>
    )
  }

  if (media[0]) {
    return <FormDescription>Video found: {getProviderLabel(media[0].provider)}</FormDescription>
  }

  return (
    <FormDescription>
      YouTube, Vimeo, and TikTok links are supported. Paste one link per line for a playlist.
    </FormDescription>
  )
}

function getProviderLabel(provider: string) {
  return `${provider.slice(0, 1).toUpperCase()}${provider.slice(1)}`
}
