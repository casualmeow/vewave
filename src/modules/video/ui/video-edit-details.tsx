import { VideoData } from '../constants'
import type { Control } from 'react-hook-form'
import type { VideoEditFormFields } from '../helpers'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui'
import { ThumbnailManager } from '@/modules/thumbnail'

interface VideoEditDetailsSectionProps {
  control: Control<VideoEditFormFields>
}

export const VideoEditDetailsSection = ({ control }: VideoEditDetailsSectionProps) => {
  return (
    <section className="min-w-0 flex-1 space-y-5 xl:basis-3/4">
      <h2 className="pt-1 text-2xl font-bold">Video details</h2>

      <div className="grid w-full min-w-0 items-center gap-4 xl:pr-6">
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Video name"
                  tooltip="Used to identify the user during registration. Displayed on-screen and stored in the video metadata."
                />
              </FormControl>
              <FormDescription>
                Used to identify the user during registration. Displayed on-screen and stored in the
                video metadata.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Description (optional)"
                  tooltip="A brief summary or additional details about the video."
                />
              </FormControl>
              <FormDescription>
                A brief summary or additional details about the video.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-2">
          <div className="text-sm font-medium">Icon</div>
          <div className="text-muted-foreground text-sm">
            Choose an icon that will involve other users.
          </div>
        </div>

        <ThumbnailManager />

        <FormField
          control={control}
          name="playlists"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Playlists</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="Select a playlist" />
                  </SelectTrigger>
                  <SelectContent>
                    {VideoData.playlists?.map((playlist) => (
                      <SelectItem key={playlist} value={playlist}>
                        {playlist}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>Choose a playlist to add your video to.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </section>
  )
}
