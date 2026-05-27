import { useVideoEditForm } from '../hooks/useVideoEditForm'
import { VideoEditDetailsSection, VideoEditSidebar } from '../ui'
import { Form } from '@/shared/ui'

export interface VideoEditFormProps {
  videoId: string
}

export function VideoEditForm({ videoId }: VideoEditFormProps) {
  const {
    form,
    control,
    handleSubmit,
    isSubmitting,
    onSubmit,
    handleAccessChange,
    handleUndoChanges,
    handleDownloadVideo,
    handleShareVideo,
  } = useVideoEditForm()

  return (
    <div className="w-full">
      <Form {...form}>
        <div className="mb-6 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
            Studio video
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
                Edit video
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">Video ID: {videoId}</p>
            </div>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              Review metadata, update visibility, and keep the preview panel close on mobile.
            </p>
          </div>
        </div>
        <form
          className="grid w-full gap-6 xl:grid-cols-[minmax(0,1fr)_23rem]"
          onSubmit={handleSubmit(onSubmit)}
        >
          <VideoEditDetailsSection control={control} />

          <VideoEditSidebar
            isSubmitting={isSubmitting}
            onAccessChange={handleAccessChange}
            onUndo={handleUndoChanges}
            onDownload={handleDownloadVideo}
            onShare={handleShareVideo}
          />
        </form>
      </Form>
    </div>
  )
}
