import { createFileRoute } from '@tanstack/react-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { EllipsisVertical } from 'lucide-react'
import {
  Button,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Form,
  FormControl,
  FormMessage,
  FormDescription,
  FormField,
  FormLabel,
  FormItem,
} from '@/shared/ui'
import EditPlayer from '@/shared/ui/edit-player'
import { type VideoEntity } from '@/api/video'
import { AccessSelector } from '@/shared/ui/edit-acess-selector'
import { ThumbnailManager } from '@/modules/thumbnail'

export const Route = createFileRoute('/video/$id/edit/')({
  component: VideoEditForm,
})

const formSchema = z.object({
  name: z.string().max(100),
  description: z.string().max(500).optional(),
  playlists: z.string().optional(),
  thumbnail: z.instanceof(FileList).optional(),
  video: z.instanceof(FileList).optional(),
  access: z.enum(['Public', 'Unlisted', 'Private']),
})

type FormFields = z.infer<typeof formSchema>

const VideoData: VideoEntity = {
  id: '1',
  name: 'Sample Video',
  description: 'This is a sample video description.',
  src: 'https://www.w3schools.com/html/mov_bbb.mp4',
  thumbnail: 'https://www.w3schools.com/html/pic_trulli.jpg',
  playlists: ['Playlist 1', 'Playlist 2', 'Playlist 3'],
  access: 'Private',
  createdAt: new Date(),
  updatedAt: new Date(),
}

function VideoEditForm() {
  const form = useForm<FormFields>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      access: VideoData.access,
    },
  })

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    setValue,
    reset,
  } = form

  const onSubmit = async (data: FormFields) => {
    console.log('Form data:', data)
  }

  const handleDownloadVideo = () => {
    const a = document.createElement('a')
    a.href = VideoData.src
    a.download = 'video.mp4'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleUpload = (file: File, field: 'thumbnail' | 'video') => {
    const fileList = new DataTransfer()
    fileList.items.add(file)
    setValue(field, fileList.files, { shouldValidate: true })
  }

  const handleAccessChange = (newAccess: 'Public' | 'Unlisted' | 'Private') => {
    setValue('access', newAccess, { shouldValidate: true })
  }

  const handleUndoChanges = () => {
    reset({
      name: VideoData.name,
      description: VideoData.description,
      access: VideoData.access,
    })
  }

  return (
    <div className="h-full w-full flex">
      <Form {...form}>
        <form
          className="w-full h-full flex flex-row justify-between"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="leftside flex flex-col flex-3/4 gap-5">
            <h2 className="text-2xl font-bold pt-1">Video details</h2>
            <div className="grid w-full pr-6 items-center gap-4">
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
                      Used to identify the user during registration. Displayed on-screen and stored
                      in the video metadata.
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
                        <SelectTrigger className="w-full h-10">
                          <SelectValue placeholder="Select a playlist" />
                        </SelectTrigger>
                        <SelectContent>
                          {VideoData.playlists?.map((playlist, index) => (
                            <SelectItem key={index} value={playlist}>
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
          </div>

          <div className="rightside flex flex-col gap-5 flex-1/4">
            <div className="flex flex-row gap-1 self-end">
              <Button type="button" variant="secondary" onClick={handleUndoChanges}>
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
                  <DropdownMenuItem>Share</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDownloadVideo}>Download</DropdownMenuItem>
                  <DropdownMenuItem>Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <EditPlayer src={VideoData.src} />

            <AccessSelector initialAccess={VideoData.access} onChange={handleAccessChange} />
          </div>
        </form>
      </Form>
    </div>
  )
}
