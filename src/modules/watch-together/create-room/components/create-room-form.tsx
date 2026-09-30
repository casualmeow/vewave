import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useCreateRoom } from '../hooks/use-create-room'
import { createRoomSchema, type CreateRoomFields } from '../schema'
import type { PostApiRooms200 } from '@/core/api/generated/model'
import {
  Button,
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
  GlassSurface,
  Input,
} from '@/shared/ui'

type CreateRoomFormProps = {
  onCreated?: (room: PostApiRooms200) => void
  variant?: 'card' | 'compact' | 'firstRun' | 'plain'
}

export function CreateRoomForm({ onCreated, variant = 'card' }: CreateRoomFormProps) {
  const creation = useCreateRoom({ onCreated })
  const compact = variant === 'compact'
  const form = useForm<CreateRoomFields>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: { url: '', title: '' },
  })
  const checking = creation.draft.videos.some((video) => video.status === 'loading')

  async function validateVideoLink() {
    if (!(await form.trigger('url'))) return false
    const value = form.getValues('url')
    const valid = await creation.queue.replaceAll(value)
    if (form.getValues('url') !== value) return false
    if (!valid) {
      form.setError('url', {
        message:
          creation.queue.getSnapshot().videos.find((video) => video.error)?.error ??
          'Check the video links.',
      })
    } else {
      form.clearErrors('url')
    }
    return valid
  }

  async function onSubmit(values: CreateRoomFields) {
    if (creation.phase === 'created' || (await validateVideoLink()))
      await creation.submit(values.title ?? '')
  }

  const content = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={compact ? 'space-y-4' : 'space-y-6'}>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Room name <span className="font-normal text-muted-foreground">(optional)</span>
              </FormLabel>
              <FormControl>
                <Input {...field} readOnly={creation.locked} placeholder="Friday movie night" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video links</FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  readOnly={creation.locked}
                  className="border-input placeholder:text-muted-foreground focus-visible:ring-ring/50 min-h-24 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2"
                  placeholder={'https://youtube.com/watch?v=...\nhttps://youtu.be/...'}
                  rows={compact ? 2 : 3}
                  onBlur={() => {
                    field.onBlur()
                    if (field.value.trim() && !creation.locked) void validateVideoLink()
                  }}
                  onChange={(event) => {
                    field.onChange(event)
                    creation.queue.reset()
                  }}
                />
              </FormControl>
              <FormDescription>
                {checking
                  ? 'Checking links…'
                  : 'Add up to 20 videos, one link per line. YouTube plays in the room. Vimeo and TikTok open on their own sites.'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {creation.error && (
          <p role="alert" className="text-sm text-destructive">
            {creation.error}
          </p>
        )}
        <Button
          type="submit"
          className={compact ? 'w-full' : 'w-full sm:w-fit'}
          disabled={form.formState.isSubmitting || creation.isPending || checking}
        >
          {creation.phase === 'creating'
            ? 'Creating room…'
            : creation.phase === 'opening'
              ? 'Opening room…'
              : creation.phase === 'created'
                ? 'Open your room'
                : 'Create and open room'}
        </Button>
      </form>
    </Form>
  )

  if (variant === 'plain' || compact) return content
  return (
    <GlassSurface
      role="form"
      elevation="embedded"
      className="flex w-full max-w-3xl flex-col gap-6 rounded-xl py-6"
    >
      {variant !== 'firstRun' && (
        <CardHeader>
          <CardTitle>Start a room</CardTitle>
          <CardDescription>Add something to watch, then invite your friends.</CardDescription>
        </CardHeader>
      )}
      <CardContent>{content}</CardContent>
    </GlassSurface>
  )
}
